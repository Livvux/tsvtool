import { Doc, Id } from '@/convex/_generated/dataModel';

export type Animal = Doc<'animals'>;
export type AnimalId = Id<'animals'>;

export type AnimalStatus = 'ENTWURF' | 'ABGELEHNT' | 'AKZEPTIERT' | 'FINALISIERT';
export type AnimalType = 'Hund' | 'Katze';
export type Gender = 'weiblich' | 'männlich';
export type YesNo = 'JA' | 'NEIN';
export type YesNoPartial = 'JA' | 'NEIN' | 'teilweise';
export type ChipStatus = 'vollständig' | 'teilweise' | 'nein';
export type CompatibilityStatus = 'JA' | 'NEIN' | 'kann getestet werden';
export type UserRole = 'admin' | 'input' | 'manager';

export interface AnimalFormData {
  // Basic Info
  name: string;
  animal: AnimalType;
  breed: string;
  gender: Gender;
  birthDate?: string;
  shoulderHeight?: string;
  color: string;
  
  // Medical
  castrated: YesNo;
  vaccinated: YesNoPartial;
  chipped: ChipStatus;
  bloodType?: string;
  health: YesNo;
  healthText?: string;
  diseases?: string;
  handicap?: string;
  
  // Behavior
  characteristics: string;
  compatibleDogs: CompatibilityStatus;
  compatibleCats: CompatibilityStatus;
  compatibleChildren: CompatibilityStatus;
  compatibilityText?: string;
  
  // Media - Externe Links
  videoLink?: string;
  webLink?: string;
  
  // Content
  descShort: string;
  
  // Location
  location: string;
  seekingHomeSince?: string;
}

/**
 * Erlaubte Video-MIME-Types für Upload
 */
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
] as const;

/**
 * Erlaubte Bild-MIME-Types für Upload
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Max. Dateigröße für Videos (100 MB)
 */
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

/**
 * Max. Dateigröße für Bilder (10 MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Prüft, ob ein MIME-Type ein erlaubtes Video ist
 */
export function isAllowedVideoType(mimeType: string): boolean {
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Prüft, ob ein MIME-Type ein erlaubtes Bild ist
 */
export function isAllowedImageType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

