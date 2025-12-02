import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';
import type { Doc } from './_generated/dataModel';

// Rate limit configurations (actions per time window)
const RATE_LIMITS: Record<string, { maxActions: number; windowMs: number }> = {
  USER_INVITE: { maxActions: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  USER_DELETE: { maxActions: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  USER_UPDATE_ROLE: { maxActions: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
};

/**
 * Check if an action is rate limited for a user.
 * Returns true if the action is allowed, false if rate limited.
 */
export const checkRateLimit = internalQuery({
  args: {
    userId: v.id('users'),
    action: v.string(),
  },
  handler: async (ctx, args): Promise<{ allowed: boolean; remaining: number; resetAt: number }> => {
    const config = RATE_LIMITS[args.action];
    if (!config) {
      // No rate limit configured for this action
      return { allowed: true, remaining: -1, resetAt: 0 };
    }

    const windowStart = Date.now() - config.windowMs;

    // Count recent actions
    const recentActions = await ctx.db
      .query('rateLimits')
      .withIndex('userId_action', (q) =>
        q.eq('userId', args.userId).eq('action', args.action)
      )
      .filter((q) => q.gt(q.field('timestamp'), windowStart))
      .collect();

    const remaining = config.maxActions - recentActions.length;
    const allowed = remaining > 0;

    // Calculate reset time (when the oldest action in window expires)
    let resetAt = Date.now() + config.windowMs;
    if (recentActions.length > 0) {
      const oldestInWindow = Math.min(...recentActions.map((a: Doc<'rateLimits'>) => a.timestamp));
      resetAt = oldestInWindow + config.windowMs;
    }

    return { allowed, remaining: Math.max(0, remaining), resetAt };
  },
});

/**
 * Record an action for rate limiting purposes.
 */
export const recordAction = internalMutation({
  args: {
    userId: v.id('users'),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('rateLimits', {
      userId: args.userId,
      action: args.action,
      timestamp: Date.now(),
    });
  },
});

/**
 * Clean up old rate limit records (older than 24 hours).
 * Should be run periodically via a cron job.
 */
export const cleanupOldRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    const oldRecords = await ctx.db
      .query('rateLimits')
      .withIndex('timestamp', (q) => q.lt('timestamp', cutoff))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return { deleted: oldRecords.length };
  },
});

/**
 * Helper type for rate limit check result
 */
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

