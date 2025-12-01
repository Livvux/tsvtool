'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PawLoader } from '@/components/layout/PawLoader';
import { useEffectiveRole } from '@/components/admin/ViewAsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrent,
    isAuthenticated ? undefined : 'skip'
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  // Get effective role (considering view-as mode for admins)
  const effectiveRole = useEffectiveRole(user?.role ?? 'input');

  // Check for access_denied error in URL
  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setShowAccessDenied(true);
      // Clear the error from URL after showing
      const timeout = setTimeout(() => {
        router.replace('/dashboard');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Don't redirect if showing access denied message
    if (showAccessDenied) return;
    
    if (user) {
      // Use effective role for routing (allows admin to see other role's default pages)
      if (effectiveRole === 'admin') {
        router.push('/dashboard/admin/users');
      } else if (effectiveRole === 'input') {
        router.push('/dashboard/input');
      } else if (effectiveRole === 'manager') {
        router.push('/dashboard/manager/drafts');
      }
    }
  }, [user, effectiveRole, router, showAccessDenied]);

  // Show access denied message
  if (showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-red-200 dark:border-red-900">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Zugriff verweigert
            </h2>
            <p className="text-muted-foreground">
              Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
              Nur Administratoren können diese Seite aufrufen.
            </p>
            <Button 
              onClick={() => {
                setShowAccessDenied(false);
                // Navigate to appropriate page based on role
                if (effectiveRole === 'input') {
                  router.push('/dashboard/input');
                } else if (effectiveRole === 'manager') {
                  router.push('/dashboard/manager/drafts');
                }
              }}
            >
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || user === undefined) {
    return <PawLoader />;
  }

  if (!user) {
    return <PawLoader />;
  }

  return <PawLoader />;
}

