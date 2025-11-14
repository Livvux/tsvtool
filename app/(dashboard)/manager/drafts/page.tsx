'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { AnimalCard } from '@/components/animal/AnimalCard';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';

// Route segment config for caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DraftsPage() {
  const router = useRouter();
  const drafts = useQuery(api.animals.list, { status: 'AKZEPTIERT' });

  if (!drafts) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Entwürfe</h1>
        <p className="text-textPrimary mt-2">
          Akzeptierte Tierprofile, die bearbeitet werden müssen
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <AnimalCard
            key={draft._id}
            animal={draft}
            onClick={() => router.push(`/dashboard/manager/${draft._id}`)}
          />
        ))}
      </div>

      {drafts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-textPrimary">
            Keine Entwürfe vorhanden
          </CardContent>
        </Card>
      )}
    </div>
  );
}

