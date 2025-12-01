# Vercel Deployment Optimization Report

**Generated:** 2025-01-27  
**Next.js Version:** 16.0.3  
**Project:** TSVTool - TSV Strassenpfoten e.V. Animal Management System

---

## Executive Summary

### Current State Analysis

**Build Configuration:**
- ✅ Next.js 16 with App Router
- ✅ Turbopack enabled for development
- ✅ High memory allocation (8GB for builds)
- ✅ Partial Prerendering (cacheComponents) enabled
- ✅ Package import optimization configured

**Identified Issues:**
1. **No Vercel-specific optimizations** configured
2. **Large input page** (746 lines) loaded eagerly
3. **Missing build output analysis** tools
4. **No incremental static regeneration** strategy
5. **Missing Vercel caching headers** optimization
6. **No build-time optimizations** for production

**Optimization Potential:**
- **Build Time:** 30-40% reduction possible
- **Bundle Size:** 25-35% reduction possible
- **Deployment Speed:** 20-30% improvement possible
- **Runtime Performance:** 15-25% improvement possible

---

## 1. Build Time Optimization

### 1.1 Vercel Build Configuration

**Create `vercel.json` for optimized builds:**

```json
{
  "buildCommand": "NODE_OPTIONS='--max-old-space-size=8192' pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Benefits:**
- Explicit memory allocation for builds
- Optimized function timeouts
- Region selection for lower latency
- Faster installs with pnpm

### 1.2 Next.js Build Optimizations

**Update `next.config.ts` with production optimizations:**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Production build optimizations
  swcMinify: true, // Already default in Next.js 16, but explicit
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-popover',
      'convex/react',
      '@clerk/nextjs',
      'date-fns',
      'lucide-react',
    ],
    turbopackFileSystemCacheForDev: true,
    optimizeCss: true,
    // Enable server actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Enable partial prerendering for better performance
  cacheComponents: true,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production (keep error and warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tsvstrassenpfoten.de',
        pathname: '/wp-content/uploads/**',
      },
    ],
    // Vercel-specific: Use Vercel Image Optimization
    unoptimized: false,
  },

  // Compress responses
  compress: true,

  // Output configuration for better caching
  output: 'standalone', // Optimized for Vercel

  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Vercel-specific: Enable HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Vercel-specific: Cache API routes that don't change often
      {
        source: '/api/convex/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Key Changes:**
- Added `output: 'standalone'` for optimized Vercel builds
- Enhanced package import optimization
- Added Vercel-specific cache headers
- Optimized server actions body size limit

### 1.3 Build Script Optimization

**Update `package.json` build script:**

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=8192' next build",
    "build:analyze": "ANALYZE=true NODE_OPTIONS='--max-old-space-size=8192' next build",
    "build:production": "NODE_ENV=production NODE_OPTIONS='--max-old-space-size=8192' next build"
  }
}
```

**Expected Improvement:** 20-30% faster builds on Vercel

---

## 2. Bundle Size Optimization

### 2.1 Code Splitting Strategy

#### Priority 1: Split Large Input Page

**Current Issue:** `app/(dashboard)/input/page.tsx` is 746 lines, loaded eagerly.

**Solution:** Split into smaller, lazy-loaded components:

1. **Create form step components:**
   - `app/(dashboard)/input/components/BasicInfoStep.tsx`
   - `app/(dashboard)/input/components/MedicalInfoStep.tsx`
   - `app/(dashboard)/input/components/BehaviorStep.tsx`
   - `app/(dashboard)/input/components/DescriptionStep.tsx`
   - `app/(dashboard)/input/components/MediaStep.tsx`

2. **Update main page with dynamic imports:**

```typescript
// app/(dashboard)/input/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import type { AnimalFormData } from '@/types/animal';

// Lazy load form steps
const BasicInfoStep = dynamic(
  () => import('./components/BasicInfoStep'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const MedicalInfoStep = dynamic(
  () => import('./components/MedicalInfoStep'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const BehaviorStep = dynamic(
  () => import('./components/BehaviorStep'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const DescriptionStep = dynamic(
  () => import('./components/DescriptionStep'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const MediaStep = dynamic(
  () => import('./components/MediaStep'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export default function InputPage() {
  // ... existing state and handlers
  
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { component: BasicInfoStep, title: 'Grundinformationen' },
    { component: MedicalInfoStep, title: 'Medizinische Informationen' },
    { component: BehaviorStep, title: 'Verhalten' },
    { component: DescriptionStep, title: 'Beschreibung' },
    { component: MediaStep, title: 'Medien' },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`px-4 py-2 rounded ${
              index === currentStep ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {step.title}
          </button>
        ))}
      </div>

      {/* Current step */}
      <CurrentStepComponent
        formData={formData}
        onChange={handleInputChange}
        onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
        onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
```

**Expected Bundle Reduction:** 30-40% for initial load

#### Priority 2: Lazy Load Admin Components

**Update `app/dashboard/admin/users/page.tsx`:**

```typescript
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';

// Lazy load heavy admin components
const UserManagementCard = dynamic(
  () => import('./components/UserManagementCard'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

const UserInviteForm = dynamic(
  () => import('./components/UserInviteForm'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export default function UsersPage() {
  const users = useQuery(api.users.list);
  
  if (!users) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <UserInviteForm />
      <div className="grid gap-4">
        {users.map((user) => (
          <UserManagementCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Dependency Optimization

#### Remove Unused Dependencies

**Check for unused packages:**

```bash
# Install depcheck
pnpm add -D depcheck

# Run analysis
npx depcheck
```

**Potential removals:**
- `react-grab` - Check if actually used
- `critters` - May not be needed with Next.js 16
- `uuid` - Consider using `crypto.randomUUID()` if supported

#### Optimize Large Dependencies

**AWS SDK Optimization:**

```typescript
// Instead of importing entire SDK
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Use specific imports (already done, but verify)
```

**Date-fns Optimization:**

```typescript
// Instead of importing entire library
import { format, parse } from 'date-fns';

// Use specific imports (already optimized via optimizePackageImports)
```

### 2.3 Bundle Analyzer Setup

**Add bundle analysis:**

```bash
pnpm add -D @next/bundle-analyzer
```

**Update `next.config.ts`:**

```typescript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ... existing config
};

export default withBundleAnalyzer(nextConfig);
```

**Add script to `package.json`:**

```json
{
  "scripts": {
    "analyze": "ANALYZE=true pnpm build"
  }
}
```

**Expected Bundle Reduction:** 25-35% overall

---

## 3. Vercel-Specific Optimizations

### 3.1 Edge Functions for Static Routes

**Convert API routes to Edge Runtime where possible:**

```typescript
// app/api/health/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ status: 'ok', timestamp: Date.now() });
}
```

**Benefits:**
- Faster cold starts
- Lower latency
- Reduced costs

### 3.2 Vercel Caching Strategy

**Implement ISR (Incremental Static Regeneration) for static pages:**

```typescript
// app/dashboard/animals/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

// For truly static content
export const revalidate = 3600; // 1 hour
```

**Use Vercel's Edge Config for frequently accessed data:**

```typescript
// lib/edge-config.ts
import { get } from '@vercel/edge-config';

export async function getCachedConfig(key: string) {
  try {
    const value = await get(key);
    return value;
  } catch (error) {
    // Fallback to database
    return null;
  }
}
```

### 3.3 Vercel Image Optimization

**Ensure all images use Next.js Image component:**

```typescript
import Image from 'next/image';

// Instead of <img>
<Image
  src={imageUrl}
  alt={altText}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Responsive images
- Lazy loading
- CDN optimization

### 3.4 Vercel Analytics & Speed Insights

**Add Vercel Analytics:**

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

**Update `app/layout.tsx`:**

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3.5 Environment Variables Optimization

**Use Vercel Environment Variables efficiently:**

1. **Separate by environment:**
   - Production: Set in Vercel dashboard
   - Preview: Use same as production or specific overrides
   - Development: Use `.env.local`

2. **Use Vercel's built-in variables:**
   - `VERCEL_URL` - Current deployment URL
   - `VERCEL_ENV` - Environment (production, preview, development)

3. **Optimize Convex environment sync:**

```typescript
// scripts/sync-env-to-convex.ts
// Only sync necessary variables, not all
const REQUIRED_VARS = [
  'GOOGLE_TRANSLATE_API_KEY',
  'WORDPRESS_URL',
  // ... only essential vars
];
```

---

## 4. Caching Strategies

### 4.1 Build Cache Optimization

**Vercel automatically caches:**
- `node_modules` (if `package.json` unchanged)
- `.next/cache` (build artifacts)
- `.next/static` (static assets)

**Optimize by:**
1. **Lock file stability:** Keep `pnpm-lock.yaml` stable
2. **Dependency grouping:** Group related dependencies
3. **Minimal package.json changes:** Only update when necessary

### 4.2 Runtime Caching

**Implement React Query or SWR for client-side caching:**

```typescript
// lib/convex-cache.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Convex already handles caching, but we can optimize:
export function useCachedAnimals() {
  return useQuery(api.animals.list, {}, {
    // Convex handles caching automatically
    // But we can add stale-while-revalidate pattern
  });
}
```

### 4.3 CDN Caching Headers

**Already configured in `next.config.ts`, but verify:**

```typescript
// Static assets: 1 year cache
{
  source: '/_next/static/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

---

## 5. Performance Monitoring

### 5.1 Build Time Monitoring

**Add build time tracking:**

```json
// package.json
{
  "scripts": {
    "build:time": "time pnpm build"
  }
}
```

**Monitor in Vercel Dashboard:**
- Build logs
- Build duration trends
- Deployment frequency

### 5.2 Runtime Performance

**Use Vercel Analytics:**
- Core Web Vitals
- Real User Monitoring (RUM)
- Performance budgets

**Set performance budgets:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... existing config
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

### 5.3 Error Tracking

**Add error monitoring:**

```bash
pnpm add @sentry/nextjs
```

**Or use Vercel's built-in error tracking:**
- Check Vercel dashboard for errors
- Set up alerts for build failures

---

## 6. Implementation Checklist

### Phase 1: Quick Wins (1-2 hours)

- [ ] Create `vercel.json` with build optimizations
- [ ] Update `next.config.ts` with Vercel-specific headers
- [ ] Add `output: 'standalone'` to Next.js config
- [ ] Install and configure bundle analyzer
- [ ] Run bundle analysis: `pnpm analyze`

### Phase 2: Code Splitting (4-6 hours)

- [ ] Split input page into step components
- [ ] Implement dynamic imports for form steps
- [ ] Lazy load admin components
- [ ] Test all form functionality
- [ ] Verify bundle size reduction

### Phase 3: Advanced Optimizations (2-4 hours)

- [ ] Add Vercel Analytics and Speed Insights
- [ ] Optimize environment variable usage
- [ ] Review and remove unused dependencies
- [ ] Implement Edge Functions where applicable
- [ ] Set up performance monitoring

### Phase 4: Testing & Validation (2-3 hours)

- [ ] Run full test suite
- [ ] Test build on Vercel preview
- [ ] Measure build time improvement
- [ ] Verify bundle size reduction
- [ ] Check Core Web Vitals
- [ ] Test on slow network (throttle)

---

## 7. Expected Results

### Build Time
- **Current:** ~2-3 minutes (estimated)
- **Target:** ~1.5-2 minutes
- **Improvement:** 25-30% reduction

### Bundle Size
- **Current:** ~500-800 KB (estimated initial bundle)
- **Target:** ~350-550 KB
- **Improvement:** 30-35% reduction

### Deployment Speed
- **Current:** ~3-4 minutes (build + deploy)
- **Target:** ~2-2.5 minutes
- **Improvement:** 30-40% faster

### Runtime Performance
- **LCP (Largest Contentful Paint):** 15-20% improvement
- **FID (First Input Delay):** 10-15% improvement
- **CLS (Cumulative Layout Shift):** Maintained at <0.1

---

## 8. Monitoring & Maintenance

### Weekly Checks
- [ ] Review build times in Vercel dashboard
- [ ] Check bundle size trends
- [ ] Monitor Core Web Vitals
- [ ] Review error rates

### Monthly Reviews
- [ ] Analyze bundle composition
- [ ] Review dependency updates
- [ ] Optimize slow routes
- [ ] Update performance budgets

### Quarterly Audits
- [ ] Full performance audit
- [ ] Dependency cleanup
- [ ] Architecture review
- [ ] Cost optimization review

---

## 9. Additional Resources

### Vercel Documentation
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Build Optimization](https://vercel.com/docs/build-optimization)
- [Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Caching](https://vercel.com/docs/caching)

### Next.js Optimization
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Bundle Analyzer](https://nextjs.org/docs/app/api-reference/next-config-js/bundle-analyzer)
- [Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

### Tools
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 10. Troubleshooting

### Build Failures
- Check memory allocation in `NODE_OPTIONS`
- Verify all environment variables are set
- Check for TypeScript errors: `pnpm type-check`
- Review build logs in Vercel dashboard

### Slow Builds
- Check for large dependencies
- Verify Turbopack is enabled
- Review module resolution
- Check for circular dependencies

### Large Bundles
- Run bundle analyzer: `pnpm analyze`
- Check for duplicate dependencies: `pnpm dedupe`
- Review dynamic imports
- Verify tree-shaking is working

---

**Next Steps:**
1. Review this document with the team
2. Prioritize optimizations based on impact
3. Create implementation tickets
4. Set up monitoring
5. Schedule follow-up review

---

*Generated: 2025-01-27*  
*Last Updated: 2025-01-27*  
*Version: 1.0.0*

