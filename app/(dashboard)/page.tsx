'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';

// Route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrent);
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

  if (!user) {
    return <LoadingSpinner />;
  }

  return <LoadingSpinner text="Sie werden weitergeleitet..." />;
}

