import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { logger } from '../lib/logger';

type TranslationService = 'google' | 'microsoft';

/**
 * Translate text using Google Translate API
 */
async function translateWithGoogle(text: string, apiKey: string): Promise<string> {
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
    const errorText = await response.text();
    throw new Error(`Google Translate API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

/**
 * Translate text using Microsoft Azure Translator API
 * @see https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/v3/translate
 */
async function translateWithMicrosoft(
  text: string, 
  apiKey: string, 
  region: string
): Promise<string> {
  const endpoint = 'https://api.cognitive.microsofttranslator.com';
  const url = `${endpoint}/translate?api-version=3.0&from=bg&to=de`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Microsoft Translator API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data[0].translations[0].text;
}

/**
 * Translate text using configured service (Google or Microsoft)
 */
async function translateText(text: string): Promise<string> {
  const service = (process.env.TRANSLATION_SERVICE?.toLowerCase() || 'google') as TranslationService;
  
  if (service === 'microsoft') {
    const apiKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    
    if (!apiKey || !region) {
      throw new Error('Microsoft Azure Translator not configured (AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION)');
    }
    
    return translateWithMicrosoft(text, apiKey, region);
  }
  
  // Default: Google Translate
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Translate API key not configured (GOOGLE_TRANSLATE_API_KEY)');
  }
  
  return translateWithGoogle(text, apiKey);
}

/**
 * Get current translation service configuration status
 */
function getTranslationServiceConfig(): { service: TranslationService; configured: boolean } {
  const service = (process.env.TRANSLATION_SERVICE?.toLowerCase() || 'google') as TranslationService;
  
  if (service === 'microsoft') {
    const configured = !!(process.env.AZURE_TRANSLATOR_KEY && process.env.AZURE_TRANSLATOR_REGION);
    return { service: 'microsoft', configured };
  }
  
  const configured = !!process.env.GOOGLE_TRANSLATE_API_KEY;
  return { service: 'google', configured };
}

// Translate animal profile after status change to AKZEPTIERT
export const translateAnimalProfile = internalAction({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    const config = getTranslationServiceConfig();
    
    if (!config.configured) {
      logger.error(`Translation service "${config.service}" not configured`, undefined, { 
        action: 'translateAnimalProfile',
        service: config.service,
      });
      return;
    }

    const animal = await ctx.runQuery(internal.translation.getAnimal, {
      animalId: args.animalId,
    });

    if (!animal) {
      throw new Error('Animal not found');
    }

    try {
      logger.info(`Starting translation with ${config.service}`, { 
        animalId: args.animalId,
        service: config.service,
      });
      
      // Translate fields
      const translatedFields: Partial<Doc<'animals'>> = {};

      if (animal.descShort) {
        translatedFields.descLong = await translateText(animal.descShort);
      }

      // Translate characteristics, but preserve original in characteristicsBG if not already set
      if (animal.characteristics) {
        // Only translate if characteristicsBG is not already set (preserve original Bulgarian)
        if (!animal.characteristicsBG) {
          translatedFields.characteristicsBG = animal.characteristics;
        }
        translatedFields.characteristics = await translateText(animal.characteristics);
      }

      if (animal.compatibilityText) {
        translatedFields.compatibilityText = await translateText(animal.compatibilityText);
      }

      if (animal.diseases) {
        translatedFields.diseases = await translateText(animal.diseases);
      }

      if (animal.handicap) {
        translatedFields.handicap = await translateText(animal.handicap);
      }

      if (animal.healthText) {
        translatedFields.healthText = await translateText(animal.healthText);
      }

      // Update animal with translated fields
      await ctx.runMutation(internal.translation.updateAnimalTranslation, {
        animalId: args.animalId,
        translations: translatedFields,
      });

      // Log audit entry for successful translation
      await ctx.runMutation(internal.auditLog.createInternal, {
        action: 'TRANSLATION_SUCCESS',
        targetType: 'animal',
        targetId: args.animalId,
        targetName: animal.name,
        details: JSON.stringify({ service: config.service, fieldsTranslated: Object.keys(translatedFields) }),
      });

      logger.info(`Translation completed with ${config.service}`, { 
        animalId: args.animalId,
        service: config.service,
      });
    } catch (error) {
      // Log audit entry for failed translation
      await ctx.runMutation(internal.auditLog.createInternal, {
        action: 'TRANSLATION_FAILURE',
        targetType: 'animal',
        targetId: args.animalId,
        targetName: animal.name,
        details: JSON.stringify({ 
          service: config.service, 
          error: error instanceof Error ? error.message : String(error) 
        }),
      });

      logger.error('Translation failed', error instanceof Error ? error : new Error(String(error)), { 
        animalId: args.animalId,
        service: config.service,
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
