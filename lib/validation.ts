import { cache } from 'react';

export const validateDateFormat = cache((dateString: string): boolean => {
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!regex.test(dateString)) return false;

  const [day, month, year] = dateString.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
});

export const validateRequired = cache((value: string | undefined): boolean => {
  return value !== undefined && value.trim().length > 0;
});

export const validateYear = cache((yearString: string): boolean => {
  const year = parseInt(yearString, 10);
  const currentYear = new Date().getFullYear();
  return year >= 2000 && year <= currentYear;
});

export const validateShoulderHeight = cache((heightString: string): boolean => {
  const height = parseInt(heightString, 10);
  return height > 0 && height < 200;
});

