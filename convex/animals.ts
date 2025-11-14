import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found');

    const animalId = await ctx.db.insert('animals', {
      ...args,
      status: 'ENTWURF',
      createdBy: userId,
      createdByRole: user.role,
      descShortBG: args.descShort,
      distributedTo: {},
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

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

// Get single animal by ID
export const get = query({
  args: { id: v.id('animals') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    
    return id;
  },
});

// Delete animal
export const remove = mutation({
  args: { id: v.id('animals') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can delete animals');
    }

    await ctx.db.delete(args.id);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const updates: {
      status: typeof args.status;
      reviewedBy?: Id<'users'>;
      reviewedAt?: number;
      finalizedBy?: Id<'users'>;
      finalizedAt?: number;
    } = { status: args.status };

    if (args.status === 'AKZEPTIERT') {
      updates.reviewedBy = userId;
      updates.reviewedAt = Date.now();

      // Trigger translation
      await ctx.scheduler.runAfter(0, internal.translation.translateAnimalProfile, {
        animalId: args.id,
      });
    } else if (args.status === 'FINALISIERT') {
      updates.finalizedBy = userId;
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
    return args.id;
  },
});

