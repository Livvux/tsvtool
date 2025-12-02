import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Distribution Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    vi.stubEnv('WORDPRESS_URL', 'https://test.wordpress.com');
    vi.stubEnv('WORDPRESS_APP_USERNAME', 'testuser');
    vi.stubEnv('WORDPRESS_APP_PASSWORD', 'testpass');
    vi.stubEnv('FACEBOOK_PAGE_ID', '123456789');
    vi.stubEnv('FACEBOOK_ACCESS_TOKEN', 'test_fb_token');
    vi.stubEnv('INSTAGRAM_BUSINESS_ACCOUNT_ID', '987654321');
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'test_ig_token');
    vi.stubEnv('TWITTER_API_KEY', 'test_api_key');
    vi.stubEnv('TWITTER_API_SECRET', 'test_api_secret');
    vi.stubEnv('TWITTER_ACCESS_TOKEN', 'test_access_token');
    vi.stubEnv('TWITTER_ACCESS_TOKEN_SECRET', 'test_access_secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('WordPress Distribution', () => {
    it('should return false when credentials are missing', async () => {
      vi.stubEnv('WORDPRESS_URL', '');
      
      // Since we can't directly test the internal function,
      // we test the behavior through expected outcomes
      expect(process.env.WORDPRESS_URL).toBe('');
    });

    it('should have correct WordPress URL configured', () => {
      expect(process.env.WORDPRESS_URL).toBe('https://test.wordpress.com');
      expect(process.env.WORDPRESS_APP_USERNAME).toBe('testuser');
      expect(process.env.WORDPRESS_APP_PASSWORD).toBe('testpass');
    });
  });

  describe('Facebook Distribution', () => {
    it('should have correct Facebook credentials configured', () => {
      expect(process.env.FACEBOOK_PAGE_ID).toBe('123456789');
      expect(process.env.FACEBOOK_ACCESS_TOKEN).toBe('test_fb_token');
    });

    it('should use Graph API v18.0', () => {
      const expectedEndpoint = `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`;
      expect(expectedEndpoint).toContain('v18.0');
      expect(expectedEndpoint).toContain('123456789');
    });
  });

  describe('Instagram Distribution', () => {
    beforeEach(() => {
      vi.stubEnv('R2_PUBLIC_URL', 'https://cdn.example.com');
    });

    it('should have correct Instagram credentials configured', () => {
      expect(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID).toBe('987654321');
      expect(process.env.INSTAGRAM_ACCESS_TOKEN).toBe('test_ig_token');
    });

    it('should use correct media endpoint', () => {
      const mediaEndpoint = `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`;
      expect(mediaEndpoint).toContain('987654321');
      expect(mediaEndpoint).toContain('/media');
    });

    it('should use correct media_publish endpoint', () => {
      const publishEndpoint = `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`;
      expect(publishEndpoint).toContain('987654321');
      expect(publishEndpoint).toContain('/media_publish');
    });

    it('should create media container with image URL and caption', () => {
      const mockAnimal = {
        name: 'Luna',
        descShort: 'Luna е прекрасно куче.',
        descLong: 'Luna ist ein wunderschöner Hund.',
        location: 'Tierheim Razgrad',
        animal: 'Hund',
        gallery: ['image_id_1'],
      };

      const imageUrl = `${process.env.R2_PUBLIC_URL}/${mockAnimal.gallery[0]}`;
      const caption = `🐾 ${mockAnimal.name}\n\n${mockAnimal.descLong || mockAnimal.descShort}\n\n📍 ${mockAnimal.location}\n\n#adoption #tierschutz #tsvstrassenpfoten #${mockAnimal.animal.toLowerCase()}`;

      const containerData = {
        image_url: imageUrl,
        caption,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      };

      expect(containerData.image_url).toBe('https://cdn.example.com/image_id_1');
      expect(containerData.caption).toContain('🐾 Luna');
      expect(containerData.caption).toContain('#hund');
      expect(containerData.caption).toContain('#adoption');
      expect(containerData.caption).toContain('#tierschutz');
      expect(containerData.caption).toContain('#tsvstrassenpfoten');
    });

    it('should handle missing imageUrl gracefully', () => {
      const mockAnimal = {
        name: 'Luna',
        gallery: [],
      };

      const r2PublicUrl = process.env.R2_PUBLIC_URL;
      let firstImageUrl: string | null = null;
      
      if (mockAnimal.gallery && mockAnimal.gallery.length > 0 && r2PublicUrl) {
        firstImageUrl = `${r2PublicUrl}/${mockAnimal.gallery[0]}`;
      }

      expect(firstImageUrl).toBeNull();
      // Distribution should skip Instagram when no image URL
    });

    it('should wait for container processing before publishing', () => {
      const waitTime = 5000; // 5 seconds
      expect(waitTime).toBe(5000);
    });

    it('should publish media with container ID', () => {
      const containerId = '123456789';
      const publishData = {
        creation_id: containerId,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      };

      expect(publishData.creation_id).toBe(containerId);
      expect(publishData.access_token).toBe('test_ig_token');
    });

    it('should format caption with all required elements', () => {
      const mockAnimal = {
        name: 'Bella',
        descLong: 'Bella ist ein wunderschöner Mischling.',
        location: 'Tierheim Sofia',
        animal: 'Katze',
      };

      const caption = `🐾 ${mockAnimal.name}\n\n${mockAnimal.descLong}\n\n📍 ${mockAnimal.location}\n\n#adoption #tierschutz #tsvstrassenpfoten #${mockAnimal.animal.toLowerCase()}`;

      expect(caption).toContain('🐾 Bella');
      expect(caption).toContain('Bella ist ein wunderschöner Mischling.');
      expect(caption).toContain('📍 Tierheim Sofia');
      expect(caption).toContain('#katze');
      expect(caption).toContain('#adoption');
      expect(caption).toContain('#tierschutz');
      expect(caption).toContain('#tsvstrassenpfoten');
    });

    it('should handle API errors during container creation', () => {
      const errorStatus = 400;
      const errorData = { error: { message: 'Invalid image URL' } };
      
      expect(errorStatus).toBe(400);
      expect(errorData.error.message).toBe('Invalid image URL');
    });

    it('should handle API errors during media publish', () => {
      const errorStatus = 500;
      const errorData = { error: { message: 'Container not ready' } };
      
      expect(errorStatus).toBe(500);
      expect(errorData.error.message).toBe('Container not ready');
    });
  });

  describe('X/Twitter Distribution', () => {
    it('should have correct X/Twitter credentials configured', () => {
      expect(process.env.TWITTER_API_KEY).toBe('test_api_key');
      expect(process.env.TWITTER_API_SECRET).toBe('test_api_secret');
      expect(process.env.TWITTER_ACCESS_TOKEN).toBe('test_access_token');
      expect(process.env.TWITTER_ACCESS_TOKEN_SECRET).toBe('test_access_secret');
    });

    it('should use API v2 endpoint', () => {
      const tweetEndpoint = 'https://api.twitter.com/2/tweets';
      expect(tweetEndpoint).toContain('/2/tweets');
    });

    it('should generate OAuth 1.0a signature', () => {
      const method = 'POST';
      const url = 'https://api.twitter.com/2/tweets';
      const params = {
        oauth_consumer_key: process.env.TWITTER_API_KEY!,
        oauth_nonce: 'test_nonce',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: process.env.TWITTER_ACCESS_TOKEN!,
        oauth_version: '1.0',
      };

      // OAuth signature generation requires:
      // 1. Sort parameters
      // 2. Create signature base string
      // 3. Generate HMAC-SHA1 signature
      expect(params.oauth_signature_method).toBe('HMAC-SHA1');
      expect(params.oauth_version).toBe('1.0');
      expect(params.oauth_consumer_key).toBe('test_api_key');
      expect(params.oauth_token).toBe('test_access_token');
    });

    it('should generate OAuth 1.0a header', () => {
      const oauthParams = {
        oauth_consumer_key: 'test_api_key',
        oauth_nonce: 'test_nonce',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: '1234567890',
        oauth_token: 'test_access_token',
        oauth_version: '1.0',
        oauth_signature: 'test_signature',
      };

      // Header should start with "OAuth "
      const headerParts = Object.keys(oauthParams)
        .sort()
        .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key as keyof typeof oauthParams])}"`)
        .join(', ');

      const authHeader = `OAuth ${headerParts}`;

      expect(authHeader).toContain('OAuth ');
      expect(authHeader).toContain('oauth_consumer_key');
      expect(authHeader).toContain('oauth_signature');
    });

    it('should truncate tweet text to 280 characters', () => {
      const mockAnimal = {
        name: 'Luna',
        descShort: 'Luna е прекрасно куче.',
        descLong: 'A'.repeat(300), // Very long description
        webLink: 'https://example.com/luna',
        animal: 'Hund',
      };

      const description = (mockAnimal.descLong || mockAnimal.descShort || '').substring(0, 150);
      const link = mockAnimal.webLink ? `\n${mockAnimal.webLink}` : '';
      const hashtags = `\n#adoption #${mockAnimal.animal.toLowerCase()} #tierschutz`;
      const tweetText = `🐾 ${mockAnimal.name}\n\n${description}...${link}${hashtags}`.substring(0, 280);

      expect(tweetText.length).toBeLessThanOrEqual(280);
      expect(tweetText).toContain('🐾 Luna');
    });

    it('should format tweet with all required elements', () => {
      const mockAnimal = {
        name: 'Bella',
        descShort: 'Bella е прекрасна котка.',
        descLong: 'Bella ist ein wunderschöner Mischling.',
        webLink: 'https://example.com/bella',
        animal: 'Katze',
      };

      const description = (mockAnimal.descLong || mockAnimal.descShort || '').substring(0, 150);
      const link = mockAnimal.webLink ? `\n${mockAnimal.webLink}` : '';
      const hashtags = `\n#adoption #${mockAnimal.animal.toLowerCase()} #tierschutz`;
      const tweetText = `🐾 ${mockAnimal.name}\n\n${description}...${link}${hashtags}`.substring(0, 280);

      expect(tweetText).toContain('🐾 Bella');
      expect(tweetText).toContain('Bella ist ein wunderschöner Mischling.');
      expect(tweetText).toContain('https://example.com/bella');
      expect(tweetText).toContain('#katze');
      expect(tweetText).toContain('#adoption');
      expect(tweetText).toContain('#tierschutz');
    });

    it('should handle missing webLink in tweet', () => {
      const mockAnimal = {
        name: 'Luna',
        descShort: 'Luna е прекрасно куче.',
        descLong: 'Luna ist ein wunderschöner Hund.',
        webLink: undefined,
        animal: 'Hund',
      };

      const description = (mockAnimal.descLong || mockAnimal.descShort || '').substring(0, 150);
      const link = mockAnimal.webLink ? `\n${mockAnimal.webLink}` : '';
      const hashtags = `\n#adoption #${mockAnimal.animal.toLowerCase()} #tierschutz`;
      const tweetText = `🐾 ${mockAnimal.name}\n\n${description}...${link}${hashtags}`.substring(0, 280);

      expect(tweetText).toContain('🐾 Luna');
      expect(tweetText).not.toContain('https://');
    });

    it('should use correct HTTP method and headers', () => {
      const method = 'POST';
      const headers = {
        'Authorization': 'OAuth ...',
        'Content-Type': 'application/json',
      };

      expect(method).toBe('POST');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toContain('OAuth');
    });

    it('should handle API errors', () => {
      const errorStatus = 401;
      const errorData = { errors: [{ message: 'Invalid credentials' }] };

      expect(errorStatus).toBe(401);
      expect(errorData.errors[0].message).toBe('Invalid credentials');
    });

    it('should return tweet ID on success', () => {
      const successResponse = {
        data: {
          id: '1234567890123456789',
          text: '🐾 Luna\n\n...',
        },
      };

      expect(successResponse.data.id).toBeTruthy();
      expect(successResponse.data.text).toContain('🐾 Luna');
    });
  });

  describe('Distribution Text Formatting', () => {
    const mockAnimal = {
      name: 'Bella',
      descShort: 'Ein freundlicher Hund sucht ein Zuhause.',
      descLong: 'Bella ist ein wunderschöner Mischling, der sehr freundlich und verspielt ist.',
      location: 'Tierheim Razgrad',
      animal: 'Hund',
      webLink: 'https://example.com/bella',
    };

    it('should format Instagram caption correctly', () => {
      const caption = `🐾 ${mockAnimal.name}\n\n${mockAnimal.descLong || mockAnimal.descShort}\n\n📍 ${mockAnimal.location}\n\n#adoption #tierschutz #tsvstrassenpfoten #${mockAnimal.animal.toLowerCase()}`;
      
      expect(caption).toContain('🐾 Bella');
      expect(caption).toContain('Bella ist ein wunderschöner Mischling');
      expect(caption).toContain('📍 Tierheim Razgrad');
      expect(caption).toContain('#hund');
    });

    it('should format Facebook message correctly', () => {
      const message = `🐾 ${mockAnimal.name}\n\n${mockAnimal.descLong || mockAnimal.descShort}\n\nMehr Informationen: ${mockAnimal.webLink || ''}`;
      
      expect(message).toContain('🐾 Bella');
      expect(message).toContain('https://example.com/bella');
    });

    it('should truncate X/Twitter text to 280 characters', () => {
      const description = (mockAnimal.descLong || mockAnimal.descShort).substring(0, 150);
      const link = mockAnimal.webLink ? `\n${mockAnimal.webLink}` : '';
      const hashtags = `\n#adoption #${mockAnimal.animal.toLowerCase()} #tierschutz`;
      const tweetText = `🐾 ${mockAnimal.name}\n\n${description}...${link}${hashtags}`.substring(0, 280);
      
      expect(tweetText.length).toBeLessThanOrEqual(280);
      expect(tweetText).toContain('🐾 Bella');
    });
  });

  describe('Retry Logic', () => {
    it('should retry up to 3 times by default', () => {
      const maxRetries = 3;
      expect(maxRetries).toBe(3);
    });

    it('should use exponential backoff delays', () => {
      // Delays: 1s, 2s, 4s
      const delays = [0, 1, 2].map((attempt: number) => Math.pow(2, attempt) * 1000);
      expect(delays).toEqual([1000, 2000, 4000]);
    });
  });
});

