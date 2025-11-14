import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { logger } from '../lib/logger';

async function translateText(text: string, apiKey: string): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: 'bg',
      target: 'de',
      format: 'text',
      key: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// Translate animal profile after status change to AKZEPTIERT
export const translateAnimalProfile = internalAction({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      logger.error('Google Translate API key not configured', undefined, { action: 'translateAnimalProfile' });
      return;
    }

    const animal = await ctx.runQuery(internal.translation.getAnimal, {
      animalId: args.animalId,
    });

    if (!animal) {
      throw new Error('Animal not found');
    }

    try {
      // Translate fields
      const translatedFields: Partial<Doc<'animals'>> = {};

      if (animal.descShort) {
        translatedFields.descLong = await translateText(animal.descShort, apiKey);
      }

      if (animal.characteristics) {
        const translatedCharacteristics = await translateText(
          animal.characteristics,
          apiKey
        );
        translatedFields.characteristics = translatedCharacteristics;
      }

      if (animal.compatibilityText) {
        const translatedCompatibilityText = await translateText(
          animal.compatibilityText,
          apiKey
        );
        translatedFields.compatibilityText = translatedCompatibilityText;
      }

      if (animal.diseases) {
        translatedFields.diseases = await translateText(animal.diseases, apiKey);
      }

      if (animal.handicap) {
        translatedFields.handicap = await translateText(animal.handicap, apiKey);
      }

      if (animal.healthText) {
        translatedFields.healthText = await translateText(animal.healthText, apiKey);
      }

      // Update animal with translated fields
      await ctx.runMutation(internal.translation.updateAnimalTranslation, {
        animalId: args.animalId,
        translations: translatedFields,
      });

      logger.info('Translation completed for animal', { animalId: args.animalId });
    } catch (error) {
      logger.error('Translation failed', error instanceof Error ? error : new Error(String(error)), { animalId: args.animalId });
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

// Internal mutation to update translations
export const updateAnimalTranslation = internalMutation({
  args: {
    animalId: v.id('animals'),
    translations: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.animalId, args.translations);
  },
});

