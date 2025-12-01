'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PawLoader } from '@/components/layout/PawLoader';
import { Badge } from '@/components/ui/badge';
import { 
  PersonIcon, 
  GearIcon
} from '@radix-ui/react-icons';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AnimalSearch } from '@/components/animal/AnimalSearch';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useMutation(api.users.store);
  const user = useQuery(api.users.getCurrent);
  const [isStoring, setIsStoring] = useState(false);
  const userButtonRef = useRef<HTMLDivElement>(null);

  // Sync user with Convex database
  useEffect(() => {
    if (isSignedIn && userId) {
      if (user === undefined) {
        setIsStoring(true);
      }
      
      storeUser()
        .then(() => setIsStoring(false))
        .catch((err) => {
          console.error('Failed to store user:', err);
          setIsStoring(false);
        });
    }
  }, [isSignedIn, userId, storeUser, user === undefined]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn || (isStoring && user === undefined) || !user) {
    return <PawLoader text={!user ? "Profil wird geladen..." : "Laden..."} />;
  }

  const isActive = (path: string) => pathname?.startsWith(path);

  const handleUserInfoClick = () => {
    // Trigger click on the UserButton to open the menu
    const userButton = userButtonRef.current?.querySelector('button, [role="button"]') as HTMLElement;
    if (userButton) {
      userButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-10">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => router.push('/dashboard')}
              >
                <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 100 100"
                    className="text-primary fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Main Pad */}
                    <path d="M50 55 C 35 55 25 65 25 75 C 25 85 35 95 50 95 C 65 95 75 85 75 75 C 75 65 65 55 50 55 Z" />
                    {/* Toes */}
                    <ellipse cx="20" cy="45" rx="12" ry="15" transform="rotate(-20 20 45)" />
                    <ellipse cx="40" cy="35" rx="12" ry="15" transform="rotate(-10 40 35)" />
                    <ellipse cx="60" cy="35" rx="12" ry="15" transform="rotate(10 60 35)" />
                    <ellipse cx="80" cy="45" rx="12" ry="15" transform="rotate(20 80 45)" />
                  </svg>
                </div>
                <h1 className="hidden md:block text-lg font-bold text-accent tracking-tight">
                  tsvTool
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6 ml-4">
                {(user.role === 'manager' || user.role === 'admin') && (
                  <>
                    <Link 
                      href="/dashboard/manager/drafts"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActive('/dashboard/manager/drafts') 
                          ? "text-primary font-semibold" 
                          : "text-muted-foreground"
                      )}
                    >
                      Entwürfe
                    </Link>
                    <Link 
                      href="/dashboard/animals"
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActive('/dashboard/animals') 
                          ? "text-primary font-semibold" 
                          : "text-muted-foreground"
                      )}
                    >
                      Tiere
                    </Link>
                  </>
                )}
                {(user.role === 'input' || user.role === 'admin') && (
                  <Link 
                    href="/dashboard/input"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive('/dashboard/input') 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground"
                    )}
                  >
                    Neues Tier
                  </Link>
                )}
              </nav>
            </div>

            {/* Search & User Actions */}
            <div className="flex items-center gap-4">
              {/* Search - visible for manager/admin roles */}
              {(user.role === 'manager' || user.role === 'admin') && (
                <div className="hidden lg:block w-64">
                  <AnimalSearch />
                </div>
              )}
              <ThemeToggle />
              {user.role === 'admin' && (
                <div className="hidden md:flex items-center gap-1 border-r border-border pr-4 mr-2">
                  <Button 
                    variant={isActive('/dashboard/admin/users') ? 'secondary' : 'ghost'} 
                    size="icon"
                    className="h-8 w-8"
                    title="Benutzerverwaltung"
                    onClick={() => router.push('/dashboard/admin/users')}
                  >
                    <PersonIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={isActive('/dashboard/admin/settings') ? 'secondary' : 'ghost'} 
                    size="icon"
                    className="h-8 w-8"
                    title="Einstellungen"
                    onClick={() => router.push('/dashboard/admin/settings')}
                  >
                    <GearIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3 pl-2">
                <div 
                  className="hidden md:flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleUserInfoClick}
                >
                  <span className="text-sm font-medium text-foreground leading-none">
                    {user.name}
                  </span>
                  <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1 py-0 uppercase tracking-wider text-muted-foreground border-border">
                    {user.role}
                  </Badge>
                </div>
                <div ref={userButtonRef}>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9 ring-2 ring-white shadow-sm"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation (visible only on small screens) */}
          <div className="md:hidden flex items-center gap-4 mt-4 overflow-x-auto pb-2 border-t border-border pt-3">
            {(user.role === 'manager' || user.role === 'admin') && (
              <>
                <Link 
                  href="/dashboard/manager/drafts"
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive('/dashboard/manager/drafts') ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Entwürfe
                </Link>
                <Link 
                  href="/dashboard/animals"
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isActive('/dashboard/animals') ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Tiere
                </Link>
              </>
            )}
            {(user.role === 'input' || user.role === 'admin') && (
              <Link 
                href="/dashboard/input"
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive('/dashboard/input') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Neues Tier
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 max-w-7xl animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
