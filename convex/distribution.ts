"use node";

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { logger } from '../lib/logger';
import crypto from 'crypto';

// Helper: Generate OAuth 1.0a signature for X/Twitter
function generateOAuth1Signature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');
}

// Helper: Generate OAuth 1.0a header for X/Twitter
function generateOAuth1Header(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  additionalParams: Record<string, string> = {}
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...additionalParams,
  };
  
  const signature = generateOAuth1Signature(
    method,
    url,
    oauthParams,
    apiSecret,
    accessTokenSecret
  );
  
  oauthParams.oauth_signature = signature;
  
  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return `OAuth ${headerParts}`;
}

// WordPress distribution (Avada Portfolio)
async function distributeToWordPress(animal: Doc<'animals'>): Promise<boolean> {
  const wpUrl = process.env.WORDPRESS_URL;
  const wpUsername = process.env.WORDPRESS_APP_USERNAME;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!wpUrl || !wpUsername || !wpPassword) {
    logger.error('WordPress credentials not configured', undefined, { action: 'distributeToWordPress' });
    return false;
  }

  try {
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    
    // Create Avada Portfolio post
    const postData = {
      title: animal.name,
      content: animal.descLong || animal.descShort,
      status: 'publish',
      post_type: 'avada_portfolio',
      meta: {
        animal_type: animal.animal,
        breed: animal.breed,
        gender: animal.gender,
        location: animal.location,
        castrated: animal.castrated,
        vaccinated: animal.vaccinated,
        chipped: animal.chipped,
      },
    };

    const response = await fetch(`${wpUrl}/wp-json/wp/v2/avada_portfolio`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    logger.info('Successfully distributed to WordPress', { animalId: animal._id, platform: 'wordpress' });
    return true;
  } catch (error) {
    logger.error('WordPress distribution failed', error instanceof Error ? error : new Error(String(error)), { animalId: animal._id, platform: 'wordpress' });
    return false;
  }
}

// Facebook distribution
async function distributeToFacebook(animal: Doc<'animals'>): Promise<boolean> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    logger.error('Facebook credentials not configured', undefined, { action: 'distributeToFacebook' });
    return false;
  }

  try {
    const message = `🐾 ${animal.name}\n\n${animal.descLong || animal.descShort}\n\nMehr Informationen: ${animal.webLink || ''}`;
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    logger.info('Successfully distributed to Facebook', { animalId: animal._id, platform: 'facebook' });
    return true;
  } catch (error) {
    logger.error('Facebook distribution failed', error instanceof Error ? error : new Error(String(error)), { animalId: animal._id, platform: 'facebook' });
    return false;
  }
}

// Instagram distribution - Graph API /media + /media_publish
async function distributeToInstagram(
  animal: Doc<'animals'>,
  imageUrl: string | null
): Promise<boolean> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    logger.error('Instagram credentials not configured', undefined, { action: 'distributeToInstagram' });
    return false;
  }

  if (!imageUrl) {
    logger.warn('Instagram distribution skipped - no public image URL available', { 
      animalId: animal._id, 
      platform: 'instagram' 
    });
    return false;
  }

  try {
    const caption = `🐾 ${animal.name}\n\n${animal.descLong || animal.descShort}\n\n📍 ${animal.location}\n\n#adoption #tierschutz #tsvstrassenpfoten #${animal.animal.toLowerCase()}`;
    
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.text();
      throw new Error(`Instagram container creation failed: ${containerResponse.status} - ${errorData}`);
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    if (!containerId) {
      throw new Error('Instagram container ID not returned');
    }

    // Step 2: Wait for container to be ready (Instagram processes the image)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 3: Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.text();
      throw new Error(`Instagram publish failed: ${publishResponse.status} - ${errorData}`);
    }

    const publishData = await publishResponse.json();
    
    logger.info('Successfully distributed to Instagram', { 
      animalId: animal._id, 
      platform: 'instagram',
      postId: publishData.id 
    });
    return true;
  } catch (error) {
    logger.error('Instagram distribution failed', error instanceof Error ? error : new Error(String(error)), { 
      animalId: animal._id, 
      platform: 'instagram' 
    });
    return false;
  }
}

// X (Twitter) distribution - OAuth 1.0a
async function distributeToX(animal: Doc<'animals'>): Promise<boolean> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    logger.error('X (Twitter) credentials not configured', undefined, { action: 'distributeToX' });
    return false;
  }

  try {
    // Prepare tweet text (max 280 characters)
    const description = (animal.descLong || animal.descShort).substring(0, 150);
    const link = animal.webLink ? `\n${animal.webLink}` : '';
    const hashtags = `\n#adoption #${animal.animal.toLowerCase()} #tierschutz`;
    const tweetText = `🐾 ${animal.name}\n\n${description}...${link}${hashtags}`.substring(0, 280);
    
    // X API v2 endpoint for creating tweets
    const url = 'https://api.twitter.com/2/tweets';
    
    // Generate OAuth 1.0a header
    const authHeader = generateOAuth1Header(
      'POST',
      url,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    );
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`X API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    logger.info('Successfully distributed to X', { 
      animalId: animal._id, 
      platform: 'x',
      tweetId: data.data?.id 
    });
    return true;
  } catch (error) {
    logger.error('X distribution failed', error instanceof Error ? error : new Error(String(error)), { 
      animalId: animal._id, 
      platform: 'x' 
    });
    return false;
  }
}

// Main distribution action
export const distributeAnimal = internalAction({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    const animal = await ctx.runQuery(internal.distributionHelpers.getAnimal, {
      animalId: args.animalId,
    });

    if (!animal) {
      throw new Error('Animal not found');
    }

    // Get first image URL for Instagram (needs public URL)
    let firstImageUrl: string | null = null;
    if (animal.gallery && animal.gallery.length > 0) {
      const r2PublicUrl = process.env.R2_PUBLIC_URL;
      if (r2PublicUrl) {
        firstImageUrl = `${r2PublicUrl}/${animal.gallery[0]}`;
      } else {
        logger.warn('R2_PUBLIC_URL not configured - Instagram distribution may fail', { animalId: args.animalId });
      }
    }

    const results = {
      wordpress: false,
      facebook: false,
      instagram: false,
      x: false,
    };

    try {
      // Distribute to all platforms with retry logic
      results.wordpress = await retryWithBackoff(() => distributeToWordPress(animal), 'wordpress', args.animalId);
      results.facebook = await retryWithBackoff(() => distributeToFacebook(animal), 'facebook', args.animalId);
      results.instagram = await retryWithBackoff(() => distributeToInstagram(animal, firstImageUrl), 'instagram', args.animalId);
      results.x = await retryWithBackoff(() => distributeToX(animal), 'x', args.animalId);

      // Update distribution status
      await ctx.runMutation(internal.distributionHelpers.updateDistributionStatus, {
        animalId: args.animalId,
        results,
      });

      // Log audit entry - success or partial success
      const successCount = Object.values(results).filter(Boolean).length;
      const failureCount = Object.values(results).filter((v) => !v).length;
      
      if (successCount > 0) {
        await ctx.runMutation(internal.auditLog.createInternal, {
          action: 'DISTRIBUTION_SUCCESS',
          targetType: 'animal',
          targetId: args.animalId,
          targetName: animal.name,
          details: JSON.stringify({ 
            results, 
            successCount, 
            failureCount,
            platforms: Object.entries(results).filter(([, v]) => v).map(([k]) => k)
          }),
        });
      }
      
      if (failureCount > 0) {
        await ctx.runMutation(internal.auditLog.createInternal, {
          action: 'DISTRIBUTION_FAILURE',
          targetType: 'animal',
          targetId: args.animalId,
          targetName: animal.name,
          details: JSON.stringify({ 
            results, 
            successCount, 
            failureCount,
            failedPlatforms: Object.entries(results).filter(([, v]) => !v).map(([k]) => k)
          }),
        });
      }

      logger.info('Distribution completed', { animalId: args.animalId, results });
    } catch (error) {
      // Log audit entry for distribution error
      await ctx.runMutation(internal.auditLog.createInternal, {
        action: 'DISTRIBUTION_FAILURE',
        targetType: 'animal',
        targetId: args.animalId,
        targetName: animal.name,
        details: JSON.stringify({ 
          error: error instanceof Error ? error.message : String(error) 
        }),
      });

      logger.error('Distribution error', error instanceof Error ? error : new Error(String(error)), { animalId: args.animalId });
      throw error;
    }
  },
});

// Retry helper with exponential backoff
async function retryWithBackoff(
  fn: () => Promise<boolean>,
  platform: string,
  animalId: Id<'animals'>,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result) return true;
      
      // If result is false (not an error), don't retry
      if (attempt === 0) return false;
    } catch (error) {
      logger.warn(`Distribution attempt ${attempt + 1} failed for ${platform}`, { 
        animalId, 
        platform,
        attempt: attempt + 1,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  logger.error(`Distribution failed after ${maxRetries} attempts`, undefined, { 
    animalId, 
    platform,
    maxRetries 
  });
  return false;
}


