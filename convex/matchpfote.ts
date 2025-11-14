import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { logger } from '../lib/logger';

interface MatchpfoteApiError {
  status: number;
  message: string;
  retryAfter?: number;
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 600; // 600ms = 100 requests per minute

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

// Retry helper
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const apiError = error as { status?: number; retryAfter?: number };
      if (apiError.status === 429 && i < maxRetries - 1) {
        // Rate limit exceeded, wait before retry
        const retryAfter = apiError.retryAfter || 60;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// matchpfote API client
class MatchpfoteApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await waitForRateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error: MatchpfoteApiError = {
        status: response.status,
        message: `HTTP ${response.status}`,
      };
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        error.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
      }
      
      throw error;
    }

    return await response.json();
  }

  async createAnimal(animalData: Record<string, unknown>) {
    return retryWithBackoff(() =>
      this.request('/animals', {
        method: 'POST',
        body: JSON.stringify(animalData),
      })
    );
  }

  async updateAnimal(id: string, animalData: Record<string, unknown>) {
    return retryWithBackoff(() =>
      this.request(`/animals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(animalData),
      })
    );
  }

  async getAnimals(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return retryWithBackoff(() =>
      this.request(`/animals?${query.toString()}`)
    );
  }
}

// Transform animal data for matchpfote
function transformAnimalForMatchpfote(animal: Doc<'animals'>) {
  return {
    name: animal.name,
    species: animal.animal === 'Hund' ? 'dog' : 'cat',
    breed: animal.breed,
    gender: animal.gender === 'männlich' ? 'male' : 'female',
    birthDate: animal.birthDate,
    description: animal.descLong || animal.descShort,
    location: animal.location,
    castrated: animal.castrated === 'JA',
    vaccinated: animal.vaccinated === 'JA',
    chipped: animal.chipped === 'vollständig',
    images: animal.gallery,
  };
}

// Sync animal to matchpfote
export const syncAnimalToMatchpfote = internalAction({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    const apiKey = process.env.MATCHPFOTE_API_KEY;
    const apiUrl = process.env.MATCHPFOTE_API_URL;

    if (!apiKey || !apiUrl) {
      logger.error('matchpfote API credentials not configured', undefined, { action: 'syncAnimalToMatchpfote' });
      return;
    }

    const animal = await ctx.runQuery(internal.matchpfote.getAnimal, {
      animalId: args.animalId,
    });

    if (!animal) {
      throw new Error('Animal not found');
    }

    try {
      const client = new MatchpfoteApiClient(apiKey, apiUrl);
      const animalData = transformAnimalForMatchpfote(animal);
      
      await client.createAnimal(animalData);

      // Update sync status
      await ctx.runMutation(internal.matchpfote.updateSyncStatus, {
        animalId: args.animalId,
        synced: true,
      });

      logger.info('Successfully synced to matchpfote', { animalId: args.animalId, platform: 'matchpfote' });
    } catch (error) {
      logger.error('matchpfote sync failed', error instanceof Error ? error : new Error(String(error)), { animalId: args.animalId, platform: 'matchpfote' });
      
      await ctx.runMutation(internal.matchpfote.updateSyncStatus, {
        animalId: args.animalId,
        synced: false,
      });
      
      throw error;
    }
  },
});

// Internal query to get animal
export const getAnimal = internalQuery({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.animalId);
  },
});

// Internal mutation to update sync status
export const updateSyncStatus = internalMutation({
  args: {
    animalId: v.id('animals'),
    synced: v.boolean(),
  },
  handler: async (ctx, args) => {
    const animal = await ctx.db.get(args.animalId);
    if (!animal) return;

    await ctx.db.patch(args.animalId, {
      distributedTo: {
        ...animal.distributedTo,
        matchpfote: args.synced,
      },
    });
  },
});

