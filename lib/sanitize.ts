/**
 * HTML Sanitization Utility
 * 
 * Provides XSS protection by sanitizing user-generated content.
 * Uses DOMPurify to remove potentially dangerous HTML/JavaScript.
 * 
 * Strategy: Strict mode - removes ALL HTML tags, returns plain text only.
 * This is the safest approach since the application currently doesn't use
 * rich text formatting in textareas.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content by removing all HTML tags and returning plain text.
 * This prevents XSS attacks while preserving the text content.
 * 
 * @param text - The text content that may contain HTML
 * @returns Sanitized plain text (all HTML tags removed)
 * 
 * @example
 * sanitizeHtml('<script>alert("XSS")</script>Hello') // Returns: 'Hello'
 * sanitizeHtml('<p>Text</p>') // Returns: 'Text'
 * sanitizeHtml('Plain text') // Returns: 'Plain text'
 */
export function sanitizeHtml(text: string | undefined | null): string {
  if (!text) {
    return '';
  }

  // Use DOMPurify in strict mode - removes all HTML tags
  // This returns plain text only, which is the safest approach
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No HTML attributes allowed
    KEEP_CONTENT: true, // Keep text content but remove tags
  });

  return sanitized;
}

/**
 * Sanitizes text content for display in React components.
 * This is a convenience wrapper that handles undefined/null values.
 * 
 * @param text - The text content to sanitize
 * @returns Sanitized text, or empty string if input is falsy
 */
export function sanitizeText(text: string | undefined | null): string {
  return sanitizeHtml(text);
}

