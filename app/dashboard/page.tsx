'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PawLoader } from '@/components/layout/PawLoader';

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrent,
    isAuthenticated ? undefined : 'skip'
  );
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/dashboard/admin/users');
      } else if (user.role === 'input') {
        router.push('/dashboard/input');
      } else if (user.role === 'manager') {
        router.push('/dashboard/manager/drafts');
      }
    }
  }, [user, router]);

  if (isLoading || user === undefined) {
    return <PawLoader />;
  }

  if (!user) {
    return <PawLoader />;
  }

  return <PawLoader />;
}

