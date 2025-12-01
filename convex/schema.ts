import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
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
  })
    .index('email', ['email'])
    .index('role', ['role'])
    .index('tokenIdentifier', ['tokenIdentifier']),

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
