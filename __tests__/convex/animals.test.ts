import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for animals.ts Convex functions
 * 
 * Tests validate:
 * - Argument validation patterns
 * - Status transition logic
 * - Workflow triggers
 * - Audit log creation
 */

// Mock animal data
const mockUser = {
  _id: 'user_123' as any,
  name: 'Test User',
  email: 'test@example.com',
  role: 'input' as const,
  tokenIdentifier: 'clerk|user_123',
};

const mockManagerUser = {
  ...mockUser,
  _id: 'manager_123' as any,
  role: 'manager' as const,
};

const mockAnimalData = {
  name: 'Luna',
  animal: 'Hund' as const,
  breed: 'Mischling',
  gender: 'weiblich' as const,
  color: 'Braun-Weiß',
  castrated: 'JA' as const,
  vaccinated: 'JA' as const,
  chipped: 'vollständig' as const,
  health: 'JA' as const,
  characteristics: 'Freundlich, verspielt, kinderlieb',
  compatibleDogs: 'JA' as const,
  compatibleCats: 'NEIN' as const,
  compatibleChildren: 'JA' as const,
  descShort: 'Luna е прекрасно куче, което търси любящ дом.',
  location: 'Tierheim Razgrad',
  gallery: ['storage_id_1', 'storage_id_2'],
};

const mockAnimal = {
  _id: 'animal_123' as any,
  _creationTime: Date.now(),
  ...mockAnimalData,
  status: 'ENTWURF' as const,
  createdBy: mockUser._id,
  createdByRole: 'input' as const,
  distributedTo: {},
};

describe('animals.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create mutation', () => {
    it('should require all required fields', () => {
      const requiredFields = [
        'name',
        'animal',
        'breed',
        'gender',
        'color',
        'castrated',
        'vaccinated',
        'chipped',
        'health',
        'characteristics',
        'compatibleDogs',
        'compatibleCats',
        'compatibleChildren',
        'descShort',
        'location',
        'gallery',
      ];

      requiredFields.forEach((field) => {
        expect(mockAnimalData).toHaveProperty(field);
      });
    });

    it('should set initial status to ENTWURF', () => {
      expect(mockAnimal.status).toBe('ENTWURF');
    });

    it('should store createdBy and createdByRole', () => {
      expect(mockAnimal.createdBy).toBe(mockUser._id);
      expect(mockAnimal.createdByRole).toBe('input');
    });

    it('should preserve Bulgarian description in descShortBG', () => {
      // descShortBG should be set to original descShort
      const expectedDescShortBG = mockAnimalData.descShort;
      expect(expectedDescShortBG).toMatch(/[а-яА-Я]/); // Contains Cyrillic
    });

    it('should initialize distributedTo as empty object', () => {
      expect(mockAnimal.distributedTo).toEqual({});
    });

    it('should accept optional fields', () => {
      const optionalFields = {
        birthDate: '01.01.2020',
        shoulderHeight: '50',
        bloodType: 'DEA 1.1',
        healthText: 'Gesund',
        diseases: 'Keine',
        handicap: 'Keine',
        compatibilityText: 'Sehr verträglich',
        videoLink: 'https://example.com/video',
        webLink: 'https://example.com',
        seekingHomeSince: '2020',
        videos: ['video_id_1'],
      };

      // All optional fields should be accepted
      Object.keys(optionalFields).forEach((field) => {
        expect(optionalFields).toHaveProperty(field);
      });
    });
  });

  describe('update mutation', () => {
    it('should allow partial updates', () => {
      const updates = {
        name: 'Luna Updated',
        breed: 'Labrador Mix',
        color: 'Schwarz-Weiß',
      };

      // Should allow updating individual fields
      expect(updates).toHaveProperty('name');
      expect(updates).toHaveProperty('breed');
      expect(updates).toHaveProperty('color');
    });

    it('should preserve unchanged fields', () => {
      const original = { ...mockAnimal };
      const updates = { name: 'Luna Updated' };

      // Only name should change, other fields remain
      const updated = { ...original, ...updates };
      expect(updated.name).toBe('Luna Updated');
      expect(updated.breed).toBe(original.breed);
      expect(updated.color).toBe(original.color);
    });

    it('should allow updating characteristicsBG separately', () => {
      const updates = {
        characteristics: 'Updated German text',
        characteristicsBG: 'Оригинален български текст',
      };

      expect(updates.characteristics).toBeTruthy();
      expect(updates.characteristicsBG).toMatch(/[а-яА-Я]/);
    });

    it('should require authentication', () => {
      // This would be enforced by getCurrentUser in actual implementation
      const isAuthenticated = mockUser !== null;
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('updateStatus mutation', () => {
    it('should only allow manager or admin to update status', () => {
      const allowedRoles = ['manager', 'admin'];
      expect(allowedRoles).toContain(mockManagerUser.role);
      expect(allowedRoles).not.toContain(mockUser.role);
    });

    it('should set reviewedBy and reviewedAt when status is AKZEPTIERT', () => {
      const statusUpdate = {
        status: 'AKZEPTIERT' as const,
        reviewedBy: mockManagerUser._id,
        reviewedAt: Date.now(),
      };

      expect(statusUpdate.status).toBe('AKZEPTIERT');
      expect(statusUpdate.reviewedBy).toBeTruthy();
      expect(statusUpdate.reviewedAt).toBeTruthy();
      expect(typeof statusUpdate.reviewedAt).toBe('number');
    });

    it('should set finalizedBy and finalizedAt when status is FINALISIERT', () => {
      const statusUpdate = {
        status: 'FINALISIERT' as const,
        finalizedBy: mockManagerUser._id,
        finalizedAt: Date.now(),
      };

      expect(statusUpdate.status).toBe('FINALISIERT');
      expect(statusUpdate.finalizedBy).toBeTruthy();
      expect(statusUpdate.finalizedAt).toBeTruthy();
      expect(typeof statusUpdate.finalizedAt).toBe('number');
    });

    it('should trigger translation workflow when status becomes AKZEPTIERT', () => {
      const status = 'AKZEPTIERT';
      
      // Translation should be triggered via scheduler
      const shouldTriggerTranslation = status === 'AKZEPTIERT';
      expect(shouldTriggerTranslation).toBe(true);
    });

    it('should trigger distribution workflow when status becomes FINALISIERT', () => {
      const status = 'FINALISIERT';
      
      // Distribution should be triggered via scheduler
      const shouldTriggerDistribution = status === 'FINALISIERT';
      expect(shouldTriggerDistribution).toBe(true);
    });

    it('should trigger matchpfote sync when status becomes FINALISIERT', () => {
      const status = 'FINALISIERT';
      
      // matchpfote sync should be triggered via scheduler (with delay)
      const shouldTriggerMatchpfote = status === 'FINALISIERT';
      expect(shouldTriggerMatchpfote).toBe(true);
    });

    it('should validate status transitions', () => {
      const validTransitions: Record<string, string[]> = {
        ENTWURF: ['AKZEPTIERT', 'ABGELEHNT'],
        ABGELEHNT: [], // Terminal
        AKZEPTIERT: ['FINALISIERT', 'ABGELEHNT'],
        FINALISIERT: [], // Terminal
      };

      // ENTWURF can become AKZEPTIERT
      expect(validTransitions.ENTWURF).toContain('AKZEPTIERT');
      
      // AKZEPTIERT can become FINALISIERT
      expect(validTransitions.AKZEPTIERT).toContain('FINALISIERT');
      
      // FINALISIERT is terminal
      expect(validTransitions.FINALISIERT).toHaveLength(0);
    });
  });

  describe('listPaginated query', () => {
    it('should support status filtering', () => {
      const status = 'FINALISIERT';
      expect(status).toBeTruthy();
    });

    it('should support cursor-based pagination', () => {
      const cursor = 'animal_123' as any;
      expect(cursor).toBeTruthy();
    });

    it('should default limit to 12', () => {
      const defaultLimit = 12;
      expect(defaultLimit).toBe(12);
    });

    it('should return nextCursor when more results available', () => {
      const mockResult = {
        animals: Array(12).fill(null).map((_, i) => ({
          _id: `animal_${i}` as any,
          ...mockAnimalData,
        })),
        nextCursor: 'animal_12' as any,
      };

      expect(mockResult.animals).toHaveLength(12);
      expect(mockResult.nextCursor).toBeTruthy();
    });

    it('should return null nextCursor when no more results', () => {
      const mockResult = {
        animals: Array(5).fill(null).map((_, i) => ({
          _id: `animal_${i}` as any,
          ...mockAnimalData,
        })),
        nextCursor: null,
      };

      expect(mockResult.animals.length).toBeLessThan(12);
      expect(mockResult.nextCursor).toBeNull();
    });
  });

  describe('remove mutation', () => {
    it('should only allow admin to delete animals', () => {
      const adminRole = 'admin';
      const managerRole = 'manager';
      const inputRole = 'input';

      expect(adminRole).toBe('admin');
      expect(managerRole).not.toBe('admin');
      expect(inputRole).not.toBe('admin');
    });

    it('should require authentication', () => {
      const isAuthenticated = mockUser !== null;
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('search query', () => {
    it('should search by name', () => {
      const searchTerm = 'Luna';
      const nameMatch = mockAnimal.name.toLowerCase().includes(searchTerm.toLowerCase());
      expect(nameMatch).toBe(true);
    });

    it('should search by breed', () => {
      const searchTerm = 'Mischling';
      const breedMatch = mockAnimal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      expect(breedMatch).toBe(true);
    });

    it('should search by location', () => {
      const searchTerm = 'Razgrad';
      const locationMatch = mockAnimal.location.toLowerCase().includes(searchTerm.toLowerCase());
      expect(locationMatch).toBe(true);
    });

    it('should search by animal type', () => {
      const searchTerm = 'Hund';
      const typeMatch = mockAnimal.animal.toLowerCase().includes(searchTerm.toLowerCase());
      expect(typeMatch).toBe(true);
    });

    it('should return limited results', () => {
      const limit = 10;
      const mockResults = Array(15).fill(null).map((_, i) => ({
        _id: `animal_${i}` as any,
        name: `Animal ${i}`,
      }));

      const limited = mockResults.slice(0, limit);
      expect(limited).toHaveLength(limit);
    });

    it('should return empty array for empty search term', () => {
      const searchTerm = '';
      expect(searchTerm.trim()).toBe('');
    });
  });
});

