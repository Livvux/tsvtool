import type { AnimalFormData } from '@/types/animal';

export interface WizardStep {
  id: number;
  title: string;
  titleBG: string;
  description: string;
  icon: string;
}

export interface StepProps {
  formData: AnimalFormData;
  onUpdate: (field: keyof AnimalFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export interface MediaStepProps extends StepProps {
  uploadedImages: string[];
  uploadedVideos: string[];
  uploadingImages: boolean;
  uploadingVideos: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onRemoveVideo: (index: number) => void;
}

export interface SummaryStepProps extends StepProps {
  uploadedImages: string[];
  uploadedVideos: string[];
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Grundinfo',
    titleBG: 'Основна информация',
    description: 'Name, Art, Geschlecht',
    icon: '🐾',
  },
  {
    id: 2,
    title: 'Medizin',
    titleBG: 'Медицина',
    description: 'Gesundheit & Impfungen',
    icon: '💉',
  },
  {
    id: 3,
    title: 'Verhalten',
    titleBG: 'Поведение',
    description: 'Charakter & Verträglichkeit',
    icon: '🧡',
  },
  {
    id: 4,
    title: 'Beschreibung',
    titleBG: 'Описание',
    description: 'Text & Standort',
    icon: '📝',
  },
  {
    id: 5,
    title: 'Medien',
    titleBG: 'Медии',
    description: 'Fotos & Videos',
    icon: '📷',
  },
  {
    id: 6,
    title: 'Prüfen',
    titleBG: 'Преглед',
    description: 'Zusammenfassung',
    icon: '✅',
  },
];

