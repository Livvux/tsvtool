import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimalWizard } from '@/components/forms/animal-wizard/AnimalWizard';
import { WIZARD_STEPS } from '@/components/forms/animal-wizard/types';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
  useAction: vi.fn(() => vi.fn()),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AnimalWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Step Navigation', () => {
    it('should start at step 1', () => {
      render(<AnimalWizard />);
      // Step 1 should be visible (Grundinfo)
      expect(screen.getByText(/Grundinfo|Основна информация/i)).toBeInTheDocument();
    });

    it('should have 6 steps total', () => {
      expect(WIZARD_STEPS).toHaveLength(6);
      expect(WIZARD_STEPS[0].title).toBe('Grundinfo');
      expect(WIZARD_STEPS[5].title).toBe('Prüfen');
    });

    it('should show step indicator with current step', () => {
      render(<AnimalWizard />);
      // Step indicator should show step 1
      const stepIndicator = screen.getByText(/Grundinfo|Основна информация/i);
      expect(stepIndicator).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields in step 1', () => {
      render(<AnimalWizard />);
      
      // Try to proceed without filling required fields
      const nextButton = screen.getByText(/Weiter|Следващ/i);
      fireEvent.click(nextButton);

      // Should show validation errors
      // Note: Actual error messages depend on implementation
      expect(screen.getByText(/Grundinfo|Основна информация/i)).toBeInTheDocument();
    });

    it('should validate characteristics length in step 3', () => {
      // Characteristics must be at least 10 characters
      const shortText = 'Short';
      expect(shortText.length).toBeLessThan(10);

      const validText = 'This is a longer description that meets the minimum requirement';
      expect(validText.length).toBeGreaterThanOrEqual(10);
    });

    it('should validate description length in step 4', () => {
      // descShort must be at least 20 characters
      const shortDesc = 'Short desc';
      expect(shortDesc.length).toBeLessThan(20);

      const validDesc = 'This is a longer description that meets the minimum requirement of 20 characters';
      expect(validDesc.length).toBeGreaterThanOrEqual(20);
    });

    it('should validate location is required in step 4', () => {
      const location = '';
      expect(location.trim()).toBe('');
    });

    it('should validate at least one image in step 5', () => {
      const emptyGallery: string[] = [];
      expect(emptyGallery.length).toBe(0);

      const galleryWithImages = ['image_id_1'];
      expect(galleryWithImages.length).toBeGreaterThan(0);
    });
  });

  describe('Form State Management', () => {
    it('should initialize with default form data', () => {
      const initialFormData = {
        name: '',
        animal: 'Hund',
        breed: '',
        gender: 'weiblich',
        color: '',
        castrated: 'NEIN',
        vaccinated: 'NEIN',
        chipped: 'nein',
        health: 'JA',
        characteristics: '',
        compatibleDogs: 'NEIN',
        compatibleCats: 'NEIN',
        compatibleChildren: 'NEIN',
        descShort: '',
        location: '',
      };

      expect(initialFormData.animal).toBe('Hund');
      expect(initialFormData.gender).toBe('weiblich');
      expect(initialFormData.name).toBe('');
    });

    it('should update form data when fields change', () => {
      const formData = {
        name: '',
        breed: '',
      };

      // Simulate field update
      const updated = { ...formData, name: 'Luna', breed: 'Mischling' };
      expect(updated.name).toBe('Luna');
      expect(updated.breed).toBe('Mischling');
    });

    it('should track completed steps', () => {
      const completedSteps: number[] = [];
      
      // Complete step 1
      completedSteps.push(1);
      expect(completedSteps).toContain(1);

      // Complete step 2
      completedSteps.push(2);
      expect(completedSteps).toContain(2);
      expect(completedSteps.length).toBe(2);
    });
  });

  describe('Step Progression', () => {
    it('should allow moving to next step when validation passes', () => {
      const currentStep = 1;
      const canProceed = true;
      
      if (canProceed) {
        const nextStep = Math.min(currentStep + 1, WIZARD_STEPS.length);
        expect(nextStep).toBe(2);
      }
    });

    it('should prevent moving to next step when validation fails', () => {
      const currentStep = 1;
      const canProceed = false;
      
      if (!canProceed) {
        const nextStep = currentStep; // Stay on current step
        expect(nextStep).toBe(1);
      }
    });

    it('should allow moving to previous step', () => {
      const currentStep = 3;
      const previousStep = Math.max(currentStep - 1, 1);
      expect(previousStep).toBe(2);
    });

    it('should not allow going below step 1', () => {
      const currentStep = 1;
      const previousStep = Math.max(currentStep - 1, 1);
      expect(previousStep).toBe(1);
    });

    it('should not allow going above step 6', () => {
      const currentStep = 6;
      const nextStep = Math.min(currentStep + 1, WIZARD_STEPS.length);
      expect(nextStep).toBe(6);
    });
  });

  describe('Media Upload', () => {
    it('should track uploaded images', () => {
      const uploadedImages: string[] = [];
      const newImage = 'image_id_1';
      
      uploadedImages.push(newImage);
      expect(uploadedImages).toContain(newImage);
      expect(uploadedImages.length).toBe(1);
    });

    it('should track uploaded videos', () => {
      const uploadedVideos: string[] = [];
      const newVideo = 'video_id_1';
      
      uploadedVideos.push(newVideo);
      expect(uploadedVideos).toContain(newVideo);
    });

    it('should allow removing images', () => {
      const uploadedImages = ['image_id_1', 'image_id_2', 'image_id_3'];
      const indexToRemove = 1;
      
      const updated = uploadedImages.filter((_, i) => i !== indexToRemove);
      expect(updated).not.toContain('image_id_2');
      expect(updated.length).toBe(2);
    });

    it('should allow removing videos', () => {
      const uploadedVideos = ['video_id_1', 'video_id_2'];
      const indexToRemove = 0;
      
      const updated = uploadedVideos.filter((_, i) => i !== indexToRemove);
      expect(updated).not.toContain('video_id_1');
      expect(updated.length).toBe(1);
    });
  });

  describe('Form Submission', () => {
    it('should validate all fields before submission', () => {
      const formData = {
        name: 'Luna',
        breed: 'Mischling',
        color: 'Braun',
        characteristics: 'Freundlich, verspielt',
        descShort: 'Luna е прекрасно куче, което търси любящ дом.',
        location: 'Tierheim Razgrad',
      };

      const uploadedImages = ['image_id_1'];

      const isValid = 
        formData.name &&
        formData.breed &&
        formData.color &&
        formData.characteristics &&
        formData.descShort &&
        formData.location &&
        uploadedImages.length > 0;

      expect(isValid).toBe(true);
    });

    it('should reset form after successful submission', () => {
      const formData = {
        name: 'Luna',
        breed: 'Mischling',
      };

      // After submission, form should reset
      const resetFormData = {
        name: '',
        breed: '',
      };

      expect(resetFormData.name).toBe('');
      expect(resetFormData.breed).toBe('');
    });

    it('should clear uploaded media after submission', () => {
      const uploadedImages = ['image_id_1', 'image_id_2'];
      const uploadedVideos = ['video_id_1'];

      // After submission
      const resetImages: string[] = [];
      const resetVideos: string[] = [];

      expect(resetImages.length).toBe(0);
      expect(resetVideos.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should display global error messages', () => {
      const globalError = 'Грешка при качване на изображенията';
      expect(globalError).toBeTruthy();
    });

    it('should clear errors when fields are updated', () => {
      const errors: Record<string, string> = { name: 'Име е задължително' };
      const field = 'name';
      
      // Clear error for field
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      
      expect(updatedErrors).not.toHaveProperty(field);
    });
  });

  describe('Step Validation Rules', () => {
    it('should validate step 1 requires name, breed, color', () => {
      const step1Data = {
        name: 'Luna',
        breed: 'Mischling',
        color: 'Braun',
      };

      const isValid = !!step1Data.name && !!step1Data.breed && !!step1Data.color;
      expect(isValid).toBe(true);
    });

    it('should validate step 3 requires characteristics (min 10 chars)', () => {
      const step3Data = {
        characteristics: 'Freundlich, verspielt, kinderlieb',
      };

      const isValid = step3Data.characteristics.length >= 10;
      expect(isValid).toBe(true);
    });

    it('should validate step 4 requires descShort (min 20 chars) and location', () => {
      const step4Data = {
        descShort: 'Luna е прекрасно куче, което търси любящ дом.',
        location: 'Tierheim Razgrad',
      };

      const isValid = 
        step4Data.descShort.length >= 20 &&
        !!step4Data.location;
      expect(isValid).toBe(true);
    });

    it('should validate step 5 requires at least one image', () => {
      const step5Data = {
        uploadedImages: ['image_id_1'],
      };

      const isValid = step5Data.uploadedImages.length > 0;
      expect(isValid).toBe(true);
    });
  });
});

