/**
 * Script to sync environment variables from .env.local to Convex
 * 
 * This script reads .env.local and automatically sets the relevant variables
 * in Convex that are used by convex/ backend functions.
 * 
 * Usage: pnpm sync:env
 * 
 * Note: This only syncs variables that are actually used in convex/ functions.
 * NEXT_PUBLIC_* variables are NOT synced (they're for Next.js client-side).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Variables that should be synced to Convex (used in convex/ functions)
const CONVEX_ENV_VARS = [
  // Convex Auth
  'SITE_URL',
  'CONVEX_SITE_URL',
  'AUTH_RESEND_KEY',
  'JWT_PRIVATE_KEY',
  'JWKS',
  
  // External APIs
  'GOOGLE_TRANSLATE_API_KEY',
  'WORDPRESS_URL',
  'WORDPRESS_APP_USERNAME',
  'WORDPRESS_APP_PASSWORD',
  'FACEBOOK_PAGE_ID',
  'FACEBOOK_ACCESS_TOKEN',
  'INSTAGRAM_BUSINESS_ACCOUNT_ID',
  'INSTAGRAM_ACCESS_TOKEN',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'MATCHPFOTE_API_KEY',
  'MATCHPFOTE_API_URL',
] as const;

// Variables to skip (not used in convex/ or are placeholders)
const SKIP_PATTERNS = [
  /^NEXT_PUBLIC_/,  // Client-side variables
  /^CONVEX_DEPLOYMENT$/,  // Managed by Convex CLI
  /^CONVEX_URL$/,  // Managed by Convex CLI
];

// Placeholder values that should be skipped
const PLACEHOLDER_VALUES = [
  '<page-id>',
  '<access-token>',
  '<account-id>',
  '<api-key>',
  '<api-secret>',
  '<access-token-secret>',
];

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_VALUES.some(placeholder => 
    value.trim() === placeholder || value.trim().startsWith('<')
  );
}

function shouldSkip(key: string): boolean {
  return SKIP_PATTERNS.some(pattern => pattern.test(key));
}

function parseEnvFile(filePath: string): Map<string, string> {
  const envVars = new Map<string, string>();
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Parse KEY=VALUE
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Skip if empty or placeholder
      if (!value || isPlaceholder(value)) {
        continue;
      }
      
      envVars.set(key, value);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`❌ Error: ${filePath} not found`);
      process.exit(1);
    }
    throw error;
  }
  
  return envVars;
}

function setConvexEnv(key: string, value: string, dryRun: boolean = false): boolean {
  try {
    if (dryRun) {
      console.log(`  [DRY RUN] Would set: ${key}`);
      return true;
    }
    
    // Escape value for shell
    const escapedValue = value.replace(/'/g, "'\\''");
    const command = `npx convex env set ${key} '${escapedValue}'`;
    
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to set ${key}: ${(error as Error).message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const force = args.includes('--force') || args.includes('-f');
  
  console.log('🔄 Syncing environment variables from .env.local to Convex...\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }
  
  const envFilePath = join(process.cwd(), '.env.local');
  const envVars = parseEnvFile(envFilePath);
  
  console.log(`📖 Found ${envVars.size} variables in .env.local\n`);
  
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  
  // Sync relevant variables
  for (const key of CONVEX_ENV_VARS) {
    if (shouldSkip(key)) {
      skipped++;
      continue;
    }
    
    const value = envVars.get(key);
    
    if (!value) {
      // Variable not in .env.local, skip
      continue;
    }
    
    console.log(`📤 Syncing ${key}...`);
    
    if (setConvexEnv(key, value, dryRun)) {
      if (!dryRun) {
        console.log(`  ✅ Set ${key}`);
      }
      synced++;
    } else {
      failed++;
    }
  }
  
  // Check for variables in .env.local that might be relevant but not in our list
  const unknownVars: string[] = [];
  for (const [key] of envVars) {
    if (shouldSkip(key)) continue;
    if (!CONVEX_ENV_VARS.includes(key as any)) {
      // Check if it looks like it might be a Convex variable
      // (contains API, KEY, TOKEN, or is a known pattern)
      const looksLikeConvexVar = (
        key.includes('API') || 
        key.includes('KEY') || 
        key.includes('TOKEN') ||
        key.includes('SECRET') ||
        key === 'SITE_URL' ||
        key === 'CONVEX_SITE_URL'
      );
      
      if (looksLikeConvexVar) {
        unknownVars.push(key);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  ✅ Synced: ${synced}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed}`);
  }
  
  if (unknownVars.length > 0 && !dryRun) {
    console.log(`\n⚠️  Found ${unknownVars.length} variable(s) in .env.local that might need syncing:`);
    unknownVars.forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('\n💡 If these are used in convex/ functions, add them to CONVEX_ENV_VARS in this script.');
  }
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to actually sync the variables.');
  } else {
    console.log('\n✨ Done! Variables have been synced to Convex.');
    console.log('💡 You can verify with: npx convex env list');
  }
}

main();

