'use client';

import { useAuth, UserButton, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PawLoader } from '@/components/layout/PawLoader';

export default function PendingApprovalPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const user = useQuery(api.users.getCurrent);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Redirect to dashboard if user is approved
  // Note: undefined isApproved is treated as approved (backward compatibility)
  useEffect(() => {
    if (user && user.isApproved !== false) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!isLoaded || !isSignedIn) {
    return <PawLoader text="Laden..." />;
  }

  if (user === undefined) {
    return <PawLoader text="Profil wird geladen..." />;
  }

  // User is approved, redirecting...
  // Note: undefined isApproved is treated as approved (backward compatibility)
  if (user && user.isApproved !== false) {
    return <PawLoader text="Weiterleitung..." />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          {/* Paw Icon */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              className="text-primary fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 55 C 35 55 25 65 25 75 C 25 85 35 95 50 95 C 65 95 75 85 75 75 C 75 65 65 55 50 55 Z" />
              <ellipse cx="20" cy="45" rx="12" ry="15" transform="rotate(-20 20 45)" />
              <ellipse cx="40" cy="35" rx="12" ry="15" transform="rotate(-10 40 35)" />
              <ellipse cx="60" cy="35" rx="12" ry="15" transform="rotate(10 60 35)" />
              <ellipse cx="80" cy="45" rx="12" ry="15" transform="rotate(20 80 45)" />
            </svg>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-accent">
              Freischaltung ausstehend
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Ihr Konto wartet auf die Genehmigung durch einen Administrator.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Angemeldet als:</span>
              <UserButton />
            </div>
            {user && (
              <>
                <div className="text-sm">
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{user.name || 'Nicht angegeben'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">E-Mail: </span>
                  <span className="font-medium">{user.email}</span>
                </div>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Was passiert als Nächstes?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                  <li>Ein Administrator wird Ihre Anfrage prüfen</li>
                  <li>Sie erhalten Zugang, sobald Sie freigeschaltet wurden</li>
                  <li>Laden Sie diese Seite neu, um den Status zu überprüfen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Status überprüfen
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              Abmelden
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

