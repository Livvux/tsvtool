'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PawLoader } from '@/components/layout/PawLoader';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
    // Small delay to show the animation briefly?
    // Or usually router.replace is instant if checking auth, but might take a moment.
    // The user explicitly asked for a screen change, implying they see it.
  }, [router]);

  return <PawLoader />;
}

