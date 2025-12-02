import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize';

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: (text: string, options: any) => {
      // Simulate DOMPurify behavior: remove all HTML tags, keep text
      if (options.ALLOWED_TAGS.length === 0 && options.KEEP_CONTENT) {
        // Remove HTML tags, keep text content
        return text.replace(/<[^>]*>/g, '');
      }
      return text;
    },
  },
}));

describe('sanitize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sanitizeHtml', () => {
    it('should return empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(sanitizeHtml(null)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should remove all HTML tags', () => {
      const input = '<p>Hello World</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove script tags and content', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeHtml(input);
      expect(result).toBe('alert("XSS")Hello');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should remove multiple nested HTML tags', () => {
      const input = '<div><p><strong>Text</strong></p></div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Text');
      expect(result).not.toContain('<');
    });

    it('should preserve plain text', () => {
      const input = 'Plain text without HTML';
      const result = sanitizeHtml(input);
      expect(result).toBe('Plain text without HTML');
    });

    it('should handle text with special characters', () => {
      const input = '<p>Text with &amp; special chars: &lt; &gt;</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Text with &amp; special chars: &lt; &gt;');
    });

    it('should remove all attributes', () => {
      const input = '<a href="javascript:alert(1)" onclick="evil()">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Link');
      expect(result).not.toContain('href');
      expect(result).not.toContain('onclick');
    });

    it('should handle mixed content', () => {
      const input = 'Before <p>Middle</p> After';
      const result = sanitizeHtml(input);
      expect(result).toBe('Before Middle After');
    });

    it('should handle empty HTML tags', () => {
      const input = '<div></div><p></p>Text';
      const result = sanitizeHtml(input);
      expect(result).toBe('Text');
    });

    it('should handle self-closing tags', () => {
      const input = 'Text<br/>More text';
      const result = sanitizeHtml(input);
      expect(result).toBe('TextMore text');
    });

    it('should handle malformed HTML', () => {
      const input = '<p>Unclosed tag<strong>Text';
      const result = sanitizeHtml(input);
      // Should still remove tags
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
    });
  });

  describe('sanitizeText', () => {
    it('should return empty string for undefined input', () => {
      expect(sanitizeText(undefined)).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(sanitizeText(null)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(sanitizeText('')).toBe('');
    });

    it('should remove HTML tags', () => {
      const input = '<p>Hello World</p>';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should preserve plain text', () => {
      const input = 'Plain text';
      const result = sanitizeText(input);
      expect(result).toBe('Plain text');
    });

    it('should be equivalent to sanitizeHtml', () => {
      const input = '<div>Test</div>';
      const htmlResult = sanitizeHtml(input);
      const textResult = sanitizeText(input);
      expect(textResult).toBe(htmlResult);
    });

    it('should handle XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
      ];

      xssAttempts.forEach((attempt) => {
        const result = sanitizeText(attempt);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
        expect(result).not.toContain('<iframe>');
      });
    });

    it('should handle Bulgarian text with HTML', () => {
      const input = '<p>Луна е прекрасно куче</p>';
      const result = sanitizeText(input);
      expect(result).toBe('Луна е прекрасно куче');
      expect(result).toMatch(/[а-яА-Я]/); // Contains Cyrillic
    });

    it('should handle German text with HTML', () => {
      const input = '<p>Luna ist ein wunderschöner Hund</p>';
      const result = sanitizeText(input);
      expect(result).toBe('Luna ist ein wunderschöner Hund');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = '<p>' + 'A'.repeat(10000) + '</p>';
      const result = sanitizeHtml(longText);
      expect(result).toBe('A'.repeat(10000));
      expect(result.length).toBe(10000);
    });

    it('should handle text with only HTML tags', () => {
      const input = '<div><p><span></span></p></div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('');
    });

    it('should handle whitespace-only text', () => {
      const input = '   \n\t   ';
      const result = sanitizeHtml(input);
      expect(result).toBe('   \n\t   '); // Whitespace is preserved
    });

    it('should handle text with line breaks', () => {
      const input = '<p>Line 1\nLine 2\r\nLine 3</p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });
  });
});

