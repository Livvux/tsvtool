import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription>
            Die gesuchte Seite wurde nicht gefunden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Zur Startseite</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

