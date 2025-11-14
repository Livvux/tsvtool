import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistributionStatus } from '@/components/animal/DistributionStatus';
import type { Animal } from '@/types/animal';

const createMockAnimal = (distributedTo: Animal['distributedTo']): Animal => ({
  _id: 'test-id' as any,
  _creationTime: Date.now(),
  name: 'Test Animal',
  animal: 'Hund',
  breed: 'Labrador',
  gender: 'weiblich',
  color: 'braun',
  castrated: 'JA',
  vaccinated: 'JA',
  chipped: 'vollständig',
  health: 'JA',
  characteristics: 'Friendly',
  compatibleDogs: 'JA',
  compatibleCats: 'NEIN',
  compatibleChildren: 'JA',
  descShort: 'Test description',
  status: 'FINALISIERT',
  location: 'Test Location',
  createdBy: 'user-id' as any,
  createdByRole: 'input',
  gallery: [],
  distributedTo,
});

describe('DistributionStatus', () => {
  it('should show "Noch nicht verteilt" when no distribution exists', () => {
    const animal = createMockAnimal({});
    render(<DistributionStatus animal={animal} />);
    expect(screen.getByText(/Noch nicht verteilt/)).toBeInTheDocument();
  });

  it('should display platform statuses', () => {
    const animal = createMockAnimal({
      wordpress: true,
      facebook: false,
      instagram: true,
      x: false,
      matchpfote: true,
      distributedAt: Date.now(),
    });
    render(<DistributionStatus animal={animal} />);
    expect(screen.getByText('WordPress')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByText('matchpfote')).toBeInTheDocument();
  });

  it('should show success badges for successful distributions', () => {
    const animal = createMockAnimal({
      wordpress: true,
      facebook: true,
      distributedAt: Date.now(),
    });
    render(<DistributionStatus animal={animal} />);
    const successBadges = screen.getAllByText('Erfolgreich');
    expect(successBadges.length).toBeGreaterThan(0);
  });

  it('should show failed badges for failed distributions', () => {
    const animal = createMockAnimal({
      wordpress: false,
      facebook: false,
      distributedAt: Date.now(),
    });
    render(<DistributionStatus animal={animal} />);
    const failedBadges = screen.getAllByText('Fehlgeschlagen');
    expect(failedBadges.length).toBeGreaterThan(0);
  });

  it('should display distribution timestamp when available', () => {
    const timestamp = Date.now();
    const animal = createMockAnimal({
      wordpress: true,
      distributedAt: timestamp,
    });
    render(<DistributionStatus animal={animal} />);
    expect(screen.getByText(/Verteilungszeitpunkt:/)).toBeInTheDocument();
  });
});

