'use client';

import { useState, useCallback } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { WIZARD_STEPS } from './types';
import {
  BasicInfoStep,
  MedicalInfoStep,
  BehaviorStep,
  DescriptionStep,
  MediaStep,
  SummaryStep,
} from './steps';
import { logger } from '@/lib/logger';
import { Keyboard } from 'lucide-react';
import type { AnimalFormData } from '@/types/animal';
import { isAllowedImageType, isAllowedVideoType, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/types/animal';

const initialFormData: AnimalFormData = {
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

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName) return fromName;
  
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
  };
  return mimeToExt[file.type] || 'bin';
}

export function AnimalWizard() {
  const createAnimal = useMutation(api.animals.create);
  const generateR2UploadUrl = useAction(api.r2.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<AnimalFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleUpdate = useCallback((field: keyof AnimalFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Име е задължително';
        if (!formData.breed.trim()) newErrors.breed = 'Порода е задължителна';
        if (!formData.color.trim()) newErrors.color = 'Цвят е задължителен';
        break;
      case 3:
        if (!formData.characteristics.trim() || formData.characteristics.length < 10) {
          newErrors.characteristics = 'Моля, опишете характера (мин. 10 символа)';
        }
        break;
      case 4:
        if (!formData.descShort.trim() || formData.descShort.length < 20) {
          newErrors.descShort = 'Описанието трябва да е поне 20 символа';
        }
        if (!formData.location.trim()) {
          newErrors.location = 'Местоположението е задължително';
        }
        break;
      case 5:
        if (uploadedImages.length === 0) {
          newErrors.images = 'Поне една снимка е задължителна';
        }
        break;
      case 6:
        if (!formData.name.trim()) newErrors.name = 'Име е задължително';
        if (!formData.breed.trim()) newErrors.breed = 'Порода е задължителна';
        if (!formData.color.trim()) newErrors.color = 'Цвят е задължителен';
        if (!formData.characteristics.trim()) newErrors.characteristics = 'Характер е задължителен';
        if (!formData.descShort.trim()) newErrors.descShort = 'Описание е задължително';
        if (!formData.location.trim()) newErrors.location = 'Местоположение е задължително';
        if (uploadedImages.length === 0) newErrors.images = 'Снимки са задължителни';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, uploadedImages]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
    }
  }, [currentStep, validateStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!isAllowedImageType(file.type)) {
        setGlobalError(`Ungültiger Bildtyp: ${file.name}`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setGlobalError(`Bild zu groß: ${file.name}. Max. 10 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    setGlobalError('');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const { uploadUrl, storageId } = await generateR2UploadUrl({
          contentType: file.type,
          fileExtension: getFileExtension(file),
        });
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...storageIds]);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    } catch (err) {
      logger.error('Error uploading images', err instanceof Error ? err : new Error(String(err)));
      setGlobalError('Fehler beim Hochladen der Bilder');
    } finally {
      setUploadingImages(false);
    }
  }, [generateR2UploadUrl]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!isAllowedVideoType(file.type)) {
        setGlobalError(`Ungültiger Videotyp: ${file.name}`);
        return false;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        setGlobalError(`Video zu groß: ${file.name}. Max. 100 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingVideos(true);
    setGlobalError('');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const { uploadUrl, storageId } = await generateR2UploadUrl({
          contentType: file.type,
          fileExtension: getFileExtension(file),
        });
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);
      setUploadedVideos((prev) => [...prev, ...storageIds]);
    } catch (err) {
      logger.error('Error uploading videos', err instanceof Error ? err : new Error(String(err)));
      setGlobalError('Fehler beim Hochladen der Videos');
    } finally {
      setUploadingVideos(false);
    }
  }, [generateR2UploadUrl]);

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveVideo = useCallback((index: number) => {
    setUploadedVideos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setGlobalError('');

    try {
      await createAnimal({
        ...formData,
        gallery: uploadedImages,
        videos: uploadedVideos.length > 0 ? uploadedVideos : undefined,
      });

      setFormData(initialFormData);
      setUploadedImages([]);
      setUploadedVideos([]);
      setCurrentStep(1);
      setCompletedSteps([]);
      setErrors({});
      
      alert('Tierprofil erfolgreich erstellt!');
    } catch (err) {
      logger.error('Error creating animal', err instanceof Error ? err : new Error(String(err)));
      setGlobalError('Fehler beim Erstellen des Tierprofils');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, uploadedImages, uploadedVideos, createAnimal, validateStep]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return !!formData.name && !!formData.breed && !!formData.color;
      case 2: return true;
      case 3: return !!formData.characteristics && formData.characteristics.length >= 10;
      case 4: return !!formData.descShort && formData.descShort.length >= 20 && !!formData.location;
      case 5: return uploadedImages.length > 0;
      case 6: return uploadedImages.length > 0 && !!formData.name && !!formData.breed && 
               !!formData.color && !!formData.characteristics && !!formData.descShort && !!formData.location;
      default: return true;
    }
  }, [currentStep, formData, uploadedImages]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <BasicInfoStep formData={formData} onUpdate={handleUpdate} errors={errors} />;
      case 2: return <MedicalInfoStep formData={formData} onUpdate={handleUpdate} errors={errors} />;
      case 3: return <BehaviorStep formData={formData} onUpdate={handleUpdate} errors={errors} />;
      case 4: return <DescriptionStep formData={formData} onUpdate={handleUpdate} errors={errors} />;
      case 5: return (
        <MediaStep
          formData={formData} onUpdate={handleUpdate} errors={errors}
          uploadedImages={uploadedImages} uploadedVideos={uploadedVideos}
          uploadingImages={uploadingImages} uploadingVideos={uploadingVideos}
          onImageUpload={handleImageUpload} onVideoUpload={handleVideoUpload}
          onRemoveImage={handleRemoveImage} onRemoveVideo={handleRemoveVideo}
        />
      );
      case 6: return (
        <SummaryStep formData={formData} onUpdate={handleUpdate}
          uploadedImages={uploadedImages} uploadedVideos={uploadedVideos}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Neues Tier hinzufügen</h1>
        <p className="text-muted-foreground mt-2">Създаване на нов профил на животно</p>
      </div>

      <div className="mb-8">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          {globalError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <p className="text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>{globalError}
              </p>
            </div>
          )}

          <div className="min-h-[400px]">{renderStep()}</div>

          <StepNavigation
            currentStep={currentStep} onNext={handleNext} onPrev={handlePrev}
            onSubmit={handleSubmit} isSubmitting={isSubmitting} canProceed={canProceed()}
          />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
        <Keyboard className="w-3.5 h-3.5" />
        <span>Натиснете Enter за следваща стъпка</span>
      </p>
    </div>
  );
}

