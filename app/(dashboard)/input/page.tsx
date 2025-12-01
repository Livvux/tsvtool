'use client';

import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateDateFormat, validateRequired } from '@/lib/validation';
import { logger } from '@/lib/logger';
import type { AnimalFormData } from '@/types/animal';
import { 
  isAllowedImageType, 
  isAllowedVideoType, 
  MAX_IMAGE_SIZE, 
  MAX_VIDEO_SIZE 
} from '@/types/animal';
import { DatePicker } from '@/components/ui/date-picker';

/**
 * Get file extension from filename or mime type
 */
function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName) return fromName;
  
  // Fallback based on mime type
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

export default function InputPage() {
  const createAnimal = useMutation(api.animals.create);
  const generateR2UploadUrl = useAction(api.r2.generateUploadUrl);
  
  const [formData, setFormData] = useState<AnimalFormData>({
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
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof AnimalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validierung
    const validFiles = Array.from(files).filter((file) => {
      if (!isAllowedImageType(file.type)) {
        setError(`Ungültiger Bildtyp: ${file.name}. Erlaubt: JPEG, PNG, WebP, GIF`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Bild zu groß: ${file.name}. Max. 10 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        // Get presigned URL from R2
        const { uploadUrl, storageId } = await generateR2UploadUrl({
          contentType: file.type,
          fileExtension: getFileExtension(file),
        });
        
        // Upload directly to R2
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...storageIds]);
    } catch (err) {
      logger.error('Error uploading images', err instanceof Error ? err : new Error(String(err)), { action: 'handleImageUpload' });
      setError('Fehler beim Hochladen der Bilder');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validierung
    const validFiles = Array.from(files).filter((file) => {
      if (!isAllowedVideoType(file.type)) {
        setError(`Ungültiger Videotyp: ${file.name}. Erlaubt: MP4, WebM, MOV, AVI`);
        return false;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        setError(`Video zu groß: ${file.name}. Max. 100 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingVideos(true);
    setError('');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        // Get presigned URL from R2
        const { uploadUrl, storageId } = await generateR2UploadUrl({
          contentType: file.type,
          fileExtension: getFileExtension(file),
        });
        
        // Upload directly to R2
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);
      setUploadedVideos((prev) => [...prev, ...storageIds]);
    } catch (err) {
      logger.error('Error uploading videos', err instanceof Error ? err : new Error(String(err)), { action: 'handleVideoUpload' });
      setError('Fehler beim Hochladen der Videos');
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setUploadedVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!validateRequired(formData.name)) {
      setError('Name ist erforderlich');
      setLoading(false);
      return;
    }

    if (formData.birthDate && !validateDateFormat(formData.birthDate)) {
      setError('Geburtsdatum muss im Format TT.MM.JJJJ sein');
      setLoading(false);
      return;
    }

    try {
      await createAnimal({
        ...formData,
        gallery: uploadedImages,
        videos: uploadedVideos.length > 0 ? uploadedVideos : undefined,
      });

      // Reset form
      setFormData({
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
      });
      setUploadedImages([]);
      setUploadedVideos([]);
      alert('Tierprofil erfolgreich erstellt!');
    } catch (err) {
      logger.error('Error creating animal', err instanceof Error ? err : new Error(String(err)), { action: 'handleSubmit' });
      setError('Fehler beim Erstellen des Tierprofils');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-accent">Neues Tier hinzufügen</h1>
        <p className="mt-3 text-textPrimary">
          Erstellen Sie ein neues Tierprofil (Bulgarisch)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen / Основна информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name">Име / Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="animal">Вид животно / Tier-Art *</Label>
                <Select
                  value={formData.animal}
                  onValueChange={(value: 'Hund' | 'Katze') =>
                    handleInputChange('animal', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hund">Куче / Hund</SelectItem>
                    <SelectItem value="Katze">Котка / Katze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="gender">Пол / Geschlecht *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'weiblich' | 'männlich') =>
                    handleInputChange('gender', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weiblich">Женски / Weiblich</SelectItem>
                    <SelectItem value="männlich">Мъжки / Männlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="breed">Порода / Rasse *</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="birthDate">Рождена дата / Geboren</Label>
                <DatePicker
                  value={formData.birthDate}
                  onChange={(value) => handleInputChange('birthDate', value)}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="shoulderHeight">Размер / Größe (cm)</Label>
                <Input
                  id="shoulderHeight"
                  type="number"
                  value={formData.shoulderHeight || ''}
                  onChange={(e) => handleInputChange('shoulderHeight', e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="color">Цвят / Farbe *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Медицинска информация / Medizinische Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="castrated">Кастриран / Kastriert *</Label>
                <Select
                  value={formData.castrated}
                  onValueChange={(value: 'JA' | 'NEIN') =>
                    handleInputChange('castrated', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Да / JA</SelectItem>
                    <SelectItem value="NEIN">Не / NEIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="vaccinated">Ваксиниран / Geimpft *</Label>
                <Select
                  value={formData.vaccinated}
                  onValueChange={(value: 'JA' | 'NEIN' | 'teilweise') =>
                    handleInputChange('vaccinated', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Да / JA</SelectItem>
                    <SelectItem value="NEIN">Не / NEIN</SelectItem>
                    <SelectItem value="teilweise">Частично / Teilweise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="chipped">Чипиран / Gechipt *</Label>
                <Select
                  value={formData.chipped}
                  onValueChange={(value: 'vollständig' | 'teilweise' | 'nein') =>
                    handleInputChange('chipped', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vollständig">Да / Vollständig</SelectItem>
                    <SelectItem value="teilweise">Частично / Teilweise</SelectItem>
                    <SelectItem value="nein">Не / Nein</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="health">Здраве / Gesundheit *</Label>
                <Select
                  value={formData.health}
                  onValueChange={(value: 'JA' | 'NEIN') =>
                    handleInputChange('health', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Здрав / Gesund</SelectItem>
                    <SelectItem value="NEIN">Проблеми / Probleme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="bloodType">Кръвна група / Blutgruppe</Label>
                <Input
                  id="bloodType"
                  value={formData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="diseases">Болести / Krankheiten</Label>
              <Textarea
                id="diseases"
                value={formData.diseases || ''}
                onChange={(e) => handleInputChange('diseases', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="handicap">Увреждания / Handicap</Label>
              <Textarea
                id="handicap"
                value={formData.handicap || ''}
                onChange={(e) => handleInputChange('handicap', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="healthText">Здравни бележки / Gesundheitsnotizen</Label>
              <Textarea
                id="healthText"
                value={formData.healthText || ''}
                onChange={(e) => handleInputChange('healthText', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поведение / Verhalten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="characteristics">Характер / Wesen *</Label>
              <Textarea
                id="characteristics"
                placeholder="напр. спокоен, умен, нежен..."
                value={formData.characteristics}
                onChange={(e) => handleInputChange('characteristics', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="compatibleDogs">С кучета / Mit Hunden *</Label>
                <Select
                  value={formData.compatibleDogs}
                  onValueChange={(value) => handleInputChange('compatibleDogs', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Да / JA</SelectItem>
                    <SelectItem value="NEIN">Не / NEIN</SelectItem>
                    <SelectItem value="kann getestet werden">Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="compatibleCats">С котки / Mit Katzen *</Label>
                <Select
                  value={formData.compatibleCats}
                  onValueChange={(value) => handleInputChange('compatibleCats', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Да / JA</SelectItem>
                    <SelectItem value="NEIN">Не / NEIN</SelectItem>
                    <SelectItem value="kann getestet werden">Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="compatibleChildren">С деца / Mit Kindern *</Label>
                <Select
                  value={formData.compatibleChildren}
                  onValueChange={(value) => handleInputChange('compatibleChildren', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Да / JA</SelectItem>
                    <SelectItem value="NEIN">Не / NEIN</SelectItem>
                    <SelectItem value="kann getestet werden">Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="compatibilityText">Допълнителна информация / Zusätzliche Information</Label>
              <Textarea
                id="compatibilityText"
                value={formData.compatibilityText || ''}
                onChange={(e) => handleInputChange('compatibilityText', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Описание и местоположение / Beschreibung & Standort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="descShort">Кратко описание / Kurzbeschreibung (2 изречения) *</Label>
              <Textarea
                id="descShort"
                placeholder="Напишете кратко описание на животното..."
                value={formData.descShort}
                onChange={(e) => handleInputChange('descShort', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="location">Местоположение / Aufenthaltsort *</Label>
                <Input
                  id="location"
                  placeholder="напр. в приют Разград"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="seekingHomeSince">Търси дом от / Sucht Zuhause seit (Jahr)</Label>
                <Input
                  id="seekingHomeSince"
                  placeholder="2023"
                  value={formData.seekingHomeSince || ''}
                  onChange={(e) => handleInputChange('seekingHomeSince', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="webLink">Уеб линк / Web Link</Label>
              <Input
                id="webLink"
                type="url"
                placeholder="https://..."
                value={formData.webLink || ''}
                onChange={(e) => handleInputChange('webLink', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Медии / Medien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bilder-Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="images" className="text-base font-semibold">
                  📷 Снимки / Bilder *
                </Label>
                <span className="text-xs text-slate-500">Max. 10 MB pro Bild</span>
              </div>
              <div className="relative">
                <Input
                  id="images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="cursor-pointer"
                />
                {uploadingImages && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                    <span className="text-sm text-primary animate-pulse">Lädt hoch...</span>
                  </div>
                )}
              </div>
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {uploadedImages.length} Снимки качени / Bilder hochgeladen
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm"
                      >
                        <span>Bild {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video-Upload */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <Label htmlFor="videos" className="text-base font-semibold">
                  🎬 Видеа / Videos (optional)
                </Label>
                <span className="text-xs text-slate-500">Max. 100 MB pro Video</span>
              </div>
              <div className="relative">
                <Input
                  id="videos"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  multiple
                  onChange={handleVideoUpload}
                  disabled={uploadingVideos}
                  className="cursor-pointer"
                />
                {uploadingVideos && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                    <span className="text-sm text-primary animate-pulse">Video wird hochgeladen...</span>
                  </div>
                )}
              </div>
              {uploadedVideos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {uploadedVideos.length} Видеа качени / Videos hochgeladen
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedVideos.map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm"
                      >
                        <span>Video {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Erlaubte Formate: MP4, WebM, MOV, AVI
              </p>
            </div>

            {/* Externe Video-Links */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <Label htmlFor="videoLink" className="text-base font-semibold">
                🔗 Externer Video-Link (YouTube, Vimeo)
              </Label>
              <Input
                id="videoLink"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoLink || ''}
                onChange={(e) => handleInputChange('videoLink', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-5">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-6">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Отказ / Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Изпращане... / Senden...' : 'Създаване на профил / Profil erstellen'}
          </Button>
        </div>
      </form>
    </div>
  );
}

