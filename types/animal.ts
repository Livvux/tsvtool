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
  
  // Media
  videoLink?: string;
  webLink?: string;
  
  // Content
  descShort: string;
  
  // Location
  location: string;
  seekingHomeSince?: string;
}

