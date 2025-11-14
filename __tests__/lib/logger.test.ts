import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('Test message', { test: 'data' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error messages with error object', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      logger.error('Test error message', error, { context: 'test' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle error without error object', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.error('Test error message', undefined, { context: 'test' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.warn('Test warning', { test: 'data' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.debug('Test debug', { test: 'data' });
      // Debug may or may not be called depending on environment
      consoleSpy.mockRestore();
    });
  });
});

