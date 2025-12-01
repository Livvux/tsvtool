'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { AnimalCard } from '@/components/animal/AnimalCard';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { ListBulletIcon } from '@radix-ui/react-icons';

export default function AnimalsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const animals = useQuery(
    api.animals.list,
    isAuthenticated ? { status: 'FINALISIERT' } : 'skip'
  );

  if (isLoading || animals === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-accent tracking-tight mb-2">
            Tiere
          </h1>
          <p className="text-muted-foreground text-xl">
            Übersicht aller finalisierten Tierprofile
          </p>
        </div>
        <div className="text-base text-muted-foreground font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          {animals.length} {animals.length === 1 ? 'Tier' : 'Tiere'} gesamt
        </div>
      </div>

      {animals.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/30">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ListBulletIcon className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-medium text-foreground">Keine Tiere gefunden</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-3 text-lg">
              Es gibt momentan keine finalisierten Tierprofile im System.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal) => (
            <AnimalCard
              key={animal._id}
              animal={animal}
              onClick={() => router.push(`/dashboard/manager/${animal._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
