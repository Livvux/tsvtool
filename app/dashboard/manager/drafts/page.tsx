'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { AnimalCard } from '@/components/animal/AnimalCard';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { Pencil1Icon } from '@radix-ui/react-icons';

export default function DraftsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const drafts = useQuery(
    api.animals.list,
    isAuthenticated ? { status: 'AKZEPTIERT' } : 'skip'
  );

  if (isLoading || drafts === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-accent tracking-tight mb-2">
            Entwürfe
          </h1>
          <p className="text-muted-foreground text-xl">
            Akzeptierte Tierprofile, die zur Bearbeitung bereitstehen
          </p>
        </div>
        <div className="text-base text-muted-foreground font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          {drafts.length} {drafts.length === 1 ? 'Entwurf' : 'Entwürfe'} offen
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/30">
          <CardContent className="py-16 text-center">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Pencil1Icon className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-medium text-foreground">Keine Entwürfe vorhanden</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-3 text-lg">
              Aktuell gibt es keine akzeptierten Entwürfe, die bearbeitet werden müssen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {drafts.map((draft) => (
            <AnimalCard
              key={draft._id}
              animal={draft}
              onClick={() => router.push(`/dashboard/manager/${draft._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
