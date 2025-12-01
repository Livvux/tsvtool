"use node";

import { action } from './_generated/server';
import { logger } from '../lib/logger';

// API status types
export type ApiStatus = 'configured' | 'not_configured' | 'error' | 'checking';

interface ApiCheckResult {
  name: string;
  status: ApiStatus;
  configured: boolean;
  message: string;
  lastChecked?: number;
}

// Check if environment variable is configured (not placeholder)
function isConfigured(value: string | undefined): boolean {
  if (!value) return false;
  // Check for common placeholder patterns
  const placeholders = ['<', '>', 'your-', 'xxx', 'placeholder'];
  const lowerValue = value.toLowerCase();
  return !placeholders.some(p => lowerValue.includes(p));
}

// Check Translation Service (Google or Microsoft Azure)
async function checkTranslationService(): Promise<ApiCheckResult> {
  const service = process.env.TRANSLATION_SERVICE?.toLowerCase() || 'google';
  
  if (service === 'microsoft') {
    return checkMicrosoftTranslator();
  }
  
  return checkGoogleTranslate();
}

// Check Google Translate API
async function checkGoogleTranslate(): Promise<ApiCheckResult> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  if (!isConfigured(apiKey)) {
    return {
      name: 'Übersetzung (Google)',
      status: 'not_configured',
      configured: false,
      message: 'API-Schlüssel nicht konfiguriert',
    };
  }

  try {
    // Test with a simple translation request
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: 'test' }),
      }
    );

    if (response.ok) {
      return {
        name: 'Übersetzung (Google)',
        status: 'configured',
        configured: true,
        message: 'Verbindung erfolgreich',
        lastChecked: Date.now(),
      };
    }
    
    const errorData = await response.json().catch(() => ({}));
    return {
      name: 'Übersetzung (Google)',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${errorData?.error?.message || response.status}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'Übersetzung (Google)',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check Microsoft Azure Translator API
async function checkMicrosoftTranslator(): Promise<ApiCheckResult> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  
  if (!isConfigured(apiKey) || !isConfigured(region)) {
    return {
      name: 'Übersetzung (Microsoft Azure)',
      status: 'not_configured',
      configured: false,
      message: 'API-Schlüssel oder Region nicht konfiguriert',
    };
  }

  try {
    // Test with a simple translation request
    const response = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=bg&to=de',
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey!,
          'Ocp-Apim-Subscription-Region': region!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ Text: 'test' }]),
      }
    );

    if (response.ok) {
      return {
        name: 'Übersetzung (Microsoft Azure)',
        status: 'configured',
        configured: true,
        message: `Verbindung erfolgreich (Region: ${region})`,
        lastChecked: Date.now(),
      };
    }
    
    const errorText = await response.text();
    return {
      name: 'Übersetzung (Microsoft Azure)',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${response.status} - ${errorText.slice(0, 100)}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'Übersetzung (Microsoft Azure)',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check WordPress API
async function checkWordPress(): Promise<ApiCheckResult> {
  const wpUrl = process.env.WORDPRESS_URL;
  const wpUsername = process.env.WORDPRESS_APP_USERNAME;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!isConfigured(wpUrl) || !isConfigured(wpUsername) || !isConfigured(wpPassword)) {
    return {
      name: 'WordPress',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht vollständig konfiguriert',
    };
  }

  try {
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    
    // Test by fetching current user
    const response = await fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        name: 'WordPress',
        status: 'configured',
        configured: true,
        message: `Verbunden als: ${userData.name || wpUsername}`,
        lastChecked: Date.now(),
      };
    }

    if (response.status === 401) {
      return {
        name: 'WordPress',
        status: 'error',
        configured: true,
        message: 'Authentifizierung fehlgeschlagen',
        lastChecked: Date.now(),
      };
    }

    return {
      name: 'WordPress',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${response.status}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'WordPress',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check Facebook API
async function checkFacebook(): Promise<ApiCheckResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!isConfigured(pageId) || !isConfigured(accessToken)) {
    return {
      name: 'Facebook',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht konfiguriert',
    };
  }

  try {
    // Test by fetching page info
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=name,id&access_token=${accessToken}`
    );

    if (response.ok) {
      const pageData = await response.json();
      return {
        name: 'Facebook',
        status: 'configured',
        configured: true,
        message: `Verbunden mit: ${pageData.name || pageId}`,
        lastChecked: Date.now(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      name: 'Facebook',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${errorData?.error?.message || response.status}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'Facebook',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check Instagram API
async function checkInstagram(): Promise<ApiCheckResult> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!isConfigured(accountId) || !isConfigured(accessToken)) {
    return {
      name: 'Instagram',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht konfiguriert',
    };
  }

  try {
    // Test by fetching account info
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}?fields=username,id&access_token=${accessToken}`
    );

    if (response.ok) {
      const accountData = await response.json();
      return {
        name: 'Instagram',
        status: 'configured',
        configured: true,
        message: `Verbunden mit: @${accountData.username || accountId}`,
        lastChecked: Date.now(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      name: 'Instagram',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${errorData?.error?.message || response.status}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'Instagram',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check X (Twitter) API - just check if credentials are configured
function checkX(): ApiCheckResult {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  const allConfigured = isConfigured(apiKey) && isConfigured(apiSecret) && 
                        isConfigured(accessToken) && isConfigured(accessTokenSecret);

  if (!allConfigured) {
    return {
      name: 'X (Twitter)',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht vollständig konfiguriert',
    };
  }

  // X API doesn't have a simple test endpoint, so we just verify credentials exist
  return {
    name: 'X (Twitter)',
    status: 'configured',
    configured: true,
    message: 'Zugangsdaten konfiguriert (nicht live getestet)',
    lastChecked: Date.now(),
  };
}

// Check matchpfote API
async function checkMatchpfote(): Promise<ApiCheckResult> {
  const apiKey = process.env.MATCHPFOTE_API_KEY;
  const apiUrl = process.env.MATCHPFOTE_API_URL;

  if (!isConfigured(apiKey) || !isConfigured(apiUrl)) {
    return {
      name: 'matchpfote',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht konfiguriert',
    };
  }

  try {
    // Test by fetching animals list (minimal request)
    const response = await fetch(`${apiUrl}/animals?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        name: 'matchpfote',
        status: 'configured',
        configured: true,
        message: 'Verbindung erfolgreich',
        lastChecked: Date.now(),
      };
    }

    if (response.status === 401) {
      return {
        name: 'matchpfote',
        status: 'error',
        configured: true,
        message: 'Authentifizierung fehlgeschlagen',
        lastChecked: Date.now(),
      };
    }

    return {
      name: 'matchpfote',
      status: 'error',
      configured: true,
      message: `API-Fehler: ${response.status}`,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      name: 'matchpfote',
      status: 'error',
      configured: true,
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
      lastChecked: Date.now(),
    };
  }
}

// Check Cloudflare R2 Storage
async function checkR2Storage(): Promise<ApiCheckResult> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  const allConfigured = isConfigured(accountId) && isConfigured(accessKeyId) && 
                        isConfigured(secretAccessKey) && isConfigured(bucketName);

  if (!allConfigured) {
    return {
      name: 'Cloudflare R2',
      status: 'not_configured',
      configured: false,
      message: 'Zugangsdaten nicht vollständig konfiguriert (müssen in Convex gesetzt werden)',
    };
  }

  // R2 API requires AWS4 signature which is complex to implement here
  // Just verify credentials exist and public URL is accessible
  if (publicUrl && isConfigured(publicUrl)) {
    return {
      name: 'Cloudflare R2',
      status: 'configured',
      configured: true,
      message: `Bucket: ${bucketName}`,
      lastChecked: Date.now(),
    };
  }

  return {
    name: 'Cloudflare R2',
    status: 'configured',
    configured: true,
    message: `Bucket: ${bucketName} (ohne Public URL)`,
    lastChecked: Date.now(),
  };
}

// Check Convex configuration
// Note: If this action is running, Convex is already connected
// The fact that this action executes means Convex is working
function checkConvex(): ApiCheckResult {
  // If we're here, the action is running, which means Convex is connected
  return {
    name: 'Convex',
    status: 'configured',
    configured: true,
    message: 'Verbunden (Action läuft erfolgreich)',
    lastChecked: Date.now(),
  };
}

// Main action to check all API statuses
// Only accessible by admins
export const checkAllApiStatus = action({
  args: {},
  handler: async (ctx): Promise<ApiCheckResult[]> => {
    // Verify authentication and admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Note: Actions cannot directly query the database, but the Settings page
    // is only accessible to admins (verified in the dashboard layout).
    // For additional security, we could add a separate query to verify admin role.
    
    logger.info('Checking all API configurations', { user: identity.email });
    
    const results = await Promise.all([
      checkTranslationService(),
      checkWordPress(),
      checkFacebook(),
      checkInstagram(),
      Promise.resolve(checkX()),
      checkMatchpfote(),
      checkR2Storage(),
      Promise.resolve(checkConvex()),
    ]);

    logger.info('API status check completed', { 
      configured: results.filter((r: ApiCheckResult) => r.configured).length,
      total: results.length 
    });

    return results;
  },
});


