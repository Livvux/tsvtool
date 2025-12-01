'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PawLoader } from '@/components/layout/PawLoader';
import { useEffectiveRole } from '@/components/admin/ViewAsContext';

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrent,
    isAuthenticated ? undefined : 'skip'
  );
  const router = useRouter();
  
  // Get effective role (considering view-as mode for admins)
  const effectiveRole = useEffectiveRole(user?.role ?? 'input');

  useEffect(() => {
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
  }, [user, effectiveRole, router]);

  if (isLoading || user === undefined) {
    return <PawLoader />;
  }

  if (!user) {
    return <PawLoader />;
  }

  return <PawLoader />;
}

