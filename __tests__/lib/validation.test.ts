import { describe, it, expect } from 'vitest';
import { validateDateFormat, validateRequired } from '@/lib/validation';

describe('validation', () => {
  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('hello world')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateRequired(null as unknown as string)).toBe(false);
      expect(validateRequired(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateDateFormat', () => {
    it('should validate correct date format DD.MM.YYYY', () => {
      expect(validateDateFormat('01.01.2020')).toBe(true);
      expect(validateDateFormat('31.12.2023')).toBe(true);
      expect(validateDateFormat('15.06.2024')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validateDateFormat('2020-01-01')).toBe(false);
      expect(validateDateFormat('01/01/2020')).toBe(false);
      expect(validateDateFormat('1.1.2020')).toBe(false);
      expect(validateDateFormat('01.1.2020')).toBe(false);
      expect(validateDateFormat('01.01.20')).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(validateDateFormat('32.01.2020')).toBe(false);
      expect(validateDateFormat('01.13.2020')).toBe(false);
      expect(validateDateFormat('00.01.2020')).toBe(false);
      expect(validateDateFormat('01.00.2020')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(validateDateFormat('')).toBe(false);
    });
  });
});

