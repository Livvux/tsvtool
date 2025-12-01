'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface SearchResult {
  _id: string;
  name: string;
  animal: 'Hund' | 'Katze';
  breed: string;
  location: string;
  status: 'ENTWURF' | 'ABGELEHNT' | 'AKZEPTIERT' | 'FINALISIERT';
  thumbnailUrl: string | null;
}

const statusLabels: Record<string, string> = {
  ENTWURF: 'Entwurf',
  ABGELEHNT: 'Abgelehnt',
  AKZEPTIERT: 'Akzeptiert',
  FINALISIERT: 'Finalisiert',
};

const statusColors: Record<string, string> = {
  ENTWURF: 'bg-amber-100 text-amber-800 dark:bg-gray-800 dark:text-amber-300',
  ABGELEHNT: 'bg-red-100 text-red-800 dark:bg-gray-800 dark:text-red-300',
  AKZEPTIERT: 'bg-sky-100 text-sky-800 dark:bg-gray-800 dark:text-gray-300',
  FINALISIERT: 'bg-emerald-100 text-emerald-800 dark:bg-gray-800 dark:text-emerald-300',
};

export function AnimalSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query animals with debounced term
  const results = useQuery(
    api.animals.search,
    debouncedTerm.length >= 2 ? { searchTerm: debouncedTerm, limit: 8 } : 'skip'
  ) as SearchResult[] | undefined;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleSelect = useCallback(
    (id: string) => {
      router.push(`/dashboard/manager/${id}`);
      setSearchTerm('');
      setIsOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]._id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    inputRef.current?.focus();
  };

  const showResults = isOpen && debouncedTerm.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tier suchen..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8 h-9 bg-background border border-input rounded-md shadow-sm focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
            type="button"
          >
            <Cross2Icon className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {results === undefined ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Suche...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Keine Tiere gefunden für &quot;{debouncedTerm}&quot;
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result, index) => (
                <li key={result._id}>
                  <button
                    onClick={() => handleSelect(result._id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full px-3 py-2 flex items-center gap-3 text-left transition-colors',
                      selectedIndex === index
                        ? 'bg-accent/10'
                        : 'hover:bg-muted/50'
                    )}
                    type="button"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {result.thumbnailUrl ? (
                        <img
                          src={result.thumbnailUrl}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {result.animal === 'Hund' ? '🐕' : '🐈'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {result.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] h-4 px-1.5 py-0',
                            statusColors[result.status]
                          )}
                        >
                          {statusLabels[result.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.breed} • {result.location}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Keyboard hint */}
          {results && results.length > 0 && (
            <div className="px-3 py-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigieren
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd> Auswählen
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Schließen
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

