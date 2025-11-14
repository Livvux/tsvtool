'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Fehler aufgetreten</CardTitle>
          <CardDescription>
            Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-textPrimary mb-4">
            {error.message || 'Unbekannter Fehler'}
          </p>
          <div className="flex gap-4">
            <Button onClick={reset}>Erneut versuchen</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Zur Startseite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

