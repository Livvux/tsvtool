'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from './ConvexClientProvider';

/**
 * AuthProvider - Client-side authentication wrapper
 * 
 * CACHE COMPONENTS FIX: This component wraps ClerkProvider and ConvexClientProvider
 * as client components to prevent cookie access during server-side prerendering.
 * The Suspense boundary in the root layout allows the static shell to be prerendered
 * while auth state is handled client-side.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}

