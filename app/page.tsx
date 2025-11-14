'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';

// Route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <LoadingSpinner text="Weiterleitung..." />;
}

