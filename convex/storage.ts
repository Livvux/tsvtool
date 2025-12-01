/**
 * Storage utilities for R2
 * 
 * Note: process.env is NOT available in Convex Queries.
 * URL construction happens in the frontend using NEXT_PUBLIC_R2_URL.
 * 
 * This file only contains helper types and constants.
 */

// Re-export nothing - queries cannot use env vars
// Frontend should construct URLs using lib/storage.ts

export {};
