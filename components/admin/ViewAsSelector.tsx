'use client';

import { useViewAs, type ViewAsRole } from './ViewAsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeOpenIcon, Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  input: 'Input',
  manager: 'Manager',
};

const roleDescriptions: Record<string, string> = {
  admin: 'Voller Systemzugriff',
  input: 'Bulgarisches Team - Tiererstellung',
  manager: 'Deutsches Team - Review & Finalisierung',
};

export function ViewAsSelector() {
  const { viewAsRole, setViewAsRole, isViewingAs } = useViewAs();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: ViewAsRole) => {
    setViewAsRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={isViewingAs ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "gap-2 h-8",
          isViewingAs && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
        )}
      >
        <EyeOpenIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isViewingAs ? `Ansicht: ${roleLabels[viewAsRole!]}` : 'Ansicht wechseln'}
        </span>
        <ChevronDownIcon className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-border bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">
              Ansicht als andere Rolle
            </p>
          </div>
          
          <div className="p-1">
            {/* Normal Admin View */}
            <button
              onClick={() => handleRoleSelect(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors",
                !isViewingAs 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Normale Ansicht</div>
                  <div className="text-xs text-muted-foreground">Deine Admin-Rolle</div>
                </div>
                {!isViewingAs && (
                  <Badge variant="secondary" className="text-[10px]">Aktiv</Badge>
                )}
              </div>
            </button>

            <div className="my-1 border-t border-border" />

            {/* View as Input */}
            <button
              onClick={() => handleRoleSelect('input')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors",
                viewAsRole === 'input' 
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" 
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{roleLabels.input}</div>
                  <div className="text-xs text-muted-foreground">{roleDescriptions.input}</div>
                </div>
                {viewAsRole === 'input' && (
                  <Badge className="bg-amber-500 text-white text-[10px]">Simuliert</Badge>
                )}
              </div>
            </button>

            {/* View as Manager */}
            <button
              onClick={() => handleRoleSelect('manager')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors",
                viewAsRole === 'manager' 
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" 
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{roleLabels.manager}</div>
                  <div className="text-xs text-muted-foreground">{roleDescriptions.manager}</div>
                </div>
                {viewAsRole === 'manager' && (
                  <Badge className="bg-amber-500 text-white text-[10px]">Simuliert</Badge>
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Banner that shows when viewing as another role
 */
export function ViewAsBanner() {
  const { viewAsRole, clearViewAs, isViewingAs } = useViewAs();

  if (!isViewingAs) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
      <EyeOpenIcon className="w-4 h-4" />
      <span>
        Du siehst die Ansicht als <strong>{roleLabels[viewAsRole!]}</strong>
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={clearViewAs}
        className="h-6 px-2 text-white hover:bg-white/20 hover:text-white"
      >
        <Cross2Icon className="w-3 h-3 mr-1" />
        Beenden
      </Button>
    </div>
  );
}

