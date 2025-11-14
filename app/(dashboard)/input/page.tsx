'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateDateFormat, validateRequired } from '@/lib/validation';
import { logger } from '@/lib/logger';
import type { AnimalFormData } from '@/types/animal';

// Route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function InputPage() {
  const createAnimal = useMutation(api.animals.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof AnimalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...storageIds]);
    } catch (err) {
      logger.error('Error uploading images', err instanceof Error ? err : new Error(String(err)), { action: 'handleImageUpload' });
      setError('Fehler beim Hochladen der Bilder');
    }
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
      alert('Tierprofil erfolgreich erstellt!');
    } catch (err) {
      logger.error('Error creating animal', err instanceof Error ? err : new Error(String(err)), { action: 'handleSubmit' });
      setError('Fehler beim Erstellen des Tierprofils');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Neues Tier hinzufügen</h1>
        <p className="text-textPrimary mt-2">
          Erstellen Sie ein neues Tierprofil (Bulgarisch)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen / Основна информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Име / Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="breed">Порода / Rasse *</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Рождена дата / Geboren (TT.MM.JJJJ)</Label>
                <Input
                  id="birthDate"
                  placeholder="01.01.2020"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoulderHeight">Размер / Größe (cm)</Label>
                <Input
                  id="shoulderHeight"
                  type="number"
                  value={formData.shoulderHeight || ''}
                  onChange={(e) => handleInputChange('shoulderHeight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Медицинска информация / Medizinische Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="bloodType">Кръвна група / Blutgruppe</Label>
                <Input
                  id="bloodType"
                  value={formData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diseases">Болести / Krankheiten</Label>
              <Textarea
                id="diseases"
                value={formData.diseases || ''}
                onChange={(e) => handleInputChange('diseases', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handicap">Увреждания / Handicap</Label>
              <Textarea
                id="handicap"
                value={formData.handicap || ''}
                onChange={(e) => handleInputChange('handicap', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Поведение / Verhalten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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

            <div className="space-y-2">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Описание и местоположение / Beschreibung & Standort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Местоположение / Aufenthaltsort *</Label>
                <Input
                  id="location"
                  placeholder="напр. в приют Разград"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seekingHomeSince">Търси дом от / Sucht Zuhause seit (Jahr)</Label>
                <Input
                  id="seekingHomeSince"
                  placeholder="2023"
                  value={formData.seekingHomeSince || ''}
                  onChange={(e) => handleInputChange('seekingHomeSince', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoLink">Видео линк / Video Link</Label>
              <Input
                id="videoLink"
                type="url"
                placeholder="https://..."
                value={formData.videoLink || ''}
                onChange={(e) => handleInputChange('videoLink', e.target.value)}
              />
            </div>

            <div className="space-y-2">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Снимки / Bilder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="images">Качете снимки / Bilder hochladen</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              {uploadedImages.length > 0 && (
                <p className="text-sm text-textPrimary">
                  {uploadedImages.length} Снимки качени / Bilder hochgeladen
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
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

