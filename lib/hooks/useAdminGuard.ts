'use client';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/convex/_generated/api';

interface AdminGuardResult {
  isLoading: boolean;
  isAdmin: boolean;
  user: {
    _id: string;
    name?: string;
    email: string;
    role: 'admin' | 'input' | 'manager';
  } | null;
}

/**
 * Hook to guard admin-only pages.
 * Redirects non-admin users to the dashboard with an error message.
 * Logs access denied attempts via Convex.
 */
export function useAdminGuard(): AdminGuardResult {
  const router = useRouter();
  const user = useQuery(api.users.getCurrent);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait for user data to load
    if (user === undefined) return;

    // If no user or not admin, redirect
    if (user === null || user.role !== 'admin') {
      if (!hasRedirected) {
        setHasRedirected(true);
        // Redirect to dashboard with error parameter
        router.replace('/dashboard?error=access_denied');
      }
    }
  }, [user, router, hasRedirected]);

  return {
    isLoading: user === undefined,
    isAdmin: user?.role === 'admin' || false,
    user: user ?? null,
  };
}

