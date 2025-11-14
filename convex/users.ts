import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

// Get all users (admin only)
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can list users');
    }

    return await ctx.db.query('users').collect();
  },
});

// Get current user
export const getCurrent = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

// Update user role (admin only)
export const updateRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(
      v.literal('admin'),
      v.literal('input'),
      v.literal('manager')
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error('Not authenticated');

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can update user roles');
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});

// Delete user (admin only)
export const remove = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error('Not authenticated');

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can delete users');
    }

    // Prevent self-deletion
    if (currentUserId === args.userId) {
      throw new Error('Cannot delete yourself');
    }

    await ctx.db.delete(args.userId);
  },
});

