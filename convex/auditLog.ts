import { v } from 'convex/values';
import { mutation, query, internalMutation, QueryCtx, MutationCtx } from './_generated/server';
import { Doc } from './_generated/dataModel';
import { auditActionValidator } from './schema';

// Type for audit actions
export type AuditAction =
  | 'ANIMAL_CREATE'
  | 'ANIMAL_UPDATE'
  | 'ANIMAL_DELETE'
  | 'ANIMAL_STATUS_CHANGE'
  | 'USER_CREATE'
  | 'USER_UPDATE_ROLE'
  | 'USER_DELETE'
  | 'USER_INVITE'
  | 'VALIDATION_SUCCESS'
  | 'VALIDATION_FAILURE'
  | 'TRANSLATION_SUCCESS'
  | 'TRANSLATION_FAILURE'
  | 'DISTRIBUTION_SUCCESS'
  | 'DISTRIBUTION_FAILURE'
  | 'MATCHPFOTE_SYNC_SUCCESS'
  | 'MATCHPFOTE_SYNC_FAILURE'
  | 'ACCESS_DENIED'
  | 'RATE_LIMIT_EXCEEDED';

/**
 * Helper function to get the current user from Clerk authentication.
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

/**
 * Internal mutation to create an audit log entry.
 * Used by other Convex functions to log actions.
 */
export const createInternal = internalMutation({
  args: {
    action: auditActionValidator,
    userId: v.optional(v.id('users')),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    targetType: v.union(
      v.literal('animal'),
      v.literal('user'),
      v.literal('invitation'),
      v.literal('system')
    ),
    targetId: v.optional(v.string()),
    targetName: v.optional(v.string()),
    details: v.optional(v.string()),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      ...args,
      timestamp: Date.now(),
    });
  },
});

/**
 * Create an audit log entry (for authenticated users).
 * Automatically captures the current user's information.
 */
export const create = mutation({
  args: {
    action: auditActionValidator,
    targetType: v.union(
      v.literal('animal'),
      v.literal('user'),
      v.literal('invitation'),
      v.literal('system')
    ),
    targetId: v.optional(v.string()),
    targetName: v.optional(v.string()),
    details: v.optional(v.string()),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert('auditLogs', {
      ...args,
      userId: user?._id,
      userName: user?.name,
      userEmail: user?.email,
      timestamp: Date.now(),
    });
  },
});

/**
 * List audit logs with optional filtering.
 * Only accessible by admins.
 */
export const list = query({
  args: {
    action: v.optional(auditActionValidator),
    targetType: v.optional(
      v.union(
        v.literal('animal'),
        v.literal('user'),
        v.literal('invitation'),
        v.literal('system')
      )
    ),
    userId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()), // timestamp for pagination
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    if (user.role !== 'admin') throw new Error('Only admins can view audit logs');

    const limit = args.limit ?? 50;

    let logsQuery = ctx.db.query('auditLogs').withIndex('timestamp').order('desc');

    // Apply cursor (timestamp-based pagination)
    if (args.cursor) {
      logsQuery = ctx.db
        .query('auditLogs')
        .withIndex('timestamp', (q) => q.lt('timestamp', args.cursor!))
        .order('desc');
    }

    // Collect and filter
    let logs = await logsQuery.take(limit * 2); // Take more to filter

    // Apply filters
    if (args.action) {
      logs = logs.filter((log: Doc<'auditLogs'>) => log.action === args.action);
    }
    if (args.targetType) {
      logs = logs.filter((log: Doc<'auditLogs'>) => log.targetType === args.targetType);
    }
    if (args.userId) {
      logs = logs.filter((log: Doc<'auditLogs'>) => log.userId === args.userId);
    }

    // Limit results
    logs = logs.slice(0, limit);

    return {
      logs,
      nextCursor: logs.length === limit ? logs[logs.length - 1]?.timestamp : null,
    };
  },
});

/**
 * Get a single audit log entry by ID.
 * Only accessible by admins.
 */
export const get = query({
  args: { id: v.id('auditLogs') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    if (user.role !== 'admin') throw new Error('Only admins can view audit logs');

    return await ctx.db.get(args.id);
  },
});

/**
 * Get audit log statistics for the dashboard.
 * Only accessible by admins.
 */
export const getStats = query({
  args: {
    days: v.optional(v.number()), // Number of days to look back (default: 7)
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    if (user.role !== 'admin') throw new Error('Only admins can view audit logs');

    const days = args.days ?? 7;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('timestamp', (q) => q.gt('timestamp', cutoff))
      .collect();

    // Count by action type
    const actionCounts: Record<string, number> = {};
    for (const log of logs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    }

    // Count by target type
    const targetCounts: Record<string, number> = {};
    for (const log of logs) {
      targetCounts[log.targetType] = (targetCounts[log.targetType] || 0) + 1;
    }

    // Count errors
    const errorCount = logs.filter(
      (log: Doc<'auditLogs'>) =>
        log.action.includes('FAILURE') ||
        log.action === 'VALIDATION_FAILURE' ||
        log.action === 'TRANSLATION_FAILURE' ||
        log.action === 'DISTRIBUTION_FAILURE' ||
        log.action === 'MATCHPFOTE_SYNC_FAILURE'
    ).length;

    return {
      total: logs.length,
      actionCounts,
      targetCounts,
      errorCount,
      successCount: logs.length - errorCount,
    };
  },
});

/**
 * Get audit logs for a specific entity.
 * Only accessible by admins.
 */
export const getByTarget = query({
  args: {
    targetType: v.union(
      v.literal('animal'),
      v.literal('user'),
      v.literal('invitation'),
      v.literal('system')
    ),
    targetId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    if (user.role !== 'admin') throw new Error('Only admins can view audit logs');

    const limit = args.limit ?? 20;

    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('targetType', (q) => q.eq('targetType', args.targetType))
      .filter((q) => q.eq(q.field('targetId'), args.targetId))
      .order('desc')
      .take(limit);

    return logs;
  },
});

