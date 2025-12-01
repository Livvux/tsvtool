import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Audit Log Action Types
export const auditActionValidator = v.union(
  // Animal Actions
  v.literal('ANIMAL_CREATE'),
  v.literal('ANIMAL_UPDATE'),
  v.literal('ANIMAL_DELETE'),
  v.literal('ANIMAL_STATUS_CHANGE'),
  // User Actions
  v.literal('USER_CREATE'),
  v.literal('USER_UPDATE_ROLE'),
  v.literal('USER_DELETE'),
  v.literal('USER_INVITE'),
  v.literal('USER_APPROVE'),
  v.literal('USER_REJECT'),
  // System Actions
  v.literal('VALIDATION_SUCCESS'),
  v.literal('VALIDATION_FAILURE'),
  v.literal('TRANSLATION_SUCCESS'),
  v.literal('TRANSLATION_FAILURE'),
  v.literal('DISTRIBUTION_SUCCESS'),
  v.literal('DISTRIBUTION_FAILURE'),
  v.literal('MATCHPFOTE_SYNC_SUCCESS'),
  v.literal('MATCHPFOTE_SYNC_FAILURE'),
  // Security Actions
  v.literal('ACCESS_DENIED'),
  v.literal('RATE_LIMIT_EXCEEDED')
);

const schema = defineSchema({
  // Audit Logs table for tracking all system actions
  auditLogs: defineTable({
    action: auditActionValidator,
    userId: v.optional(v.id('users')), // User who performed the action (null for system actions)
    userName: v.optional(v.string()), // Cached user name for display
    userEmail: v.optional(v.string()), // Cached user email for display
    targetType: v.union(
      v.literal('animal'),
      v.literal('user'),
      v.literal('invitation'),
      v.literal('system')
    ),
    targetId: v.optional(v.string()), // ID of the affected entity
    targetName: v.optional(v.string()), // Name/description of the affected entity
    details: v.optional(v.string()), // JSON string with additional details
    previousValue: v.optional(v.string()), // Previous state (for updates)
    newValue: v.optional(v.string()), // New state (for updates)
    ipAddress: v.optional(v.string()), // IP address if available
    timestamp: v.number(), // Unix timestamp
  })
    .index('action', ['action'])
    .index('userId', ['userId'])
    .index('targetType', ['targetType'])
    .index('timestamp', ['timestamp'])
    .index('action_timestamp', ['action', 'timestamp']),

  // Users table with roles
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.union(
      v.literal('admin'),
      v.literal('input'),
      v.literal('manager')
    ),
    // Clerk ID (tokenIdentifier)
    tokenIdentifier: v.string(),
    // Approval status - new users must be approved by admin
    // Optional for backward compatibility with existing users (they are auto-approved)
    isApproved: v.optional(v.boolean()),
    approvedBy: v.optional(v.id('users')),
    approvedAt: v.optional(v.number()),
  })
    .index('email', ['email'])
    .index('role', ['role'])
    .index('tokenIdentifier', ['tokenIdentifier'])
    .index('isApproved', ['isApproved']),

  // User invitations table - stores pending invitations with roles
  userInvitations: defineTable({
    email: v.string(),
    role: v.union(
      v.literal('admin'),
      v.literal('input'),
      v.literal('manager')
    ),
    clerkInvitationId: v.optional(v.string()),
    used: v.boolean(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.optional(v.string()), // Admin user ID who created the invitation
  })
    .index('email', ['email'])
    .index('used', ['used']),

  // Rate limiting table for tracking action frequency
  rateLimits: defineTable({
    userId: v.id('users'),
    action: v.string(), // Action type (e.g., 'USER_INVITE', 'USER_DELETE')
    timestamp: v.number(), // Unix timestamp of the action
  })
    .index('userId_action', ['userId', 'action'])
    .index('timestamp', ['timestamp']),

  // Animals table
  animals: defineTable({
    // Basic Info
    name: v.string(),
    animal: v.union(v.literal('Hund'), v.literal('Katze')),
    breed: v.string(),
    gender: v.union(v.literal('weiblich'), v.literal('männlich')),
    birthDate: v.optional(v.string()),
    shoulderHeight: v.optional(v.string()),
    color: v.string(),
    
    // Medical
    castrated: v.union(v.literal('JA'), v.literal('NEIN')),
    vaccinated: v.union(
      v.literal('JA'),
      v.literal('NEIN'),
      v.literal('teilweise')
    ),
    chipped: v.union(
      v.literal('vollständig'),
      v.literal('teilweise'),
      v.literal('nein')
    ),
    bloodType: v.optional(v.string()),
    health: v.union(v.literal('JA'), v.literal('NEIN')),
    healthText: v.optional(v.string()),
    diseases: v.optional(v.string()),
    handicap: v.optional(v.string()),
    
    // Behavior
    characteristics: v.string(),
    characteristicsBG: v.optional(v.string()),
    compatibleDogs: v.union(
      v.literal('JA'),
      v.literal('NEIN'),
      v.literal('kann getestet werden')
    ),
    compatibleCats: v.union(
      v.literal('JA'),
      v.literal('NEIN'),
      v.literal('kann getestet werden')
    ),
    compatibleChildren: v.union(
      v.literal('JA'),
      v.literal('NEIN'),
      v.literal('kann getestet werden')
    ),
    compatibilityText: v.optional(v.string()),
    
    // Media - Bilder
    gallery: v.array(v.string()),
    // Media - Videos (Storage IDs)
    videos: v.optional(v.array(v.string())),
    // Externe Links
    videoLink: v.optional(v.string()),
    webLink: v.optional(v.string()),
    
    // Content
    descShort: v.string(),
    descLong: v.optional(v.string()),
    descShortBG: v.optional(v.string()),
    
    // Status & Workflow
    status: v.union(
      v.literal('ENTWURF'),
      v.literal('ABGELEHNT'),
      v.literal('AKZEPTIERT'),
      v.literal('FINALISIERT')
    ),
    location: v.string(),
    seekingHomeSince: v.optional(v.string()),
    
    // Metadata
    createdBy: v.id('users'),
    createdByRole: v.union(
      v.literal('input'),
      v.literal('manager'),
      v.literal('admin')
    ),
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    finalizedBy: v.optional(v.id('users')),
    finalizedAt: v.optional(v.number()),
    
    // Distribution
    distributedTo: v.object({
      wordpress: v.optional(v.boolean()),
      facebook: v.optional(v.boolean()),
      instagram: v.optional(v.boolean()),
      x: v.optional(v.boolean()),
      matchpfote: v.optional(v.boolean()),
      distributedAt: v.optional(v.number()),
    }),
  })
    .index('status', ['status'])
    .index('createdBy', ['createdBy'])
    .index('createdBy_status', ['createdBy', 'status'])
    .index('status_finalizedAt', ['status', 'finalizedAt']),
});

export default schema;
