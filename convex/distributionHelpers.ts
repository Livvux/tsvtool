/**
 * Distribution Helper Functions
 * 
 * These are separated from distribution.ts because:
 * - distribution.ts uses "use node" for crypto/OAuth
 * - Queries and Mutations cannot be in "use node" files
 */

import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

// Internal query to get animal for distribution
export const getAnimal = internalQuery({
  args: { animalId: v.id('animals') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.animalId);
  },
});

// Internal mutation to update distribution status
export const updateDistributionStatus = internalMutation({
  args: {
    animalId: v.id('animals'),
    results: v.object({
      wordpress: v.boolean(),
      facebook: v.boolean(),
      instagram: v.boolean(),
      x: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.animalId, {
      distributedTo: {
        wordpress: args.results.wordpress,
        facebook: args.results.facebook,
        instagram: args.results.instagram,
        x: args.results.x,
        distributedAt: Date.now(),
      },
    });
  },
});

