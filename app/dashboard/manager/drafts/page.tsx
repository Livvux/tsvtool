'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimalCard } from '@/components/animal/AnimalCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { Pencil1Icon } from '@radix-ui/react-icons';
import type { Id } from '@/convex/_generated/dataModel';

export default function DraftsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [cursor, setCursor] = useState<Id<'animals'> | undefined>(undefined);
  const [allDrafts, setAllDrafts] = useState<Array<any>>([]);

  const result = useQuery(
    api.animals.listPaginated,
    isAuthenticated ? { status: 'AKZEPTIERT', limit: 12, cursor } : 'skip'
  );

  // Reset drafts when cursor resets (filter change)
  useEffect(() => {
    if (!cursor) {
      setAllDrafts([]);
    }
  }, [cursor]);

  // Accumulate drafts from query results
  useEffect(() => {
    if (result) {
      if (!cursor) {
        // First page - replace
        setAllDrafts(result.animals);
      } else {
        // Subsequent pages - append new ones
        setAllDrafts((prev) => {
          const existingIds = new Set(prev.map((d) => d._id));
          const newDrafts = result.animals.filter((d) => !existingIds.has(d._id));
          return [...prev, ...newDrafts];
        });
      }
    }
  }, [result, cursor]);

  if (isLoading || result === undefined) {
    return <LoadingSpinner />;
  }

  const drafts = allDrafts;
  const hasMore = result.nextCursor !== null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-accent tracking-tight mb-2">
            Akzeptierte Entwürfe
          </h1>
          <p className="text-muted-foreground text-xl">
            Akzeptierte Tierprofile, die zur Finalisierung bereitstehen
          </p>
        </div>
        <div className="text-base text-muted-foreground font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          {drafts.length} {drafts.length === 1 ? 'Entwurf' : 'Entwürfe'} {hasMore ? '+' : 'offen'}
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/30">
          <CardContent className="py-16 text-center">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Pencil1Icon className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-medium text-foreground">Keine akzeptierten Entwürfe vorhanden</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-3 text-lg">
              Aktuell gibt es keine akzeptierten Entwürfe, die finalisiert werden müssen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drafts.map((draft) => (
              <AnimalCard
                key={draft._id}
                animal={draft}
                onClick={() => router.push(`/dashboard/manager/${draft._id}`)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setCursor(result.nextCursor ?? undefined)}
              >
                Mehr laden
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
