import { cache } from 'react';

export const getStatusColor = cache((status: string): string => {
  switch (status) {
    case 'ENTWURF':
      return 'bg-gray-100 text-gray-800';
    case 'ABGELEHNT':
      return 'bg-red-100 text-red-800';
    case 'AKZEPTIERT':
      return 'bg-green-100 text-green-800';
    case 'FINALISIERT':
      return 'bg-blue-100 text-blue-800';
    default:
      return '';
  }
});

export const getStatusBadge = cache((status: boolean | undefined): {
  className: string;
  text: string;
} => {
  if (status === undefined) {
    return { className: 'bg-gray-100 text-gray-600', text: 'Nicht verteilt' };
  }
  if (status) {
    return { className: 'bg-green-100 text-green-800', text: 'Erfolgreich' };
  }
  return { className: 'bg-red-100 text-red-800', text: 'Fehlgeschlagen' };
});

export const formatDateTime = cache((timestamp: number | undefined): string | null => {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

