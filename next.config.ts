import type { NextConfig } from 'next';

// Conditionally enable bundle analyzer (only if package is installed and ANALYZE=true)
let withBundleAnalyzer = (config: NextConfig) => config;
if (process.env.ANALYZE === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bundleAnalyzer = require('@next/bundle-analyzer');
    withBundleAnalyzer = bundleAnalyzer({
      enabled: true,
    });
  } catch {
    // Bundle analyzer not installed, skip it
    console.warn('@next/bundle-analyzer not found. Install it with: pnpm add -D @next/bundle-analyzer');
  }
}

const nextConfig: NextConfig = {
  // Optimize for Next.js 16
  reactStrictMode: true,
  
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
    // Optimize CSS for production
    optimizeCss: true,
    // Enable server actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Enable partial prerendering for better performance
  // ppr has been merged into cacheComponents (moved out of experimental in Next.js 16)
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
  },

  // Compress responses
  compress: true,

  // Output configuration for optimized Vercel builds
  output: 'standalone',

  // Headers for better caching
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

export default withBundleAnalyzer(nextConfig);

