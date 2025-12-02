import { v } from 'convex/values';
import { mutation, query, QueryCtx, MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { Id, Doc } from './_generated/dataModel';
import type { AuditAction } from './auditLog';

/**
 * Helper function to get the current user from Clerk authentication.
 * Uses tokenIdentifier to look up the user in our database.
 */
async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  const user = await ctx.db
    .query('users')
    .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .first();
  
  return user;
}

// Create a new animal draft
export const create = mutation({
  args: {
    name: v.string(),
    animal: v.union(v.literal('Hund'), v.literal('Katze')),
    breed: v.string(),
    gender: v.union(v.literal('weiblich'), v.literal('männlich')),
    birthDate: v.optional(v.string()),
    shoulderHeight: v.optional(v.string()),
    color: v.string(),
    castrated: v.union(v.literal('JA'), v.literal('NEIN')),
    vaccinated: v.union(v.literal('JA'), v.literal('NEIN'), v.literal('teilweise')),
    chipped: v.union(v.literal('vollständig'), v.literal('teilweise'), v.literal('nein')),
    bloodType: v.optional(v.string()),
    health: v.union(v.literal('JA'), v.literal('NEIN')),
    healthText: v.optional(v.string()),
    diseases: v.optional(v.string()),
    handicap: v.optional(v.string()),
    characteristics: v.string(),
    compatibleDogs: v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden')),
    compatibleCats: v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden')),
    compatibleChildren: v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden')),
    compatibilityText: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    webLink: v.optional(v.string()),
    descShort: v.string(),
    location: v.string(),
    seekingHomeSince: v.optional(v.string()),
    gallery: v.array(v.string()),
    videos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const animalId = await ctx.db.insert('animals', {
      ...args,
      videos: args.videos ?? [],
      status: 'ENTWURF',
      createdBy: user._id,
      createdByRole: user.role,
      descShortBG: args.descShort,
      characteristicsBG: args.characteristics,
      distributedTo: {},
    });

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'ANIMAL_CREATE' as AuditAction,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      targetType: 'animal',
      targetId: animalId,
      targetName: args.name,
      details: JSON.stringify({ animal: args.animal, breed: args.breed }),
    });

    // Trigger automatic validation
    await ctx.scheduler.runAfter(0, internal.validation.validateAnimalDraft, {
      animalId,
    });

    return animalId;
  },
});

// Get all animals
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal('ENTWURF'),
      v.literal('ABGELEHNT'),
      v.literal('AKZEPTIERT'),
      v.literal('FINALISIERT')
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query('animals')
        .withIndex('status', (q) => q.eq('status', status))
        .order('desc')
        .collect();
    }

    return await ctx.db.query('animals').order('desc').collect();
  },
});

// Get animals with pagination
export const listPaginated = query({
  args: {
    status: v.optional(v.union(
      v.literal('ENTWURF'),
      v.literal('ABGELEHNT'),
      v.literal('AKZEPTIERT'),
      v.literal('FINALISIERT')
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id('animals')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const limit = args.limit ?? 12;

    let animalsQuery;

    // Apply status filter if provided
    if (args.status) {
      const status = args.status;
      animalsQuery = ctx.db
        .query('animals')
        .withIndex('status', (q) => q.eq('status', status));
    } else {
      animalsQuery = ctx.db.query('animals');
    }

    // Apply cursor if provided (for pagination)
    if (args.cursor) {
      const cursorAnimal = await ctx.db.get(args.cursor);
      if (cursorAnimal) {
        animalsQuery = animalsQuery.filter((q) => 
          q.lt(q.field('_creationTime'), cursorAnimal._creationTime)
        );
      }
    }

    // Get results ordered by creation time (desc)
    const animals = await animalsQuery.order('desc').take(limit + 1);

    // Check if there are more results
    const hasMore = animals.length > limit;
    const results = hasMore ? animals.slice(0, limit) : animals;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]._id : null;

    return {
      animals: results,
      nextCursor,
    };
  },
});

// Get single animal by ID
export const get = query({
  args: { id: v.id('animals') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    return await ctx.db.get(args.id);
  },
});

// Update animal
export const update = mutation({
  args: {
    id: v.id('animals'),
    name: v.optional(v.string()),
    animal: v.optional(v.union(v.literal('Hund'), v.literal('Katze'))),
    breed: v.optional(v.string()),
    gender: v.optional(v.union(v.literal('weiblich'), v.literal('männlich'))),
    birthDate: v.optional(v.string()),
    shoulderHeight: v.optional(v.string()),
    color: v.optional(v.string()),
    castrated: v.optional(v.union(v.literal('JA'), v.literal('NEIN'))),
    vaccinated: v.optional(v.union(v.literal('JA'), v.literal('NEIN'), v.literal('teilweise'))),
    chipped: v.optional(v.union(v.literal('vollständig'), v.literal('teilweise'), v.literal('nein'))),
    bloodType: v.optional(v.string()),
    health: v.optional(v.union(v.literal('JA'), v.literal('NEIN'))),
    healthText: v.optional(v.string()),
    diseases: v.optional(v.string()),
    handicap: v.optional(v.string()),
    characteristics: v.optional(v.string()),
    characteristicsBG: v.optional(v.string()),
    compatibleDogs: v.optional(v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden'))),
    compatibleCats: v.optional(v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden'))),
    compatibleChildren: v.optional(v.union(v.literal('JA'), v.literal('NEIN'), v.literal('kann getestet werden'))),
    compatibilityText: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    webLink: v.optional(v.string()),
    descShort: v.optional(v.string()),
    descLong: v.optional(v.string()),
    location: v.optional(v.string()),
    seekingHomeSince: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const { id, ...updates } = args;
    
    // Get current state for audit log
    const animal = await ctx.db.get(id);
    
    await ctx.db.patch(id, updates);

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'ANIMAL_UPDATE' as AuditAction,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      targetType: 'animal',
      targetId: id,
      targetName: animal?.name ?? 'Unbekannt',
      details: JSON.stringify({ updatedFields: Object.keys(updates) }),
    });
    
    return id;
  },
});

// Delete animal
export const remove = mutation({
  args: { id: v.id('animals') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    if (user.role !== 'admin') {
      throw new Error('Only admins can delete animals');
    }

    // Get animal data before deletion for audit log
    const animal = await ctx.db.get(args.id);

    await ctx.db.delete(args.id);

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'ANIMAL_DELETE' as AuditAction,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      targetType: 'animal',
      targetId: args.id,
      targetName: animal?.name ?? 'Unbekannt',
      details: JSON.stringify({ animal: animal?.animal, status: animal?.status }),
    });
  },
});

// Search animals by name, breed, or location
export const search = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const searchLower = args.searchTerm.toLowerCase().trim();
    const limit = args.limit ?? 10;

    if (!searchLower) {
      return [];
    }

    // Get all animals and filter client-side (Convex doesn't have native text search)
    const animals = await ctx.db.query('animals').collect();

    const filtered = animals
      .filter((animal: Doc<'animals'>) => {
        const nameMatch = animal.name.toLowerCase().includes(searchLower);
        const breedMatch = animal.breed.toLowerCase().includes(searchLower);
        const locationMatch = animal.location.toLowerCase().includes(searchLower);
        const typeMatch = animal.animal.toLowerCase().includes(searchLower);
        return nameMatch || breedMatch || locationMatch || typeMatch;
      })
      .slice(0, limit);

    return filtered.map((animal: Doc<'animals'>) => ({
      _id: animal._id,
      name: animal.name,
      animal: animal.animal,
      breed: animal.breed,
      location: animal.location,
      status: animal.status,
      thumbnailId: animal.gallery[0] ?? null,
    }));
  },
});

// Update animal status
export const updateStatus = mutation({
  args: {
    id: v.id('animals'),
    status: v.union(
      v.literal('ENTWURF'),
      v.literal('ABGELEHNT'),
      v.literal('AKZEPTIERT'),
      v.literal('FINALISIERT')
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    if (user.role !== 'manager' && user.role !== 'admin') {
      throw new Error('Unauthorized: Only managers and admins can update status');
    }

    // Get current state for audit log
    const animal = await ctx.db.get(args.id);
    const previousStatus = animal?.status;

    const updates: {
      status: typeof args.status;
      reviewedBy?: Id<'users'>;
      reviewedAt?: number;
      finalizedBy?: Id<'users'>;
      finalizedAt?: number;
    } = { status: args.status };

    if (args.status === 'AKZEPTIERT') {
      updates.reviewedBy = user._id;
      updates.reviewedAt = Date.now();

      // Trigger translation
      await ctx.scheduler.runAfter(0, internal.translation.translateAnimalProfile, {
        animalId: args.id,
      });
    } else if (args.status === 'FINALISIERT') {
      updates.finalizedBy = user._id;
      updates.finalizedAt = Date.now();

      // Trigger distribution
      await ctx.scheduler.runAfter(0, internal.distribution.distributeAnimal, {
        animalId: args.id,
      });

      // Trigger matchpfote sync
      await ctx.scheduler.runAfter(1000, internal.matchpfote.syncAnimalToMatchpfote, {
        animalId: args.id,
      });
    }

    await ctx.db.patch(args.id, updates);

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'ANIMAL_STATUS_CHANGE' as AuditAction,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      targetType: 'animal',
      targetId: args.id,
      targetName: animal?.name ?? 'Unbekannt',
      previousValue: previousStatus,
      newValue: args.status,
      details: JSON.stringify({ animal: animal?.animal }),
    });

    return args.id;
  },
});
