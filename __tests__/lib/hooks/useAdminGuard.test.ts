import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useAdminGuard } from '@/lib/hooks/useAdminGuard';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
}));

// Mock Convex query
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

describe('useAdminGuard', () => {
  const mockRouter = {
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Admin User', () => {
    it('should return isAdmin true for admin users', () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should not redirect admin users', () => {
      const mockUser = {
        _id: 'user_123',
        role: 'admin' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      renderHook(() => useAdminGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Non-Admin Users', () => {
    it('should return isAdmin false for manager users', () => {
      const mockUser = {
        _id: 'user_123',
        role: 'manager' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isAdmin).toBe(false);
    });

    it('should return isAdmin false for input users', () => {
      const mockUser = {
        _id: 'user_123',
        role: 'input' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isAdmin).toBe(false);
    });

    it('should redirect non-admin users to dashboard', () => {
      const mockUser = {
        _id: 'user_123',
        role: 'manager' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      renderHook(() => useAdminGuard());

      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard?error=access_denied');
    });

    it('should redirect only once per user change', () => {
      const mockUser = {
        _id: 'user_123',
        role: 'input' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { rerender } = renderHook(() => useAdminGuard());

      // First render should trigger redirect
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);

      // Rerender with same user should not trigger again
      rerender();
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unauthenticated Users', () => {
    it('should return isAdmin false for null user', () => {
      (useQuery as any).mockReturnValue(null);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should redirect unauthenticated users', () => {
      (useQuery as any).mockReturnValue(null);

      renderHook(() => useAdminGuard());

      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard?error=access_denied');
    });
  });

  describe('Loading State', () => {
    it('should return isLoading true while user data is loading', () => {
      (useQuery as any).mockReturnValue(undefined);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should not redirect while loading', () => {
      (useQuery as any).mockReturnValue(undefined);

      renderHook(() => useAdminGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should update when user data loads', async () => {
      (useQuery as any).mockReturnValue(undefined);

      const { result, rerender } = renderHook(() => useAdminGuard());

      expect(result.current.isLoading).toBe(true);

      // Simulate user data loading
      (useQuery as any).mockReturnValue({
        _id: 'user_123',
        role: 'admin' as const,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAdmin).toBe(true);
      });
    });
  });

  describe('Return Value Structure', () => {
    it('should return correct structure for admin user', () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isAdmin');
      expect(result.current).toHaveProperty('user');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should return correct structure for non-admin user', () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Manager',
        email: 'manager@example.com',
        role: 'manager' as const,
      };

      (useQuery as any).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAdminGuard());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });
  });
});

