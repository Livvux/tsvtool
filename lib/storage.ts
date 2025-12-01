/**
 * R2 Storage URL utilities
 * 
 * URLs are constructed in the frontend using NEXT_PUBLIC_R2_URL
 * because Convex Queries cannot access environment variables.
 */

/**
 * Get the R2 public base URL
 */
export function getR2BaseUrl(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env.NEXT_PUBLIC_R2_URL || null;
  }
  // Client-side: use NEXT_PUBLIC_ prefixed env var
  return process.env.NEXT_PUBLIC_R2_URL || null;
}

/**
 * Construct a public URL for a storage ID
 */
export function getR2PublicUrl(storageId: string | null | undefined): string | null {
  if (!storageId) return null;
  
  const baseUrl = getR2BaseUrl();
  if (!baseUrl) return null;
  
  return `${baseUrl}/${storageId}`;
}

/**
 * Construct multiple public URLs from storage IDs
 */
export function getR2PublicUrls(storageIds: (string | null | undefined)[]): (string | null)[] {
  const baseUrl = getR2BaseUrl();
  if (!baseUrl) return storageIds.map(() => null);
  
  return storageIds.map((id) => (id ? `${baseUrl}/${id}` : null));
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!getR2BaseUrl();
}

