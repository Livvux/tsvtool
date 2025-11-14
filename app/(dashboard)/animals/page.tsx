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

export default function AnimalsPage() {
  const router = useRouter();
  const animals = useQuery(api.animals.list, { status: 'FINALISIERT' });

  if (!animals) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Tiere</h1>
        <p className="text-textPrimary mt-2">
          Finalisierte Tierprofile
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => (
          <AnimalCard
            key={animal._id}
            animal={animal}
            onClick={() => router.push(`/dashboard/manager/${animal._id}`)}
          />
        ))}
      </div>

      {animals.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-textPrimary">
            Keine finalisierten Tiere vorhanden
          </CardContent>
        </Card>
      )}
    </div>
  );
}

