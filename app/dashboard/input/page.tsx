'use client';

import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { validateDateFormat, validateRequired } from '@/lib/validation';
import { logger } from '@/lib/logger';
import type { AnimalFormData } from '@/types/animal';
import { 
  isAllowedImageType, 
  isAllowedVideoType, 
  MAX_IMAGE_SIZE, 
  MAX_VIDEO_SIZE 
} from '@/types/animal';
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';

// Helper for bilingual labels
function BilingualLabel({ de, bg, required, className }: { de: string; bg: string; required?: boolean, className?: string }) {
  return (
    <Label className={cn("flex flex-col gap-1 mb-2", className)}>
      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
        {de} {required && <span className="text-destructive">*</span>}
      </span>
      <span className="text-xs text-muted-foreground font-normal italic">{bg}</span>
    </Label>
  );
}

/**
 * Get file extension from filename or mime type
 */
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
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof AnimalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files
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
      setError('Fehler beim Hochladen der Bilder / Грешка при качване на снимки');
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
      setError('Fehler beim Hochladen der Videos / Грешка при качване на видеа');
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
      setError('Name ist erforderlich / Името е задължително');
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    if (formData.birthDate && !validateDateFormat(formData.birthDate)) {
      setError('Geburtsdatum muss im Format TT.MM.JJJJ sein / Датата на раждане трябва да е във формат ДД.ММ.ГГГГ');
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }
    
    if (uploadedImages.length === 0) {
        setError('Mindestens ein Bild ist erforderlich / Изисква се поне една снимка');
        setLoading(false);
        window.scrollTo(0, 0);
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
      alert('Tierprofil erfolgreich erstellt! / Профилът на животното е създаден успешно!');
      window.scrollTo(0, 0);
    } catch (err) {
      logger.error('Error creating animal', err instanceof Error ? err : new Error(String(err)), { action: 'handleSubmit' });
      setError('Fehler beim Erstellen des Tierprofils / Грешка при създаване на профила');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center md:text-left space-y-4">
        <h1 className="text-4xl font-bold text-accent tracking-tight">Neues Tier hinzufügen</h1>
        <p className="text-muted-foreground text-xl">
          Erstellen Sie ein neues Tierprofil (Bulgarisch)
          <span className="block text-base text-muted-foreground/70 italic mt-2">Създайте нов профил на животно (на български)</span>
        </p>
      </div>

      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CrossCircledIcon className="w-6 h-6 text-destructive mt-0.5" />
          <p className="text-destructive font-medium text-lg">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Info Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
               📝 Grundinformationen
            </CardTitle>
            <CardDescription className="text-base mt-1">Основна информация</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Name" bg="Име" required />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-background h-12 text-lg"
                  placeholder="z.B. Rex"
                />
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Tier-Art" bg="Вид животно" required />
                <Select
                  value={formData.animal}
                  onValueChange={(value: 'Hund' | 'Katze') =>
                    handleInputChange('animal', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hund">Hund / Куче</SelectItem>
                    <SelectItem value="Katze">Katze / Котка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Geschlecht" bg="Пол" required />
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'weiblich' | 'männlich') =>
                    handleInputChange('gender', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weiblich">Weiblich / Женски</SelectItem>
                    <SelectItem value="männlich">Männlich / Мъжки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Rasse" bg="Порода" required />
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  required
                  className="bg-background h-12 text-lg"
                  placeholder="z.B. Mischling"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Geboren" bg="Рождена дата" />
                <DatePicker
                  value={formData.birthDate}
                  onChange={(value) => handleInputChange('birthDate', value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Größe (cm)" bg="Размер" />
                <Input
                  id="shoulderHeight"
                  type="number"
                  value={formData.shoulderHeight || ''}
                  onChange={(e) => handleInputChange('shoulderHeight', e.target.value)}
                  className="bg-background h-12 text-lg"
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Farbe" bg="Цвят" required />
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  required
                  className="bg-background h-12 text-lg"
                  placeholder="z.B. Schwarz-Braun"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Info Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
               ⚕️ Medizinische Informationen
            </CardTitle>
            <CardDescription className="text-base mt-1">Медицинска информация</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Kastriert" bg="Кастриран" required />
                <Select
                  value={formData.castrated}
                  onValueChange={(value: 'JA' | 'NEIN') =>
                    handleInputChange('castrated', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA / Да</SelectItem>
                    <SelectItem value="NEIN">NEIN / Не</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Geimpft" bg="Ваксиниран" required />
                <Select
                  value={formData.vaccinated}
                  onValueChange={(value: 'JA' | 'NEIN' | 'teilweise') =>
                    handleInputChange('vaccinated', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA / Да</SelectItem>
                    <SelectItem value="NEIN">NEIN / Не</SelectItem>
                    <SelectItem value="teilweise">Teilweise / Частично</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Gechipt" bg="Чипиран" required />
                <Select
                  value={formData.chipped}
                  onValueChange={(value: 'vollständig' | 'teilweise' | 'nein') =>
                    handleInputChange('chipped', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vollständig">Vollständig / Да</SelectItem>
                    <SelectItem value="teilweise">Teilweise / Частично</SelectItem>
                    <SelectItem value="nein">Nein / Не</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Gesundheit" bg="Здраве" required />
                <Select
                  value={formData.health}
                  onValueChange={(value: 'JA' | 'NEIN') =>
                    handleInputChange('health', value)
                  }
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">Gesund / Здрав</SelectItem>
                    <SelectItem value="NEIN">Probleme / Проблеми</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Blutgruppe" bg="Кръвна група" />
                <Input
                  id="bloodType"
                  value={formData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className="bg-background h-12 text-lg"
                />
              </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <BilingualLabel de="Krankheiten" bg="Болести" />
                  <Textarea
                    id="diseases"
                    value={formData.diseases || ''}
                    onChange={(e) => handleInputChange('diseases', e.target.value)}
                    rows={3}
                    className="bg-background resize-none text-lg"
                  />
               </div>
               <div className="space-y-2">
                  <BilingualLabel de="Handicap" bg="Увреждания" />
                  <Textarea
                    id="handicap"
                    value={formData.handicap || ''}
                    onChange={(e) => handleInputChange('handicap', e.target.value)}
                    rows={3}
                    className="bg-background resize-none text-lg"
                  />
               </div>
               <div className="space-y-2">
                  <BilingualLabel de="Gesundheitsnotizen" bg="Здравни бележки" />
                  <Textarea
                    id="healthText"
                    value={formData.healthText || ''}
                    onChange={(e) => handleInputChange('healthText', e.target.value)}
                    rows={3}
                    className="bg-background resize-none text-lg"
                  />
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
               🧠 Verhalten & Charakter
            </CardTitle>
            <CardDescription className="text-base mt-1">Поведение</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
              <BilingualLabel de="Wesen / Charakter" bg="Характер" required />
              <Textarea
                id="characteristics"
                placeholder="z.B. ruhig, verspielt, freundlich / напр. спокоен, игрив, дружелюбен"
                value={formData.characteristics}
                onChange={(e) => handleInputChange('characteristics', e.target.value)}
                rows={5}
                required
                className="bg-background text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Mit Hunden" bg="С кучета" required />
                <Select
                  value={formData.compatibleDogs}
                  onValueChange={(value) => handleInputChange('compatibleDogs', value)}
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA / Да</SelectItem>
                    <SelectItem value="NEIN">NEIN / Не</SelectItem>
                    <SelectItem value="kann getestet werden">Kann getestet werden / Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Mit Katzen" bg="С котки" required />
                <Select
                  value={formData.compatibleCats}
                  onValueChange={(value) => handleInputChange('compatibleCats', value)}
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA / Да</SelectItem>
                    <SelectItem value="NEIN">NEIN / Не</SelectItem>
                    <SelectItem value="kann getestet werden">Kann getestet werden / Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Mit Kindern" bg="С деца" required />
                <Select
                  value={formData.compatibleChildren}
                  onValueChange={(value) => handleInputChange('compatibleChildren', value)}
                >
                  <SelectTrigger className="bg-background h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JA">JA / Да</SelectItem>
                    <SelectItem value="NEIN">NEIN / Не</SelectItem>
                    <SelectItem value="kann getestet werden">Kann getestet werden / Може да се тества</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <BilingualLabel de="Zusätzliche Information" bg="Допълнителна информация" />
              <Textarea
                id="compatibilityText"
                value={formData.compatibilityText || ''}
                onChange={(e) => handleInputChange('compatibilityText', e.target.value)}
                rows={3}
                className="bg-background resize-none text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description & Location Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
               📍 Beschreibung & Standort
            </CardTitle>
            <CardDescription className="text-base mt-1">Описание и местоположение</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
              <BilingualLabel de="Kurzbeschreibung (2 Sätze)" bg="Кратко описание" required />
              <Textarea
                id="descShort"
                placeholder="Kurze Beschreibung des Tieres..."
                value={formData.descShort}
                onChange={(e) => handleInputChange('descShort', e.target.value)}
                rows={4}
                required
                className="bg-background text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <BilingualLabel de="Aufenthaltsort" bg="Местоположение" required />
                <Input
                  id="location"
                  placeholder="z.B. Tierheim Razgrad"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  className="bg-background h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <BilingualLabel de="Sucht Zuhause seit (Jahr)" bg="Търси дом от" />
                <Input
                  id="seekingHomeSince"
                  placeholder="2023"
                  value={formData.seekingHomeSince || ''}
                  onChange={(e) => handleInputChange('seekingHomeSince', e.target.value)}
                  className="bg-background h-12 text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <BilingualLabel de="Video Link" bg="Видео линк" />
                  <Input
                    id="videoLink"
                    type="url"
                    placeholder="https://..."
                    value={formData.videoLink || ''}
                    onChange={(e) => handleInputChange('videoLink', e.target.value)}
                    className="bg-background h-12 text-lg"
                  />
               </div>
               <div className="space-y-2">
                  <BilingualLabel de="Web Link" bg="Уеб линк" />
                  <Input
                    id="webLink"
                    type="url"
                    placeholder="https://..."
                    value={formData.webLink || ''}
                    onChange={(e) => handleInputChange('webLink', e.target.value)}
                    className="bg-background h-12 text-lg"
                  />
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Section */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
               📸 Medien
            </CardTitle>
            <CardDescription className="text-base mt-1">Медии</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Bilder-Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <BilingualLabel de="Bilder hochladen" bg="Качете снимки" required />
                <span className="text-xs text-muted-foreground">Max. 10 MB pro Bild</span>
              </div>
              <div className="flex items-center gap-6">
                 <Input
                    id="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-14 pt-2 text-lg"
                  />
                  {uploadingImages && <ReloadIcon className="w-6 h-6 animate-spin text-primary" />}
              </div>
              
              {uploadedImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircledIcon className="w-6 h-6" />
                    <span className="text-base font-medium">{uploadedImages.length} Bilder erfolgreich hochgeladen / Снимки качени</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm"
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
              ) : (
                 <div className="text-base text-muted-foreground/70 italic">
                    Noch keine Bilder hochgeladen.
                 </div>
              )}
            </div>

            {/* Video-Upload */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <BilingualLabel de="Videos hochladen (optional)" bg="Качете видеа (опционално)" />
                <span className="text-xs text-muted-foreground">Max. 100 MB pro Video</span>
              </div>
              <div className="flex items-center gap-6">
                <Input
                  id="videos"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  multiple
                  onChange={handleVideoUpload}
                  disabled={uploadingVideos}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-14 pt-2 text-lg"
                />
                {uploadingVideos && <ReloadIcon className="w-6 h-6 animate-spin text-primary" />}
              </div>
              {uploadedVideos.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircledIcon className="w-6 h-6" />
                    <span className="text-base font-medium">{uploadedVideos.length} Videos erfolgreich hochgeladen / Видеа качени</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedVideos.map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm"
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
              ) : (
                <div className="text-base text-muted-foreground/70 italic">
                  Noch keine Videos hochgeladen.
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Erlaubte Formate: MP4, WebM, MOV, AVI
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-6 pt-8 sticky bottom-6 z-10">
          <div className="bg-card/95 p-4 rounded-xl border border-border shadow-xl backdrop-blur-md flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="text-muted-foreground h-12 px-6 text-lg"
            >
              Abbrechen / Отказ
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploadingImages || uploadingVideos}
              className="bg-accent hover:bg-accent/90 text-white dark:text-background h-12 px-8 text-lg min-w-[240px]"
            >
              {loading ? (
                 <>
                   <ReloadIcon className="mr-3 h-5 w-5 animate-spin" /> 
                   Senden... / Изпращане...
                 </>
              ) : (
                 'Profil erstellen / Създаване'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
