import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimalCard } from '@/components/animal/AnimalCard';
import type { Animal } from '@/types/animal';

const mockAnimal: Animal = {
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
  distributedTo: {},
};

describe('AnimalCard', () => {
  it('should render animal name', () => {
    render(<AnimalCard animal={mockAnimal} />);
    expect(screen.getByText('Test Animal')).toBeInTheDocument();
  });

  it('should render animal details', () => {
    render(<AnimalCard animal={mockAnimal} />);
    expect(screen.getByText(/Art:/)).toBeInTheDocument();
    expect(screen.getByText(/Rasse:/)).toBeInTheDocument();
    expect(screen.getByText(/Geschlecht:/)).toBeInTheDocument();
    expect(screen.getByText(/Ort:/)).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<AnimalCard animal={mockAnimal} />);
    expect(screen.getByText('FINALISIERT')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<AnimalCard animal={mockAnimal} onClick={onClick} />);
    const card = screen.getByText('Test Animal').closest('div[class*="cursor-pointer"]');
    if (card instanceof HTMLElement) {
      card.click();
      expect(onClick).toHaveBeenCalled();
    }
  });

  it('should render description when descLong is provided', () => {
    const animalWithDesc = { ...mockAnimal, descLong: 'Long description' };
    render(<AnimalCard animal={animalWithDesc} />);
    expect(screen.getByText('Long description')).toBeInTheDocument();
  });
});

