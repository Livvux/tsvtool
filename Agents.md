# TSVTool - Agent Context Documentation

## Project Overview

**TSVTool** is a modern animal management system for TSV Strassenpfoten e.V., built with Next.js 16 and Convex. The system manages the workflow from animal profile creation (in Bulgarian) through translation, review, and final distribution to multiple external platforms.

### Purpose
- **Input Team (Bulgarian)**: Creates animal profiles in Bulgarian
- **Manager Team (German)**: Reviews, edits, and finalizes profiles
- **Admin**: Full system access and user management
- **Automated Workflows**: Validation, translation, and distribution

---

## Tech Stack

### Frontend
- **Next.js 16.0.3** (App Router)
- **React 19.2.0**
- **TypeScript 5.9.3**
- **Tailwind CSS 4.1.17** (with TSV Strassenpfoten branding)
- **shadcn/ui** components (Radix UI primitives)
- **React Hook Form 7.66.0** with Zod validation

### Backend
- **Convex 1.29.3** (Database, File Storage, Actions)
- **Clerk** (Authentication via @clerk/nextjs)

### Development Tools
- **Vitest 2.1.8** (Testing)
- **ESLint 9.39.1** with Next.js config
- **Turbopack** (via `next dev --turbo`)

---

## Next.js 16 Configuration

### Key Features Enabled
- **App Router**: All routes use the App Router pattern
- **React Server Components**: Default for all components
- **Client Components**: Marked with `'use client'` directive
- **Route Segment Config**: `dynamic = 'force-dynamic'` and `revalidate = 0` on data-dependent pages
- **Clerk Middleware**: Uses `middleware.ts` with `clerkMiddleware` for authentication

### Performance Optimizations
- **Package Import Optimization**: Optimized imports for `convex/react` and Radix UI
- **Image Optimization**: AVIF/WebP formats, responsive sizes
- **Caching Headers**: Static assets cached for 1 year
- **Experimental Features**:
  - `cacheComponents: true` (Partial Prerendering)
  - `turbopackFileSystemCacheForDev: true`
  - `optimizeCss: true`

### Configuration Files
- `next.config.ts`: Main Next.js configuration
- `middleware.ts`: Clerk authentication middleware
- `tsconfig.json`: TypeScript configuration with path aliases (`@/*`)

### Next.js DevTools Integration
- **Status**: Ready for integration
- **Note**: Next.js DevTools MCP should be initialized at session start
- **Usage**: When available, use next-devtools-mcp for Next.js-specific API queries and documentation

---

## Project Structure

```
TSVTool/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (Clerk)
│   │   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk Sign-In
│   │   └── sign-up/[[...sign-up]]/page.tsx  # Clerk Sign-Up
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout with navigation
│   │   ├── page.tsx              # Dashboard home (role-based redirect)
│   │   ├── admin/                # Admin routes
│   │   │   ├── users/page.tsx    # User management
│   │   │   └── settings/page.tsx # Settings
│   │   ├── animals/page.tsx      # Animals list (finalized)
│   │   ├── input/page.tsx        # Animal creation form (Bulgarian)
│   │   └── manager/              # Manager routes
│   │       ├── drafts/page.tsx   # Accepted drafts list
│   │       └── [id]/page.tsx     # Animal edit page
│   ├── api/convex/[...path]/route.ts  # Convex API proxy
│   ├── ConvexClientProvider.tsx  # Convex + Clerk client wrapper
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── error.tsx                 # Error boundary
│   └── not-found.tsx             # 404 page
│
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── form.tsx
│   │   └── badge.tsx
│   ├── animal/                   # Animal-specific components
│   │   ├── AnimalCard.tsx
│   │   └── DistributionStatus.tsx
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
│       ├── ErrorBoundary.tsx
│       └── LoadingSpinner.tsx
│
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated Convex types
│   ├── schema.ts                 # Database schema
│   ├── auth.config.ts            # Clerk JWT validation config
│   ├── animals.ts                # Animal CRUD operations
│   ├── users.ts                  # User management
│   ├── validation.ts             # Auto-validation logic
│   ├── translation.ts             # Google Translate integration
│   ├── distribution.ts           # External platform distribution
│   ├── matchpfote.ts             # matchpfote API integration
│   ├── storage.ts                # File upload helpers
│   └── http.ts                   # HTTP routes
│
├── lib/                          # Utility functions
│   ├── logger.ts                 # Logging utility
│   ├── branding.ts               # Branding constants
│   ├── validation.ts             # Validation helpers
│   ├── animal-helpers.ts         # Animal-specific utilities
│   └── utils.ts                  # General utilities
│
├── types/                        # TypeScript types
│   └── animal.ts                 # Animal type definitions
│
├── docs/                         # Documentation
│   ├── branding/                 # Branding assets
│   ├── plan.md                   # Project plan
│   ├── matchpfote-integration-guide.md
│   └── performance-optimizations.md
│
├── __tests__/                    # Test files
│   ├── components/
│   └── lib/
│
├── middleware.ts                 # Clerk authentication middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── vitest.config.ts              # Vitest configuration
└── package.json                  # Dependencies
```

---

## Authentication & Authorization

### Authentication System
- **Provider**: Clerk (via @clerk/nextjs)
- **Middleware**: `middleware.ts` with `clerkMiddleware` handles route protection
- **Public Routes**: `/`, `/sign-in`, `/sign-up`, `/api/convex/*`
- **Protected Routes**: All `/dashboard/*` routes

### User Roles
1. **admin**: Full system access, user management
2. **input**: Create animal profiles (Bulgarian team)
3. **manager**: Review and finalize profiles (German team)

### Authentication Flow
1. User visits `/sign-in` (Clerk hosted UI)
2. `middleware.ts` checks authentication via `clerkMiddleware`
3. Unauthenticated users redirected to `/sign-in`
4. Authenticated users synced to Convex via `users.store` mutation
5. Role-based navigation in dashboard layout

### Clerk Configuration
- JWT validation via `convex/auth.config.ts`
- User sync on first dashboard visit
- Session management via Clerk

### Key Files
- `middleware.ts`: Route protection with `clerkMiddleware`
- `convex/auth.config.ts`: Clerk JWT validation for Convex
- `app/dashboard/layout.tsx`: Role-based navigation
- `app/ConvexClientProvider.tsx`: Convex + Clerk client wrapper

---

## Database Schema (Convex)

### Tables

#### `users`
```typescript
{
  name?: string
  email?: string
  tokenIdentifier: string  // Clerk user ID (e.g., "clerk|user_...")
  role: 'admin' | 'input' | 'manager'
}
```
**Indexes**: `tokenIdentifier`, `role`
**Default Role**: New users default to `'input'` role

#### `animals`
```typescript
{
  // Basic Info
  name: string
  animal: 'Hund' | 'Katze'
  breed: string
  gender: 'weiblich' | 'männlich'
  birthDate?: string (format: TT.MM.JJJJ)
  shoulderHeight?: string
  color: string
  
  // Medical
  castrated: 'JA' | 'NEIN'
  vaccinated: 'JA' | 'NEIN' | 'teilweise'
  chipped: 'vollständig' | 'teilweise' | 'nein'
  bloodType?: string
  health: 'JA' | 'NEIN'
  healthText?: string
  diseases?: string
  handicap?: string
  
  // Behavior
  characteristics: string
  compatibleDogs: 'JA' | 'NEIN' | 'kann getestet werden'
  compatibleCats: 'JA' | 'NEIN' | 'kann getestet werden'
  compatibleChildren: 'JA' | 'NEIN' | 'kann getestet werden'
  compatibilityText?: string
  
  // Media
  gallery: string[] (storage IDs)
  videoLink?: string
  webLink?: string
  
  // Content
  descShort: string (Bulgarian)
  descLong?: string (German translation)
  descShortBG?: string (original Bulgarian)
  
  // Status & Workflow
  status: 'ENTWURF' | 'ABGELEHNT' | 'AKZEPTIERT' | 'FINALISIERT'
  location: string
  seekingHomeSince?: string
  
  // Metadata
  createdBy: Id<'users'>
  createdByRole: 'input' | 'manager' | 'admin'
  reviewedBy?: Id<'users'>
  reviewedAt?: number
  finalizedBy?: Id<'users'>
  finalizedAt?: number
  
  // Distribution
  distributedTo: {
    wordpress?: boolean
    facebook?: boolean
    instagram?: boolean
    x?: boolean
    matchpfote?: boolean
    distributedAt?: number
  }
}
```
**Indexes**: `status`, `createdBy`, `createdBy_status`, `status_finalizedAt`

---

## Workflow System

### Animal Profile Lifecycle

#### 1. Creation (ENTWURF)
- **Actor**: Input user (Bulgarian team)
- **Action**: Creates animal profile via `/dashboard/input`
- **Status**: `ENTWURF`
- **Trigger**: Automatic validation scheduled after creation (0ms delay)
- **Function**: `animals.create` mutation

#### 2. Validation (Automatic)
- **Trigger**: Scheduled action after profile creation
- **File**: `convex/validation.ts`
- **Function**: `validation.validateAnimalDraft` (internalAction)
- **Process**:
  - Validates required fields (name, breed, color, characteristics, descShort, location)
  - Checks data formats (dates: TT.MM.JJJJ, numbers)
  - Validates gallery (at least 1 image)
  - Validates shoulder height (1-200 cm)
  - Validates seeking home since year (2000-current)
  - Validates descShort minimum length (20 characters)
- **Outcomes**:
  - **Valid** → Status: `AKZEPTIERT` → Triggers translation
  - **Invalid** → Status: `ABGELEHNT` → Logs errors

#### 3. Translation (Automatic)
- **Trigger**: When status changes to `AKZEPTIERT`
- **File**: `convex/translation.ts`
- **Function**: `translation.translateAnimalProfile` (internalAction)
- **Service**: Google Translate API (Bulgarian → German)
- **Fields Translated**:
  - `descShort` → `descLong`
  - `characteristics` (overwrites original)
  - `compatibilityText`
  - `diseases`
  - `handicap`
  - `healthText`
- **Error Handling**: Logs errors but doesn't block workflow

#### 4. Review & Finalization
- **Actor**: Manager user (German team)
- **Action**: Reviews and edits at `/dashboard/manager/[id]`
- **Status Change**: `AKZEPTIERT` → `FINALISIERT`
- **Function**: `animals.updateStatus` mutation
- **Trigger**: Automatic distribution scheduled (0ms delay)
- **Metadata**: Sets `finalizedBy` and `finalizedAt`

#### 5. Distribution (Automatic)
- **Trigger**: When status changes to `FINALISIERT`
- **File**: `convex/distribution.ts`
- **Function**: `distribution.distributeAnimal` (internalAction)
- **Platforms**:
  1. **WordPress** (Avada Portfolio post_type) - POST to `/wp-json/wp/v2/avada_portfolio`
  2. **Facebook** (Page post) - POST to Graph API v18.0
  3. **Instagram** (Post - placeholder) - Needs image URL implementation
  4. **X/Twitter** (Tweet - placeholder) - Needs OAuth 1.0a implementation
- **Status Update**: Updates `distributedTo` object with success/failure

#### 6. matchpfote Sync (Automatic)
- **Trigger**: When status changes to `FINALISIERT` (1s delay after distribution)
- **File**: `convex/matchpfote.ts`
- **Function**: `matchpfote.syncAnimalToMatchpfote` (internalAction)
- **Features**:
  - Rate limiting (100 requests/minute = 600ms interval)
  - Retry with exponential backoff (max 3 retries)
  - Error handling with status updates

### Scheduled Actions
- `validation.validateAnimalDraft`: After creation (0ms delay)
- `translation.translateAnimalProfile`: After acceptance (0ms delay)
- `distribution.distributeAnimal`: After finalization (0ms delay)
- `matchpfote.syncAnimalToMatchpfote`: After finalization (1000ms delay)

---

## API Integrations

### Google Translate API
- **Purpose**: Translate Bulgarian text to German
- **Configuration**: `GOOGLE_TRANSLATE_API_KEY` env var
- **Implementation**: `convex/translation.ts`
- **Endpoint**: `https://translation.googleapis.com/language/translate/v2`
- **Method**: POST with JSON body
- **Error Handling**: Logs errors, doesn't throw (allows workflow to continue)

### WordPress Integration
- **Purpose**: Create Avada Portfolio posts
- **Configuration**: 
  - `WORDPRESS_URL`
  - `WORDPRESS_APP_USERNAME`
  - `WORDPRESS_APP_PASSWORD`
- **Implementation**: `convex/distribution.ts`
- **Endpoint**: `${WORDPRESS_URL}/wp-json/wp/v2/avada_portfolio`
- **Method**: POST with Basic Auth
- **Data**: Includes meta fields for animal attributes

### Facebook Integration
- **Purpose**: Post to Facebook Page
- **Configuration**:
  - `FACEBOOK_PAGE_ID`
  - `FACEBOOK_ACCESS_TOKEN`
- **Implementation**: `convex/distribution.ts`
- **Endpoint**: `https://graph.facebook.com/v18.0/${pageId}/feed`
- **Method**: POST with access token

### Instagram Integration
- **Status**: Placeholder (needs image URL implementation)
- **Configuration**:
  - `INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `INSTAGRAM_ACCESS_TOKEN`
- **Implementation**: `convex/distribution.ts`
- **Note**: Requires media URLs for posting

### X/Twitter Integration
- **Status**: Placeholder (needs OAuth 1.0a implementation)
- **Configuration**:
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_TOKEN_SECRET`
- **Implementation**: `convex/distribution.ts`
- **Note**: Requires OAuth 1.0a signature library

### matchpfote API
- **Purpose**: Sync animal profiles to matchpfote platform
- **Configuration**:
  - `MATCHPFOTE_API_KEY`
  - `MATCHPFOTE_API_URL` (default: `https://matchpfote.de/api/v1`)
- **Implementation**: `convex/matchpfote.ts`
- **Features**:
  - Rate limiting (100 requests/minute = 600ms minimum interval)
  - Retry with exponential backoff (max 3 retries)
  - Error handling with status updates
- **Endpoints**:
  - `POST /animals`: Create animal
  - `PUT /animals/:id`: Update animal
  - `GET /animals`: List animals
- **Data Transformation**: Converts German animal data to matchpfote format

---

## Key Components

### Frontend Components

#### `AnimalCard`
- **Location**: `components/animal/AnimalCard.tsx`
- **Purpose**: Display animal summary in card format
- **Props**: `animal: Animal`, `onClick?: () => void`
- **Features**: Status badge, basic info, clickable

#### `DistributionStatus`
- **Location**: `components/animal/DistributionStatus.tsx`
- **Purpose**: Show distribution status to platforms

#### `ErrorBoundary`
- **Location**: `components/layout/ErrorBoundary.tsx`
- **Purpose**: Catch and display React errors

#### `LoadingSpinner`
- **Location**: `components/layout/LoadingSpinner.tsx`
- **Purpose**: Loading state indicator

#### `ConvexClientProvider`
- **Location**: `app/ConvexClientProvider.tsx`
- **Purpose**: Convex client with Clerk auth integration
- **Features**: 
  - Wraps with `ClerkProvider` and `ConvexProviderWithClerk`
  - Uses `useAuth` from Clerk for authentication
  - Theme toggle support

### Pages

#### `/dashboard/input` (Animal Creation)
- **File**: `app/dashboard/input/page.tsx`
- **Role**: `input` or `admin`
- **Features**:
  - Bilingual form (Bulgarian/German labels)
  - Image upload via Convex storage
  - Client-side validation
  - Form submission to `animals.create`

#### `/dashboard/manager/drafts` (Drafts List)
- **File**: `app/dashboard/manager/drafts/page.tsx`
- **Role**: `manager` or `admin`
- **Features**:
  - Lists animals with status `AKZEPTIERT`
  - Click to edit individual animals

#### `/dashboard/manager/[id]` (Animal Edit)
- **File**: `app/dashboard/manager/[id]/page.tsx`
- **Role**: `manager` or `admin`
- **Features**:
  - Edit animal profile
  - Finalize status (triggers distribution)

#### `/dashboard/animals` (Animals List)
- **File**: `app/dashboard/animals/page.tsx`
- **Role**: `manager` or `admin`
- **Features**: Lists all finalized animals

#### `/dashboard/admin/users` (User Management)
- **File**: `app/dashboard/admin/users/page.tsx`
- **Role**: `admin` only
- **Features**: User management and role assignment

### Convex Functions

#### Animals (`convex/animals.ts`)
- `create`: Create new animal draft (triggers validation)
- `list`: List animals (optionally filtered by status)
- `get`: Get single animal by ID
- `update`: Update animal fields
- `remove`: Delete animal (admin only)
- `updateStatus`: Update status (triggers workflows)

#### Users (`convex/users.ts`)
- `list`: List all users (admin only)
- `getCurrent`: Get current authenticated user
- `updateRole`: Update user role (admin only)
- `remove`: Delete user (admin only)

#### Validation (`convex/validation.ts`)
- `validateAnimalDraft`: Internal action to validate animal
- `getAnimal`: Internal query to get animal
- `updateAnimalStatus`: Internal mutation to update status
- Validates required fields, formats, and gallery

#### Translation (`convex/translation.ts`)
- `translateAnimalProfile`: Internal action to translate animal
- `getAnimal`: Internal query to get animal
- `updateAnimalTranslation`: Internal mutation to update translations
- Uses Google Translate API

#### Distribution (`convex/distribution.ts`)
- `distributeAnimal`: Internal action to distribute to platforms
- `getAnimal`: Internal query to get animal
- `updateDistributionStatus`: Internal mutation to update status
- Updates `distributedTo` status in database

#### matchpfote (`convex/matchpfote.ts`)
- `syncAnimalToMatchpfote`: Internal action to sync to matchpfote
- `getAnimal`: Internal query to get animal
- `updateSyncStatus`: Internal mutation to update sync status
- Includes rate limiting and retry logic

#### Storage (`convex/storage.ts`)
- `generateUploadUrl`: Generate upload URL for client
- `getUrl`: Get download URL for storage ID

---

## File Storage

### Convex Storage
- **Purpose**: Store animal gallery images
- **Implementation**: `convex/storage.ts`
- **Functions**:
  - `generateUploadUrl`: Generate upload URL for client
  - `getUrl`: Get download URL for storage ID

### Upload Flow
1. Client calls `generateUploadUrl` mutation
2. Receives upload URL
3. Uploads file directly to Convex storage
4. Receives `storageId`
5. Stores `storageId` in `animal.gallery` array

---

## Styling & Branding

### Tailwind Configuration
- **File**: `tailwind.config.ts`
- **Brand Colors**:
  - `accent`: `#09202C`
  - `primary`: `#5C82A1`
  - `background`: `#FFFFFF`
  - `textPrimary`: `#4A4E57`
  - `inputBorder`: `#CCCCCC`
- **Typography**: HelveticaNowText font family (with fallbacks)
- **Border Radius**: Default 6px

### Branding Utilities
- **File**: `lib/branding.ts`
- **Exports**: Colors, typography, logo URLs
- **Data Source**: `docs/branding/json/branding.json`

---

## Validation

### Client-Side Validation
- **File**: `lib/validation.ts`
- **Functions**:
  - `validateRequired`: Check required fields
  - `validateDateFormat`: Validate date format (TT.MM.JJJJ)

### Server-Side Validation
- **File**: `convex/validation.ts`
- **Validates**:
  - Required fields (name, breed, color, characteristics, descShort, location)
  - Date format and validity (TT.MM.JJJJ, year 2000-current)
  - Shoulder height (1-200 cm)
  - Seeking home since year (2000-current)
  - Gallery (at least 1 image)
  - descShort minimum length (20 characters)

---

## Logging

### Logger Utility
- **File**: `lib/logger.ts`
- **Features**:
  - Development: Pretty-printed logs with timestamps
  - Production: JSON logs
  - Sanitizes sensitive data (passwords, tokens, API keys)
  - Log levels: `debug`, `info`, `warn`, `error`
  - Error tracking with stack traces
- **Usage**: 
  - `logger.info(message, context)`
  - `logger.error(message, error, context)`
  - `logger.warn(message, context)`
  - `logger.debug(message, context)` (dev only)

---

## Testing

### Test Setup
- **Framework**: Vitest 2.1.8
- **Config**: `vitest.config.ts`
- **Environment**: jsdom
- **Setup File**: `vitest.setup.ts`
- **Coverage**: v8 provider
- **Path Alias**: `@/*` resolves to project root

### Test Files
- `__tests__/components/animal/AnimalCard.test.tsx`
- `__tests__/components/animal/DistributionStatus.test.tsx`
- `__tests__/lib/logger.test.ts`
- `__tests__/lib/validation.test.ts`

### Test Commands
- `pnpm test`: Run tests
- `pnpm test:ui`: Run tests with UI
- `pnpm test:coverage`: Run tests with coverage

---

## Environment Variables

### Required Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-publishable-key>
CLERK_SECRET_KEY=<your-secret-key>
CLERK_ISSUER_URL=https://<your-instance>.clerk.accounts.dev

# Convex
CONVEX_DEPLOYMENT=<your-deployment-url>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# Google Translate
GOOGLE_TRANSLATE_API_KEY=<your-api-key>

# WordPress
WORDPRESS_URL=https://tsvstrassenpfoten.de
WORDPRESS_APP_USERNAME=<username>
WORDPRESS_APP_PASSWORD=<app-password>

# Facebook
FACEBOOK_PAGE_ID=<page-id>
FACEBOOK_ACCESS_TOKEN=<access-token>

# Instagram
INSTAGRAM_BUSINESS_ACCOUNT_ID=<account-id>
INSTAGRAM_ACCESS_TOKEN=<access-token>

# X (Twitter)
TWITTER_API_KEY=<api-key>
TWITTER_API_SECRET=<api-secret>
TWITTER_ACCESS_TOKEN=<access-token>
TWITTER_ACCESS_TOKEN_SECRET=<access-token-secret>

# matchpfote
MATCHPFOTE_API_KEY=<api-key>
MATCHPFOTE_API_URL=https://matchpfote.de/api/v1

# Optional
NEXT_PUBLIC_SITE_URL=https://tsvstrassenpfoten.de
```

---

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js config
- **File Length**: Keep files under 300 LOC (per user rules)
- **Modularity**: Single purpose per file
- **YAGNI/KISS**: Implement only what's needed, keep it simple

### Next.js 16 Patterns
- **Server Actions**: Must be async (functions in files with `"use server"`)
- **Middleware**: Use `middleware.ts` with `clerkMiddleware`
- **Route Segment Config**: Use `dynamic` and `revalidate` exports
- **Client Components**: Mark with `'use client'` directive
- **API Routes**: Use route handlers in `app/api/` directory
- **Convex Proxy**: Routes through `/api/convex/[...path]/route.ts`

### Convex Patterns
- **Queries**: For reading data (reactive, real-time)
- **Mutations**: For writing data (synchronous)
- **Actions**: For external API calls and complex operations (async)
- **Internal Functions**: For scheduled actions and internal workflows
  - `internalQuery`: Internal read operations
  - `internalMutation`: Internal write operations
  - `internalAction`: Internal async operations
- **Scheduler**: Use `ctx.scheduler.runAfter()` for async workflows
- **Error Handling**: Use `ConvexError` for user-facing errors

### Error Handling
- Use `logger.error()` for error logging
- Wrap external API calls in try-catch
- Return meaningful error messages
- Use ConvexError for user-facing errors
- Don't throw in translation/distribution (log and continue)

### Authentication Patterns
- Use `ctx.auth.getUserIdentity()` in Convex functions
- Use `useAuth()` from `@clerk/nextjs` in client components
- Use `clerkMiddleware` in `middleware.ts`
- Check roles before allowing actions via `users.getCurrent` query

---

## Scripts

### Development
```bash
pnpm dev              # Start dev server with Turbopack
pnpm build             # Build for production
pnpm start             # Start production server
```

### Code Quality
```bash
pnpm lint              # Run ESLint
pnpm type-check        # Run TypeScript type checking
```

### Testing
```bash
pnpm test              # Run tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run tests with coverage
```

### Maintenance
```bash
pnpm clean:cache       # Clean Next.js cache
pnpm clean:install    # Clean install (remove node_modules)
```

---

## Performance Optimizations

### Next.js Optimizations
- Package import optimization for Convex and Radix UI
- Image optimization (AVIF/WebP)
- Static asset caching (1 year)
- Partial Prerendering (cacheComponents)
- Turbopack for faster dev builds
- CSS optimization in production
- Console.log removal in production (keeps error/warn)

### Route Segment Config
All data-dependent pages use:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### Convex Client Optimization
- Singleton pattern for client instance
- Memoized to prevent re-renders
- Client-side only (no SSR overhead)

### API Route Optimization
- Convex API proxy uses `force-dynamic`
- No caching at Next.js level (Convex handles its own)
- Proper cache headers for GET requests

---

## Common Tasks & Solutions

### Adding a New Animal Field
1. Update `convex/schema.ts` (add field to animals table)
2. Update `types/animal.ts` (add to AnimalFormData)
3. Update `convex/animals.ts` (add to create/update args)
4. Update validation in `convex/validation.ts` if needed
5. Update form in `app/dashboard/input/page.tsx`
6. Update edit form in `app/dashboard/manager/[id]/page.tsx` if applicable

### Adding a New Distribution Platform
1. Add function in `convex/distribution.ts`
2. Add to `distributedTo` object in schema
3. Call from `distributeAnimal` action
4. Update `updateDistributionStatus` mutation

### Debugging Scheduled Actions
- Check Convex dashboard for action logs
- Use `logger.info()` and `logger.error()` in actions
- Check action execution in Convex dashboard
- Verify environment variables are set

### Testing Authentication
- Use Clerk dashboard to create test users
- Set roles manually in Convex database
- Test different role permissions
- Check middleware.ts redirects

### Adding a New Route
1. Create page in `app/` directory
2. Add route protection in `middleware.ts` if needed (update `isPublicRoute` matcher)
3. Add navigation link in `app/dashboard/layout.tsx` if needed
4. Set `dynamic = 'force-dynamic'` if data-dependent

---

## Known Issues & Limitations

1. **Instagram Distribution**: Placeholder implementation (needs image URL handling)
2. **X/Twitter Distribution**: Placeholder implementation (needs OAuth 1.0a)
3. **Translation Errors**: No retry mechanism if Google Translate fails
4. **Distribution Failures**: Partial failures don't block other platforms
5. **Image Upload**: No client-side image validation/preview
6. **Rate Limiting**: matchpfote rate limiting is global (not per-animal)

---

## Future Enhancements

1. Complete Instagram and X/Twitter integrations
2. Add retry mechanism for translation failures
3. Add image preview before upload
4. Add bulk operations for managers
5. Add email notifications for status changes
6. Add audit log for all animal changes
7. Add search and filtering for animals list
8. Add image optimization/compression before upload
9. Add export functionality for animal data
10. Add analytics dashboard

---

## Support & Resources

- **Convex Docs**: https://docs.convex.dev
- **Next.js 16 Docs**: https://nextjs.org/docs
- **matchpfote API**: See `docs/matchpfote-integration-guide.md`
- **Branding**: See `docs/branding/` directory
- **Next.js DevTools**: Use next-devtools-mcp for API queries

---

## Notes for AI Agents

### When Working on This Project

1. **Always check file length**: Keep files under 300 LOC
2. **Use TypeScript strictly**: No `any` types unless necessary
3. **Follow Next.js 16 patterns**: Use proxy.ts, async Server Actions
4. **Test authentication**: Ensure proper role checks
5. **Use logger**: For all error logging and important events
6. **Check Convex patterns**: Use appropriate function types (query/mutation/action)
7. **Respect workflows**: Don't bypass automatic validation/translation/distribution
8. **Maintain branding**: Use colors and typography from `lib/branding.ts`
9. **Handle errors gracefully**: Wrap external API calls in try-catch
10. **Document changes**: Update this file if architecture changes
11. **Use Next.js DevTools**: Query Next.js-specific APIs via next-devtools-mcp when available

### Common Patterns

- **Role Checks**: Always verify user role before allowing actions
- **Status Transitions**: Use `updateStatus` mutation to trigger workflows
- **Scheduled Actions**: Use `ctx.scheduler.runAfter()` for async operations
- **Internal Functions**: Use `internalAction`, `internalMutation`, `internalQuery` for workflows
- **Client Components**: Only use `'use client'` when needed (interactivity, hooks)
- **Convex Client**: Use singleton pattern, memoize to prevent re-renders
- **Error Handling**: Log errors but don't throw in workflows (allows continuation)
- **API Routes**: Use route handlers, set `dynamic = 'force-dynamic'`

### Next.js 16 Specific Notes

- **Middleware**: Use `middleware.ts` with `clerkMiddleware` for authentication
- **App Router**: All routes use App Router pattern
- **Server Components**: Default, use `'use client'` only when needed
- **Route Handlers**: Use `app/api/` directory for API routes
- **Convex Integration**: Proxy through `/api/convex/[...path]/route.ts`
- **Performance**: Use `cacheComponents` for partial prerendering

---

*Last Updated: 2025-12-01*
*Project Version: 0.1.0*
*Next.js Version: 16.0.3*
*Convex Version: 1.29.3*
*Authentication: Clerk*
