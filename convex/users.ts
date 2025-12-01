import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get the current user record, or null if not authenticated or not found.
 */
export const getCurrent = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Store (create or update) the current user.
 * Should be called after login to ensure the user exists in the database.
 * If the user was invited with a role, that role will be used.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Called storeUser without authentication present');
    }

    // Check if we've already stored this identity.
    const user = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (user !== null) {
      // If we've seen this identity before but the name/email has changed, patch the value.
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, { name: identity.name, email: identity.email! });
      }
      return user._id;
    }

    // Check if there's a pending invitation with a role for this email
    let role: 'admin' | 'input' | 'manager' = 'input'; // Default role
    
    const pendingInvitation = await ctx.db
      .query('userInvitations')
      .withIndex('email', (q) => q.eq('email', identity.email!.toLowerCase()))
      .filter((q) => q.eq(q.field('used'), false))
      .first();

    if (pendingInvitation) {
      role = pendingInvitation.role;
      // Mark invitation as used
      await ctx.db.patch(pendingInvitation._id, { used: true, usedAt: Date.now() });
    }

    // If it's a new identity, create a new `User`.
    return await ctx.db.insert('users', {
      name: identity.name,
      email: identity.email!,
      tokenIdentifier: identity.tokenIdentifier,
      role: role,
    });
  },
});

/**
 * List all users. Only accessible by admins.
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can list users');
    }

    return await ctx.db.query('users').collect();
  },
});

/**
 * Update a user's role. Only accessible by admins.
 */
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can update user roles');
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});

/**
 * Remove a user. Only accessible by admins.
 */
export const remove = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can delete users');
    }

    if (currentUser._id === args.userId) {
      throw new Error('Cannot delete yourself');
    }

    await ctx.db.delete(args.userId);
  },
});

/**
 * Store a user invitation with role. Only accessible by admins.
 * This is called when an admin invites a user via Clerk.
 */
export const storeInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal('admin'),
      v.literal('input'),
      v.literal('manager')
    ),
    clerkInvitationId: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can create invitations');
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await ctx.db
      .query('userInvitations')
      .withIndex('email', (q) => q.eq('email', args.email.toLowerCase()))
      .filter((q) => q.eq(q.field('used'), false))
      .first();

    if (existingInvitation) {
      // Update existing invitation
      await ctx.db.patch(existingInvitation._id, {
        role: args.role,
        clerkInvitationId: args.clerkInvitationId,
      });
      return existingInvitation._id;
    }

    // Create new invitation
    return await ctx.db.insert('userInvitations', {
      email: args.email.toLowerCase(),
      role: args.role,
      clerkInvitationId: args.clerkInvitationId,
      used: false,
      createdAt: Date.now(),
      createdBy: args.createdBy,
    });
  },
});
