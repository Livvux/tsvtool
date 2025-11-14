import { NextResponse } from 'next/server';
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';

// Public routes that don't require authentication
const isPublicPage = createRouteMatcher(['/login']);

// API routes that should be excluded from auth proxy
const isApiRoute = createRouteMatcher(['/api/convex(.*)']);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Skip authentication for API routes (handled by Convex)
  if (isApiRoute(request)) {
    return NextResponse.next();
  }

  const isAuthenticated = await convexAuth.isAuthenticated();
  
  // Redirect unauthenticated users to login (except public pages)
  if (!isPublicPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, '/login');
  }

  // Redirect authenticated users away from login page
  if (isPublicPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, '/dashboard');
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except:
    // - Static files (files with extensions)
    // - Next.js internals (_next)
    // - API routes (handled separately)
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};

