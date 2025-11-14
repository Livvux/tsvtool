'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dynamicImport from 'next/dynamic';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { logger } from '@/lib/logger';
import type { Id } from '@/convex/_generated/dataModel';

// Dynamically import DistributionStatus to reduce initial bundle size
const DistributionStatus = dynamicImport(
  () => import('@/components/animal/DistributionStatus').then((mod) => ({ default: mod.DistributionStatus })),
  {
    loading: () => <div className="text-sm text-textPrimary">Lade Verteilungsstatus...</div>,
    ssr: false,
  }
);

// Route segment config for caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const animalId = params.id as Id<'animals'>;
  
  const animal = useQuery(api.animals.get, { id: animalId });
  const updateAnimal = useMutation(api.animals.update);
  const updateStatus = useMutation(api.animals.updateStatus);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!animal) {
    return <LoadingSpinner />;
  }

  const handleUpdate = async (field: string, value: string | undefined) => {
    try {
      setError('');
      await updateAnimal({
        id: animalId,
        [field]: value,
      });
    } catch (err) {
      logger.error('Error updating animal', err instanceof Error ? err : new Error(String(err)), { animalId, field });
      setError('Fehler beim Aktualisieren');
    }
  };

  const handleStatusChange = async (newStatus: 'ABGELEHNT' | 'AKZEPTIERT' | 'FINALISIERT') => {
    setLoading(true);
    setError('');

    try {
      await updateStatus({
        id: animalId,
        status: newStatus,
      });
      if (newStatus === 'FINALISIERT') {
        router.push('/dashboard/animals');
      }
    } catch (err) {
      logger.error('Error updating status', err instanceof Error ? err : new Error(String(err)), { animalId, newStatus });
      setError('Fehler beim Status-Update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Tierprofil bearbeiten</h1>
          <p className="text-textPrimary mt-2">{animal.name}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Zurück
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label>Aktueller Status</Label>
              <p className="text-sm font-medium">{animal.status}</p>
            </div>
            {animal.status === 'ENTWURF' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('ABGELEHNT')}
                  disabled={loading}
                >
                  Ablehnen
                </Button>
                <Button
                  onClick={() => handleStatusChange('AKZEPTIERT')}
                  disabled={loading}
                >
                  Akzeptieren
                </Button>
              </div>
            )}
            {animal.status === 'AKZEPTIERT' && (
              <Button
                onClick={() => handleStatusChange('FINALISIERT')}
                disabled={loading}
              >
                {loading ? 'Finalisierung...' : 'Finalisieren'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={animal.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Art</Label>
              <p className="text-sm">{animal.animal}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Rasse</Label>
              <Input
                id="breed"
                value={animal.breed}
                onChange={(e) => handleUpdate('breed', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Geschlecht</Label>
              <p className="text-sm">{animal.gender}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={animal.location}
                onChange={(e) => handleUpdate('location', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seekingHomeSince">Suche Zuhause seit</Label>
              <Input
                id="seekingHomeSince"
                value={animal.seekingHomeSince || ''}
                onChange={(e) => handleUpdate('seekingHomeSince', e.target.value || undefined)}
                placeholder="z.B. 01.2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beschreibung (Übersetzt)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descLong">Lange Beschreibung (Deutsch)</Label>
            <Textarea
              id="descLong"
              value={animal.descLong || ''}
              onChange={(e) => handleUpdate('descLong', e.target.value)}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Original (Bulgarisch)</Label>
            <p className="text-sm text-textPrimary whitespace-pre-wrap">
              {animal.descShortBG}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charaktereigenschaften</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="characteristics">Wesen (Übersetzt)</Label>
            <Textarea
              id="characteristics"
              value={animal.characteristics || ''}
              onChange={(e) => handleUpdate('characteristics', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medizinische Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="castrated">Kastriert</Label>
              <Select
                value={animal.castrated}
                onValueChange={(value) => handleUpdate('castrated', value)}
              >
                <SelectTrigger id="castrated">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">JA</SelectItem>
                  <SelectItem value="NEIN">NEIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccinated">Geimpft</Label>
              <Select
                value={animal.vaccinated}
                onValueChange={(value) => handleUpdate('vaccinated', value)}
              >
                <SelectTrigger id="vaccinated">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">JA</SelectItem>
                  <SelectItem value="NEIN">NEIN</SelectItem>
                  <SelectItem value="teilweise">teilweise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chipped">Gechipt</Label>
              <Select
                value={animal.chipped}
                onValueChange={(value) => handleUpdate('chipped', value)}
              >
                <SelectTrigger id="chipped">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vollständig">vollständig</SelectItem>
                  <SelectItem value="teilweise">teilweise</SelectItem>
                  <SelectItem value="nein">nein</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="healthText">Gesundheitsinformationen</Label>
            <Textarea
              id="healthText"
              value={animal.healthText || ''}
              onChange={(e) => handleUpdate('healthText', e.target.value || undefined)}
              rows={3}
              placeholder="Zusätzliche Gesundheitsinformationen..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diseases">Krankheiten</Label>
            <Textarea
              id="diseases"
              value={animal.diseases || ''}
              onChange={(e) => handleUpdate('diseases', e.target.value || undefined)}
              rows={2}
              placeholder="Bekannte Krankheiten..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handicap">Behinderung</Label>
            <Textarea
              id="handicap"
              value={animal.handicap || ''}
              onChange={(e) => handleUpdate('handicap', e.target.value || undefined)}
              rows={2}
              placeholder="Behinderungen oder Einschränkungen..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verträglichkeit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compatibleDogs">Mit Hunden</Label>
              <Select
                value={animal.compatibleDogs}
                onValueChange={(value) => handleUpdate('compatibleDogs', value)}
              >
                <SelectTrigger id="compatibleDogs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">JA</SelectItem>
                  <SelectItem value="NEIN">NEIN</SelectItem>
                  <SelectItem value="kann getestet werden">kann getestet werden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compatibleCats">Mit Katzen</Label>
              <Select
                value={animal.compatibleCats}
                onValueChange={(value) => handleUpdate('compatibleCats', value)}
              >
                <SelectTrigger id="compatibleCats">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">JA</SelectItem>
                  <SelectItem value="NEIN">NEIN</SelectItem>
                  <SelectItem value="kann getestet werden">kann getestet werden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compatibleChildren">Mit Kindern</Label>
              <Select
                value={animal.compatibleChildren}
                onValueChange={(value) => handleUpdate('compatibleChildren', value)}
              >
                <SelectTrigger id="compatibleChildren">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">JA</SelectItem>
                  <SelectItem value="NEIN">NEIN</SelectItem>
                  <SelectItem value="kann getestet werden">kann getestet werden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="compatibilityText">Verträglichkeitsbeschreibung</Label>
            <Textarea
              id="compatibilityText"
              value={animal.compatibilityText || ''}
              onChange={(e) => handleUpdate('compatibilityText', e.target.value || undefined)}
              rows={3}
              placeholder="Zusätzliche Informationen zur Verträglichkeit..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoLink">Video-Link</Label>
            <Input
              id="videoLink"
              type="url"
              value={animal.videoLink || ''}
              onChange={(e) => handleUpdate('videoLink', e.target.value || undefined)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webLink">Web-Link</Label>
            <Input
              id="webLink"
              type="url"
              value={animal.webLink || ''}
              onChange={(e) => handleUpdate('webLink', e.target.value || undefined)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bilder</CardTitle>
        </CardHeader>
        <CardContent>
          {animal.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {animal.gallery.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${animal.name} - Bild ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-textPrimary">
              Keine Bilder hochgeladen
            </p>
          )}
        </CardContent>
      </Card>

      {animal.status === 'FINALISIERT' && (
        <DistributionStatus animal={animal} />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

