import { internalMutation, internalAction, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { logger } from '../lib/logger';

interface ValidationError {
  field: string;
  message: string;
}

function validateAnimal(animal: Doc<'animals'>): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Required fields
  if (!animal.name || animal.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name ist erforderlich' });
  }

  if (!animal.breed || animal.breed.trim().length === 0) {
    errors.push({ field: 'breed', message: 'Rasse ist erforderlich' });
  }

  if (!animal.color || animal.color.trim().length === 0) {
    errors.push({ field: 'color', message: 'Farbe ist erforderlich' });
  }

  if (!animal.characteristics || animal.characteristics.trim().length === 0) {
    errors.push({ field: 'characteristics', message: 'Charaktereigenschaften sind erforderlich' });
  }

  if (!animal.descShort || animal.descShort.trim().length === 0) {
    errors.push({ field: 'descShort', message: 'Kurzbeschreibung ist erforderlich' });
  } else if (animal.descShort.length < 20) {
    errors.push({ field: 'descShort', message: 'Kurzbeschreibung zu kurz (min. 20 Zeichen)' });
  }

  if (!animal.location || animal.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Aufenthaltsort ist erforderlich' });
  }

  // Date format validation
  if (animal.birthDate) {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(animal.birthDate)) {
      errors.push({
        field: 'birthDate',
        message: 'Geburtsdatum muss im Format TT.MM.JJJJ sein',
      });
    } else {
      const [day, month, year] = animal.birthDate.split('.').map(Number);
      const date = new Date(year, month - 1, day);
      const currentYear = new Date().getFullYear();

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        year < 2000 ||
        year > currentYear
      ) {
        errors.push({ field: 'birthDate', message: 'Ungültiges Geburtsdatum' });
      }
    }
  }

  // Shoulder height validation
  if (animal.shoulderHeight) {
    const height = parseInt(animal.shoulderHeight);
    if (isNaN(height) || height <= 0 || height > 200) {
      errors.push({
        field: 'shoulderHeight',
        message: 'Schulterhöhe muss zwischen 1 und 200 cm sein',
      });
    }
  }

  // Year validation
  if (animal.seekingHomeSince) {
    const year = parseInt(animal.seekingHomeSince);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2000 || year > currentYear) {
      errors.push({
        field: 'seekingHomeSince',
        message: `Jahr muss zwischen 2000 und ${currentYear} sein`,
      });
    }
  }

  // Gallery validation
  if (!animal.gallery || animal.gallery.length === 0) {
    errors.push({ field: 'gallery', message: 'Mindestens ein Bild ist erforderlich' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate animal after creation or when manager accepts ENTWURF
export const validateAnimalDraft = internalAction({
  args: { 
    animalId: v.id('animals'),
    reviewedBy: v.optional(v.id('users')), // Manager who accepted the draft
    reviewedAt: v.optional(v.number()), // Timestamp when accepted
  },
  handler: async (ctx, args) => {
    const animal = await ctx.runQuery(internal.validation.getAnimal, {
      animalId: args.animalId,
    });

    if (!animal) {
      throw new Error('Animal not found');
    }

    const validation = validateAnimal(animal);

    if (validation.isValid) {
      // Set status to AKZEPTIERT with review metadata
      await ctx.runMutation(internal.validation.updateAnimalStatus, {
        animalId: args.animalId,
        status: 'AKZEPTIERT',
        reviewedBy: args.reviewedBy,
        reviewedAt: args.reviewedAt,
      });

      // Trigger translation after status change to AKZEPTIERT
      await ctx.scheduler.runAfter(0, internal.translation.translateAnimalProfile, {
        animalId: args.animalId,
      });

      // Log audit entry for successful validation
      await ctx.runMutation(internal.auditLog.createInternal, {
        action: 'VALIDATION_SUCCESS',
        targetType: 'animal',
        targetId: args.animalId,
        targetName: animal.name,
      });
    } else {
      // Set status to ABGELEHNT with errors
      await ctx.runMutation(internal.validation.updateAnimalStatus, {
        animalId: args.animalId,
        status: 'ABGELEHNT',
      });

      // Log audit entry for failed validation
      await ctx.runMutation(internal.auditLog.createInternal, {
        action: 'VALIDATION_FAILURE',
        targetType: 'animal',
        targetId: args.animalId,
        targetName: animal.name,
        details: JSON.stringify({ errors: validation.errors }),
      });

      // Log validation errors
      logger.error('Validation failed', undefined, { animalId: args.animalId, errors: validation.errors });
    }

    return validation;
  },
});

// Internal query to get animal
export const getAnimal = internalQuery({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.animalId);
  },
});

// Internal mutation to update status
export const updateAnimalStatus = internalMutation({
  args: {
    animalId: v.id('animals'),
    status: v.union(
      v.literal('ENTWURF'),
      v.literal('ABGELEHNT'),
      v.literal('AKZEPTIERT'),
      v.literal('FINALISIERT')
    ),
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: {
      status: typeof args.status;
      reviewedBy?: typeof args.reviewedBy;
      reviewedAt?: typeof args.reviewedAt;
    } = { status: args.status };
    
    if (args.reviewedBy !== undefined) {
      updates.reviewedBy = args.reviewedBy;
    }
    if (args.reviewedAt !== undefined) {
      updates.reviewedAt = args.reviewedAt;
    }
    
    await ctx.db.patch(args.animalId, updates);
  },
});

