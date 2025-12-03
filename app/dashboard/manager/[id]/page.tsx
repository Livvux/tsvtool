'use client';

import { useState } from 'react';
import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import nextDynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { logger } from '@/lib/logger';
import type { Id } from '@/convex/_generated/dataModel';
import { 
  Pencil2Icon, 
  ChevronLeftIcon, 
  CheckCircledIcon, 
  CrossCircledIcon,
  ImageIcon,
  VideoIcon,
  Link2Icon,
  HeartFilledIcon
} from '@radix-ui/react-icons';
import { getR2PublicUrls } from '@/lib/storage';
import { getStatusColor } from '@/lib/animal-helpers';
import { sanitizeText } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

// Dynamically import DistributionStatus to reduce initial bundle size
const DistributionStatus = nextDynamic(
  () => import('@/components/animal/DistributionStatus').then((mod) => mod.DistributionStatus),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const animalId = params.id as Id<'animals'>;
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  const animal = useQuery(
    api.animals.get,
    isAuthenticated ? { id: animalId } : 'skip'
  );
  const updateAnimal = useMutation(api.animals.update);
  const updateStatus = useMutation(api.animals.updateStatus);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading || animal === undefined) {
    return <LoadingSpinner />;
  }

  if (!animal) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-muted-foreground text-lg">Tierprofil nicht gefunden.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/animals')} className="mt-4">
          Zurück zur Übersicht
        </Button>
      </div>
    );
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
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" onClick={() => router.back()}>
               <ChevronLeftIcon className="w-5 h-5 text-muted-foreground" />
             </Button>
             <Badge className={cn("font-medium text-sm px-3 py-1", getStatusColor(animal.status))}>
                {animal.status}
             </Badge>
           </div>
           <h1 className="text-4xl font-bold text-accent tracking-tight mb-1">{sanitizeText(animal.name)}</h1>
           <p className="text-xl text-muted-foreground">
             {sanitizeText(animal.breed)} • {sanitizeText(animal.gender)} • {sanitizeText(animal.location)}
           </p>
        </div>
        <div className="flex gap-4">
           {animal.status === 'ENTWURF' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('ABGELEHNT')}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900 h-12 px-6 text-lg"
                >
                  Ablehnen
                </Button>
                <Button
                  onClick={() => handleStatusChange('AKZEPTIERT')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white h-12 px-6 text-lg"
                >
                  <CheckCircledIcon className="mr-2 w-5 h-5" />
                  Akzeptieren
                </Button>
              </>
            )}
            {animal.status === 'AKZEPTIERT' && (
              <Button
                onClick={() => handleStatusChange('FINALISIERT')}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 h-12 px-8 text-lg"
              >
                {loading ? 'Wird finalisiert...' : (
                  <>
                    <CheckCircledIcon className="mr-2 w-5 h-5" />
                    Finalisieren & Veröffentlichen
                  </>
                )}
              </Button>
            )}
        </div>
      </div>

      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
          <CrossCircledIcon className="w-6 h-6 text-destructive mt-0.5" />
          <p className="text-destructive font-medium text-lg">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Description */}
          <Card className="shadow-md border-t-4 border-t-primary">
             <CardHeader className="p-8 border-b border-border bg-muted/30">
               <CardTitle className="flex items-center gap-3 text-2xl text-accent">
                 <Pencil2Icon className="w-6 h-6 text-primary" />
                 Beschreibung
               </CardTitle>
               <CardDescription className="text-base mt-1">Deutsch</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="descLong" className="text-foreground font-semibold text-lg">Lange Beschreibung (Deutsch)</Label>
                  <Textarea
                    id="descLong"
                    value={animal.descLong || ''}
                    onChange={(e) => handleUpdate('descLong', e.target.value)}
                    rows={10}
                    className="bg-background leading-relaxed text-lg p-4"
                  />
                </div>
             </CardContent>
          </Card>

          {/* Characteristics */}
          <Card className="shadow-md">
            <CardHeader className="p-8 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-2xl text-accent">
                 <HeartFilledIcon className="w-6 h-6 text-primary" />
                 Charakter & Wesen
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               {/* Bulgarian Original */}
               {animal.characteristicsBG && (
                 <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                   <Label className="text-sm font-medium text-muted-foreground">Original (Bulgarisch)</Label>
                   <p className="text-base text-foreground/80 whitespace-pre-wrap italic leading-relaxed">
                     {sanitizeText(animal.characteristicsBG)}
                   </p>
                 </div>
               )}
               <div className="space-y-3">
                  <Label htmlFor="characteristics" className="text-lg font-semibold text-foreground">Wesen (Übersetzt)</Label>
                  <Textarea
                    id="characteristics"
                    value={animal.characteristics || ''}
                    onChange={(e) => handleUpdate('characteristics', e.target.value)}
                    rows={6}
                    className="bg-background text-lg p-4"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Compatibility Selects */}
                  <div className="space-y-3">
                    <Label htmlFor="compatibleDogs" className="text-base font-medium text-muted-foreground">Mit Hunden</Label>
                    <Select
                      value={animal.compatibleDogs}
                      onValueChange={(value) => handleUpdate('compatibleDogs', value)}
                    >
                      <SelectTrigger id="compatibleDogs" className="bg-background h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JA">JA</SelectItem>
                        <SelectItem value="NEIN">NEIN</SelectItem>
                        <SelectItem value="kann getestet werden">Testen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="compatibleCats" className="text-base font-medium text-muted-foreground">Mit Katzen</Label>
                    <Select
                      value={animal.compatibleCats}
                      onValueChange={(value) => handleUpdate('compatibleCats', value)}
                    >
                      <SelectTrigger id="compatibleCats" className="bg-background h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JA">JA</SelectItem>
                        <SelectItem value="NEIN">NEIN</SelectItem>
                        <SelectItem value="kann getestet werden">Testen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="compatibleChildren" className="text-base font-medium text-muted-foreground">Mit Kindern</Label>
                    <Select
                      value={animal.compatibleChildren}
                      onValueChange={(value) => handleUpdate('compatibleChildren', value)}
                    >
                      <SelectTrigger id="compatibleChildren" className="bg-background h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JA">JA</SelectItem>
                        <SelectItem value="NEIN">NEIN</SelectItem>
                        <SelectItem value="kann getestet werden">Testen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-3">
                 <Label htmlFor="compatibilityText" className="text-lg font-semibold text-foreground">Zusätzliche Info zur Verträglichkeit</Label>
                 <Textarea
                    id="compatibilityText"
                    value={animal.compatibilityText || ''}
                    onChange={(e) => handleUpdate('compatibilityText', e.target.value || undefined)}
                    rows={3}
                    className="bg-background text-lg p-4"
                 />
               </div>
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card className="shadow-md">
            <CardHeader className="p-8 border-b border-border">
              <CardTitle className="text-2xl text-accent">Medizinische Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="castrated" className="text-base font-medium text-muted-foreground">Kastriert</Label>
                  <Select
                    value={animal.castrated}
                    onValueChange={(value) => handleUpdate('castrated', value)}
                  >
                    <SelectTrigger id="castrated" className="bg-background h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JA">JA</SelectItem>
                      <SelectItem value="NEIN">NEIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="vaccinated" className="text-base font-medium text-muted-foreground">Geimpft</Label>
                  <Select
                    value={animal.vaccinated}
                    onValueChange={(value) => handleUpdate('vaccinated', value)}
                  >
                    <SelectTrigger id="vaccinated" className="bg-background h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JA">JA</SelectItem>
                      <SelectItem value="NEIN">NEIN</SelectItem>
                      <SelectItem value="teilweise">Teilweise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="chipped" className="text-base font-medium text-muted-foreground">Gechipt</Label>
                  <Select
                    value={animal.chipped}
                    onValueChange={(value) => handleUpdate('chipped', value)}
                  >
                    <SelectTrigger id="chipped" className="bg-background h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vollständig">Vollständig</SelectItem>
                      <SelectItem value="teilweise">Teilweise</SelectItem>
                      <SelectItem value="nein">Nein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label htmlFor="healthText" className="text-lg font-semibold text-foreground">Gesundheitsinfo</Label>
                    <Textarea
                      id="healthText"
                      value={animal.healthText || ''}
                      onChange={(e) => handleUpdate('healthText', e.target.value || undefined)}
                      rows={3}
                      className="bg-background text-lg p-4"
                      placeholder="Keine Besonderheiten"
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="diseases" className="text-lg font-semibold text-foreground">Krankheiten</Label>
                        <Input
                          id="diseases"
                          value={animal.diseases || ''}
                          onChange={(e) => handleUpdate('diseases', e.target.value || undefined)}
                          className="bg-background h-12 text-lg"
                          placeholder="-"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="handicap" className="text-lg font-semibold text-foreground">Behinderung</Label>
                        <Input
                          id="handicap"
                          value={animal.handicap || ''}
                          onChange={(e) => handleUpdate('handicap', e.target.value || undefined)}
                          className="bg-background h-12 text-lg"
                          placeholder="-"
                        />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-10">
          {/* Basic Details */}
          <Card className="shadow-md">
             <CardHeader className="p-6 border-b border-border bg-muted/30">
                <CardTitle className="text-xl text-accent">Details</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-medium text-muted-foreground">Name</Label>
                  <Input
                    id="name"
                    value={animal.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    className="bg-background font-medium h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="breed" className="text-base font-medium text-muted-foreground">Rasse</Label>
                  <Input
                    id="breed"
                    value={animal.breed}
                    onChange={(e) => handleUpdate('breed', e.target.value)}
                    className="bg-background h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base font-medium text-muted-foreground">Ort</Label>
                  <Input
                    id="location"
                    value={animal.location}
                    onChange={(e) => handleUpdate('location', e.target.value)}
                    className="bg-background h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="seekingHomeSince" className="text-base font-medium text-muted-foreground">Suche Zuhause seit</Label>
                  <Input
                    id="seekingHomeSince"
                    value={animal.seekingHomeSince || ''}
                    onChange={(e) => handleUpdate('seekingHomeSince', e.target.value || undefined)}
                    className="bg-background h-12 text-lg"
                  />
                </div>
             </CardContent>
          </Card>

          {/* Links */}
           <Card className="shadow-md">
             <CardHeader className="p-6 border-b border-border bg-muted/30">
                <CardTitle className="flex items-center gap-3 text-xl text-accent">
                   <Link2Icon className="w-5 h-5 text-primary" />
                   Links
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="videoLink" className="text-base font-medium text-muted-foreground">Video</Label>
                  <Input
                    id="videoLink"
                    type="url"
                    value={animal.videoLink || ''}
                    onChange={(e) => handleUpdate('videoLink', e.target.value || undefined)}
                    className="bg-background h-12 text-base"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="webLink" className="text-base font-medium text-muted-foreground">Web</Label>
                  <Input
                    id="webLink"
                    type="url"
                    value={animal.webLink || ''}
                    onChange={(e) => handleUpdate('webLink', e.target.value || undefined)}
                    className="bg-background h-12 text-base"
                    placeholder="https://..."
                  />
                </div>
             </CardContent>
          </Card>

          {/* Images Preview */}
           <Card className="shadow-md">
             <CardHeader className="p-6 border-b border-border bg-muted/30">
                <CardTitle className="flex items-center gap-3 text-xl text-accent">
                   <ImageIcon className="w-5 h-5 text-primary" />
                   Galerie ({animal.gallery?.length || 0})
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
               {animal.gallery && animal.gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {getR2PublicUrls(animal.gallery).map((url, index) => (
                    url ? (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group shadow-sm">
                        <img
                          src={url}
                          alt={`Bild ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    ) : null
                  ))}
                </div>
               ) : (
                 <div className="text-center py-10 bg-muted rounded-xl border border-dashed border-border">
                    <p className="text-base text-muted-foreground">Keine Bilder</p>
                 </div>
               )}
             </CardContent>
          </Card>

          {/* Videos Preview */}
          <Card className="shadow-md">
            <CardHeader className="p-6 border-b border-border bg-blue-50/50 dark:bg-gray-900/50">
              <CardTitle className="flex items-center gap-3 text-xl text-accent">
                <VideoIcon className="w-5 h-5 text-blue-500 dark:text-gray-400" />
                Videos ({animal.videos?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {animal.videos && animal.videos.length > 0 ? (
                <div className="space-y-4">
                  {getR2PublicUrls(animal.videos).map((url, index) => (
                    url ? (
                      <div key={index} className="rounded-lg overflow-hidden border border-border shadow-sm bg-black">
                        <video
                          src={url}
                          controls
                          preload="metadata"
                          className="w-full max-h-48 object-contain"
                        >
                          Ihr Browser unterstützt das Video-Tag nicht.
                        </video>
                      </div>
                    ) : null
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted rounded-xl border border-dashed border-border">
                  <p className="text-base text-muted-foreground">Keine Videos hochgeladen</p>
                  {animal.videoLink && (
                    <a
                      href={animal.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      → Externes Video ansehen
                    </a>
                  )}
                </div>
              )}
              {animal.videoLink && animal.videos && animal.videos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Externer Link:</p>
                  <a
                    href={animal.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {animal.videoLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution Status (Only visible when FINALISIERT) */}
          {animal.status === 'FINALISIERT' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <DistributionStatus animal={animal} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
