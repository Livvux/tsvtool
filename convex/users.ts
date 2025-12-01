import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import type { AuditAction } from './auditLog';
import type { RateLimitResult } from './rateLimit';

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

    // Backward compatibility: Return user with isApproved defaulting to true if undefined
    // The frontend will handle undefined as approved
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
      const updates: { name?: string; email?: string; isApproved?: boolean } = {};
      if (user.name !== identity.name || user.email !== identity.email) {
        updates.name = identity.name;
        updates.email = identity.email!;
      }
      // Backward compatibility: Auto-approve existing users without isApproved field
      if (user.isApproved === undefined) {
        updates.isApproved = true;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
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

    // Determine if user should be auto-approved
    // Users from invitations are auto-approved, others need admin approval
    const isApproved = !!pendingInvitation;

    // If it's a new identity, create a new `User`.
    const newUserId = await ctx.db.insert('users', {
      name: identity.name,
      email: identity.email!,
      tokenIdentifier: identity.tokenIdentifier,
      role: role,
      isApproved: isApproved,
    });

    // Log audit entry for new user creation
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_CREATE' as AuditAction,
      userId: newUserId,
      userName: identity.name,
      userEmail: identity.email!,
      targetType: 'user',
      targetId: newUserId,
      targetName: identity.name ?? identity.email!,
      details: JSON.stringify({ role, fromInvitation: !!pendingInvitation, isApproved }),
    });

    return newUserId;
  },
});

/**
 * Get pending (unapproved) users. Only accessible by admins.
 */
export const listPending = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('ACCESS_DENIED:Only admins can list pending users');
    }

    // Get all users and filter for pending (isApproved === false)
    // Note: Users with isApproved === undefined are treated as approved (backward compatibility)
    const allUsers = await ctx.db.query('users').collect();
    return allUsers.filter(u => u.isApproved === false);
  },
});

/**
 * Approve a user. Only accessible by admins.
 */
export const approve = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'ACCESS_DENIED' as AuditAction,
        userId: currentUser?._id,
        userName: currentUser?.name,
        userEmail: currentUser?.email ?? identity.email,
        targetType: 'user',
        targetId: args.userId,
        details: JSON.stringify({ 
          attemptedAction: 'USER_APPROVE',
          userRole: currentUser?.role ?? 'unknown'
        }),
      });
      throw new Error('Only admins can approve users');
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (targetUser.isApproved) {
      throw new Error('User is already approved');
    }

    await ctx.db.patch(args.userId, {
      isApproved: true,
      approvedBy: currentUser._id,
      approvedAt: Date.now(),
    });

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_APPROVE' as AuditAction,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      targetType: 'user',
      targetId: args.userId,
      targetName: targetUser.name ?? targetUser.email,
    });

    return args.userId;
  },
});

/**
 * Reject (delete) a pending user. Only accessible by admins.
 */
export const reject = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const currentUser = await ctx.db
      .query('users')
      .withIndex('tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!currentUser || currentUser.role !== 'admin') {
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'ACCESS_DENIED' as AuditAction,
        userId: currentUser?._id,
        userName: currentUser?.name,
        userEmail: currentUser?.email ?? identity.email,
        targetType: 'user',
        targetId: args.userId,
        details: JSON.stringify({ 
          attemptedAction: 'USER_REJECT',
          userRole: currentUser?.role ?? 'unknown'
        }),
      });
      throw new Error('Only admins can reject users');
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (targetUser.isApproved) {
      throw new Error('Cannot reject an already approved user. Use delete instead.');
    }

    await ctx.db.delete(args.userId);

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_REJECT' as AuditAction,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      targetType: 'user',
      targetId: args.userId,
      targetName: targetUser.name ?? targetUser.email,
    });
  },
});

/**
 * List all users. Only accessible by admins.
 * Logs access denied attempts for security monitoring.
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
      // Log access denied attempt (scheduled to avoid blocking the query)
      // Note: Queries can't schedule, so we throw and let the frontend handle logging
      throw new Error('ACCESS_DENIED:Only admins can list users');
    }

    return await ctx.db.query('users').collect();
  },
});

/**
 * Update a user's role. Only accessible by admins.
 * Includes rate limiting and access denied logging.
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
      // Log access denied attempt
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'ACCESS_DENIED' as AuditAction,
        userId: currentUser?._id,
        userName: currentUser?.name,
        userEmail: currentUser?.email ?? identity.email,
        targetType: 'user',
        targetId: args.userId,
        details: JSON.stringify({ 
          attemptedAction: 'USER_UPDATE_ROLE',
          userRole: currentUser?.role ?? 'unknown'
        }),
      });
      throw new Error('Only admins can update user roles');
    }

    // Check rate limit
    const rateLimitResult = await ctx.runQuery(internal.rateLimit.checkRateLimit, {
      userId: currentUser._id,
      action: 'USER_UPDATE_ROLE',
    }) as RateLimitResult;

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'RATE_LIMIT_EXCEEDED' as AuditAction,
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        targetType: 'system',
        details: JSON.stringify({ 
          attemptedAction: 'USER_UPDATE_ROLE',
          resetAt: rateLimitResult.resetAt
        }),
      });
      throw new Error(`Rate limit exceeded. Try again later.`);
    }

    // Record action for rate limiting
    await ctx.runMutation(internal.rateLimit.recordAction, {
      userId: currentUser._id,
      action: 'USER_UPDATE_ROLE',
    });

    // Get target user for audit log
    const targetUser = await ctx.db.get(args.userId);
    const previousRole = targetUser?.role;

    await ctx.db.patch(args.userId, { role: args.role });

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_UPDATE_ROLE' as AuditAction,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      targetType: 'user',
      targetId: args.userId,
      targetName: targetUser?.name ?? targetUser?.email ?? 'Unbekannt',
      previousValue: previousRole,
      newValue: args.role,
    });

    return args.userId;
  },
});

/**
 * Remove a user. Only accessible by admins.
 * Includes rate limiting and access denied logging.
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
      // Log access denied attempt
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'ACCESS_DENIED' as AuditAction,
        userId: currentUser?._id,
        userName: currentUser?.name,
        userEmail: currentUser?.email ?? identity.email,
        targetType: 'user',
        targetId: args.userId,
        details: JSON.stringify({ 
          attemptedAction: 'USER_DELETE',
          userRole: currentUser?.role ?? 'unknown'
        }),
      });
      throw new Error('Only admins can delete users');
    }

    if (currentUser._id === args.userId) {
      throw new Error('Cannot delete yourself');
    }

    // Check rate limit
    const rateLimitResult = await ctx.runQuery(internal.rateLimit.checkRateLimit, {
      userId: currentUser._id,
      action: 'USER_DELETE',
    }) as RateLimitResult;

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'RATE_LIMIT_EXCEEDED' as AuditAction,
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        targetType: 'system',
        details: JSON.stringify({ 
          attemptedAction: 'USER_DELETE',
          resetAt: rateLimitResult.resetAt
        }),
      });
      throw new Error(`Rate limit exceeded. Try again later.`);
    }

    // Record action for rate limiting
    await ctx.runMutation(internal.rateLimit.recordAction, {
      userId: currentUser._id,
      action: 'USER_DELETE',
    });

    // Get target user data before deletion for audit log
    const targetUser = await ctx.db.get(args.userId);

    await ctx.db.delete(args.userId);

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_DELETE' as AuditAction,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      targetType: 'user',
      targetId: args.userId,
      targetName: targetUser?.name ?? targetUser?.email ?? 'Unbekannt',
      details: JSON.stringify({ deletedUserRole: targetUser?.role }),
    });
  },
});

/**
 * Store a user invitation with role. Only accessible by admins.
 * This is called when an admin invites a user via Clerk.
 * Includes rate limiting and access denied logging.
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
      // Log access denied attempt
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'ACCESS_DENIED' as AuditAction,
        userId: currentUser?._id,
        userName: currentUser?.name,
        userEmail: currentUser?.email ?? identity.email,
        targetType: 'invitation',
        targetName: args.email.toLowerCase(),
        details: JSON.stringify({ 
          attemptedAction: 'USER_INVITE',
          userRole: currentUser?.role ?? 'unknown',
          attemptedRole: args.role
        }),
      });
      throw new Error('Only admins can create invitations');
    }

    // Check rate limit
    const rateLimitResult = await ctx.runQuery(internal.rateLimit.checkRateLimit, {
      userId: currentUser._id,
      action: 'USER_INVITE',
    }) as RateLimitResult;

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
        action: 'RATE_LIMIT_EXCEEDED' as AuditAction,
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        targetType: 'system',
        details: JSON.stringify({ 
          attemptedAction: 'USER_INVITE',
          resetAt: rateLimitResult.resetAt
        }),
      });
      throw new Error(`Rate limit exceeded. You can invite max 10 users per hour.`);
    }

    // Record action for rate limiting
    await ctx.runMutation(internal.rateLimit.recordAction, {
      userId: currentUser._id,
      action: 'USER_INVITE',
    });

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
    const invitationId = await ctx.db.insert('userInvitations', {
      email: args.email.toLowerCase(),
      role: args.role,
      clerkInvitationId: args.clerkInvitationId,
      used: false,
      createdAt: Date.now(),
      createdBy: args.createdBy,
    });

    // Log audit entry
    await ctx.scheduler.runAfter(0, internal.auditLog.createInternal, {
      action: 'USER_INVITE' as AuditAction,
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      targetType: 'invitation',
      targetId: invitationId,
      targetName: args.email.toLowerCase(),
      details: JSON.stringify({ role: args.role }),
    });

    return invitationId;
  },
});
