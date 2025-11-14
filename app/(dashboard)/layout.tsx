'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.getCurrent);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textPrimary">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-inputBorder bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-accent">TSV Strassenpfoten</h1>
            <nav className="flex flex-wrap gap-2 md:gap-4">
              {user.role === 'admin' && (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard/admin/users')}>
                    Benutzerverwaltung
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/dashboard/admin/settings')}>
                    Einstellungen
                  </Button>
                </>
              )}
              {(user.role === 'input' || user.role === 'admin') && (
                <Button variant="ghost" onClick={() => router.push('/dashboard/input')}>
                  Neues Tier
                </Button>
              )}
              {(user.role === 'manager' || user.role === 'admin') && (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard/manager/drafts')}>
                    Entwürfe
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/dashboard/animals')}>
                    Tiere
                  </Button>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between">
            <span className="text-xs md:text-sm text-textPrimary truncate">
              {user.email} <span className="hidden md:inline">({user.role})</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

