import { cache } from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = cache((dateString: string): string => {
  // Assumes TT.MM.JJJJ format
  return dateString;
});

