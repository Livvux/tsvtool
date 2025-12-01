import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock React cache since it's not available in test environment
vi.mock('react', () => ({
  cache: (fn: Function) => fn,
}));

import { getStatusColor, getStatusBadge, formatDateTime } from '@/lib/animal-helpers';

describe('animal-helpers', () => {
  describe('getStatusColor', () => {
    it('should return correct color for ENTWURF status', () => {
      expect(getStatusColor('ENTWURF')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct color for ABGELEHNT status', () => {
      expect(getStatusColor('ABGELEHNT')).toBe('bg-red-100 text-red-800');
    });

    it('should return correct color for AKZEPTIERT status', () => {
      expect(getStatusColor('AKZEPTIERT')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct color for FINALISIERT status', () => {
      expect(getStatusColor('FINALISIERT')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return empty string for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('');
      expect(getStatusColor('')).toBe('');
    });
  });

  describe('getStatusBadge', () => {
    it('should return "Nicht verteilt" for undefined status', () => {
      const result = getStatusBadge(undefined);
      expect(result.text).toBe('Nicht verteilt');
      expect(result.className).toBe('bg-gray-100 text-gray-600');
    });

    it('should return "Erfolgreich" for true status', () => {
      const result = getStatusBadge(true);
      expect(result.text).toBe('Erfolgreich');
      expect(result.className).toBe('bg-green-100 text-green-800');
    });

    it('should return "Fehlgeschlagen" for false status', () => {
      const result = getStatusBadge(false);
      expect(result.text).toBe('Fehlgeschlagen');
      expect(result.className).toBe('bg-red-100 text-red-800');
    });
  });

  describe('formatDateTime', () => {
    it('should return null for undefined timestamp', () => {
      expect(formatDateTime(undefined)).toBeNull();
    });

    it('should return null for 0 timestamp', () => {
      expect(formatDateTime(0)).toBeNull();
    });

    it('should format timestamp correctly in German locale', () => {
      // Fixed timestamp: 2024-01-15 14:30:00 UTC
      const timestamp = 1705329000000;
      const result = formatDateTime(timestamp);
      
      // Check that result is a string and contains expected format elements
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
      // Should contain date and time separators
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/); // Date format DD.MM.YYYY
      expect(result).toMatch(/\d{2}:\d{2}/); // Time format HH:MM
    });
  });
});

