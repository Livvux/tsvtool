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
    // New design shows breed, gender, location and animal type
    expect(screen.getByText('Labrador')).toBeInTheDocument();
    expect(screen.getByText('weiblich')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Hund')).toBeInTheDocument();
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

  it('should render descShort when descLong is not provided', () => {
    render(<AnimalCard animal={mockAnimal} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should show female symbol for weiblich gender', () => {
    render(<AnimalCard animal={mockAnimal} />);
    expect(screen.getByText('♀')).toBeInTheDocument();
  });

  it('should show male symbol for männlich gender', () => {
    const maleAnimal = { ...mockAnimal, gender: 'männlich' as const };
    render(<AnimalCard animal={maleAnimal} />);
    expect(screen.getByText('♂')).toBeInTheDocument();
  });
});
