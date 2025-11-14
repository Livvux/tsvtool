import { cache } from 'react';
import brandingData from '@/docs/branding/json/branding.json';

export const branding = brandingData.branding;

export const colors = {
  accent: '#09202C',
  primary: '#5C82A1',
  background: '#FFFFFF',
  textPrimary: '#4A4E57',
  inputBorder: '#CCCCCC',
};

export const typography = {
  fontSizes: {
    h1: '36px',
    h2: '28px',
    body: '18px',
  },
  fontFamily: 'HelveticaNowText, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const logo = {
  main: 'https://tsvstrassenpfoten.de/wp-content/uploads/2024/09/TSV-Strassenpfoten-Logo.webp',
  favicon: 'https://tsvstrassenpfoten.de/wp-content/uploads/2023/03/favicon.svg',
};

// Cached getter functions for branding data
export const getBranding = cache(() => branding);
export const getColors = cache(() => colors);
export const getTypography = cache(() => typography);
export const getLogo = cache(() => logo);

