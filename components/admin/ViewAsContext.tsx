'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type ViewAsRole = 'admin' | 'input' | 'manager' | null;

interface ViewAsContextType {
  /** The role being simulated (null = no simulation, use actual role) */
  viewAsRole: ViewAsRole;
  /** Set the simulated role */
  setViewAsRole: (role: ViewAsRole) => void;
  /** Whether view-as mode is active */
  isViewingAs: boolean;
  /** Clear view-as mode */
  clearViewAs: () => void;
}

const ViewAsContext = createContext<ViewAsContextType | null>(null);

const STORAGE_KEY = 'tsv-view-as-role';

export function ViewAsProvider({ 
  children,
  isAdmin 
}: { 
  children: ReactNode;
  isAdmin: boolean;
}) {
  const [viewAsRole, setViewAsRoleState] = useState<ViewAsRole>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isAdmin) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['admin', 'input', 'manager'].includes(stored)) {
        setViewAsRoleState(stored as ViewAsRole);
      }
    }
  }, [isAdmin]);

  // Persist to localStorage
  const setViewAsRole = useCallback((role: ViewAsRole) => {
    if (!isAdmin) return; // Only admins can use this feature
    
    setViewAsRoleState(role);
    if (typeof window !== 'undefined') {
      if (role) {
        localStorage.setItem(STORAGE_KEY, role);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isAdmin]);

  const clearViewAs = useCallback(() => {
    setViewAsRole(null);
  }, [setViewAsRole]);

  // If not admin, don't allow view-as
  const effectiveViewAsRole = isAdmin ? viewAsRole : null;

  return (
    <ViewAsContext.Provider
      value={{
        viewAsRole: effectiveViewAsRole,
        setViewAsRole,
        isViewingAs: effectiveViewAsRole !== null,
        clearViewAs,
      }}
    >
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const context = useContext(ViewAsContext);
  if (!context) {
    throw new Error('useViewAs must be used within a ViewAsProvider');
  }
  return context;
}

/**
 * Hook to get the effective role (considering view-as mode)
 */
export function useEffectiveRole(actualRole: 'admin' | 'input' | 'manager'): 'admin' | 'input' | 'manager' {
  const context = useContext(ViewAsContext);
  
  // If no context or not viewing as someone else, return actual role
  if (!context || !context.viewAsRole) {
    return actualRole;
  }
  
  // Only admins can view as other roles
  if (actualRole !== 'admin') {
    return actualRole;
  }
  
  return context.viewAsRole;
}

