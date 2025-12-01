import { ReactNode } from 'react';
import { ConvexClientProviderClient } from './ConvexClientProviderClient';

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProviderClient>
      {children}
    </ConvexClientProviderClient>
  );
}
