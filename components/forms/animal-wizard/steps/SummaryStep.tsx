'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SummaryStepProps } from '../types';

interface SummaryItemProps {
  label: string;
  value: string | undefined;
  required?: boolean;
}

function SummaryItem({ label, value, required }: SummaryItemProps) {
  const isEmpty = !value || value.trim() === '';
  
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
      {isEmpty ? (
        <span className="text-sm text-muted-foreground/50 italic">—</span>
      ) : (
        <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{value}</span>
      )}
    </div>
  );
}

export function SummaryStep({ formData, uploadedImages, uploadedVideos }: SummaryStepProps) {
  // Validation checks
  const validations = {
    name: !!formData.name,
    breed: !!formData.breed,
    color: !!formData.color,
    characteristics: !!formData.characteristics && formData.characteristics.length >= 10,
    descShort: !!formData.descShort && formData.descShort.length >= 20,
    location: !!formData.location,
    images: uploadedImages.length > 0,
  };

  const allValid = Object.values(validations).every(Boolean);

  const getCompatibilityLabel = (value: string) => {
    switch (value) {
      case 'JA': return '✅ Да / JA';
      case 'NEIN': return '❌ Не / NEIN';
      case 'kann getestet werden': return '🔍 Може да се тества';
      default: return value;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Zusammenfassung prüfen
        </h2>
        <p className="text-muted-foreground mt-2">
          Преглед на въведените данни
        </p>
      </div>

      {/* Validation Status */}
      <Card className={`border-2 ${allValid ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{allValid ? '🎉' : '⚠️'}</span>
            <div>
              <p className={`font-semibold ${allValid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {allValid ? 'Всичко е готово! / Alles bereit!' : 'Някои полета липсват / Einige Felder fehlen'}
              </p>
              <p className="text-sm text-muted-foreground">
                {allValid 
                  ? 'Профилът е готов за създаване' 
                  : 'Моля, попълнете всички задължителни полета'
                }
              </p>
            </div>
          </div>
          
          {!allValid && (
            <div className="mt-4 flex flex-wrap gap-2">
              {!validations.name && <Badge variant="destructive">Име / Name</Badge>}
              {!validations.breed && <Badge variant="destructive">Порода / Rasse</Badge>}
              {!validations.color && <Badge variant="destructive">Цвят / Farbe</Badge>}
              {!validations.characteristics && <Badge variant="destructive">Характер / Wesen</Badge>}
              {!validations.descShort && <Badge variant="destructive">Описание / Beschreibung</Badge>}
              {!validations.location && <Badge variant="destructive">Местоположение / Standort</Badge>}
              {!validations.images && <Badge variant="destructive">Снимки / Bilder</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Info Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>🐾</span>
            <span>Grundinformationen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryItem label="Име / Name" value={formData.name} required />
          <SummaryItem label="Вид / Art" value={formData.animal === 'Hund' ? '🐕 Куче / Hund' : '🐈 Котка / Katze'} required />
          <SummaryItem label="Пол / Geschlecht" value={formData.gender === 'weiblich' ? '♀️ Женски' : '♂️ Мъжки'} required />
          <SummaryItem label="Порода / Rasse" value={formData.breed} required />
          <SummaryItem label="Рождена дата / Geboren" value={formData.birthDate} />
          <SummaryItem label="Размер / Größe" value={formData.shoulderHeight ? `${formData.shoulderHeight} cm` : undefined} />
          <SummaryItem label="Цвят / Farbe" value={formData.color} required />
        </CardContent>
      </Card>

      {/* Medical Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>💉</span>
            <span>Medizinische Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryItem label="Кастриран / Kastriert" value={formData.castrated === 'JA' ? '✅ Да' : '❌ Не'} />
          <SummaryItem 
            label="Ваксиниран / Geimpft" 
            value={formData.vaccinated === 'JA' ? '✅ Да' : formData.vaccinated === 'NEIN' ? '❌ Не' : '🔄 Частично'} 
          />
          <SummaryItem 
            label="Чипиран / Gechipt" 
            value={formData.chipped === 'vollständig' ? '✅ Да' : formData.chipped === 'nein' ? '❌ Не' : '🔄 Частично'} 
          />
          <SummaryItem label="Здраве / Gesundheit" value={formData.health === 'JA' ? '💚 Здрав' : '🩹 Проблеми'} />
          <SummaryItem label="Болести / Krankheiten" value={formData.diseases} />
          <SummaryItem label="Увреждания / Handicap" value={formData.handicap} />
        </CardContent>
      </Card>

      {/* Behavior Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>🧡</span>
            <span>Verhalten</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryItem label="Характер / Wesen" value={formData.characteristics} required />
          <SummaryItem label="С кучета / Mit Hunden" value={getCompatibilityLabel(formData.compatibleDogs)} />
          <SummaryItem label="С котки / Mit Katzen" value={getCompatibilityLabel(formData.compatibleCats)} />
          <SummaryItem label="С деца / Mit Kindern" value={getCompatibilityLabel(formData.compatibleChildren)} />
        </CardContent>
      </Card>

      {/* Description & Location Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>📝</span>
            <span>Beschreibung & Standort</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground block mb-1">
              Описание / Beschreibung <span className="text-destructive">*</span>
            </span>
            {formData.descShort ? (
              <p className="text-sm text-foreground">{formData.descShort}</p>
            ) : (
              <span className="text-sm text-muted-foreground/50 italic">—</span>
            )}
          </div>
          <SummaryItem label="Местоположение / Standort" value={formData.location} required />
          <SummaryItem label="Търси дом от / Sucht Zuhause seit" value={formData.seekingHomeSince} />
        </CardContent>
      </Card>

      {/* Media Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>📷</span>
            <span>Medien</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              Снимки / Bilder <span className="text-destructive">*</span>
            </span>
            <Badge variant={uploadedImages.length > 0 ? 'default' : 'destructive'}>
              {uploadedImages.length} {uploadedImages.length === 1 ? 'снимка' : 'снимки'}
            </Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Видеа / Videos</span>
            <Badge variant="secondary">
              {uploadedVideos.length} {uploadedVideos.length === 1 ? 'видео' : 'видеа'}
            </Badge>
          </div>
          <SummaryItem label="Видео линк / Video-Link" value={formData.videoLink} />
          <SummaryItem label="Уеб линк / Web-Link" value={formData.webLink} />
        </CardContent>
      </Card>

      {/* Final confirmation */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-xl">📋</span>
        <div>
          <p className="text-sm font-medium text-foreground">
            Готови ли сте? / Sind Sie bereit?
          </p>
          <p className="text-sm text-muted-foreground">
            След създаването профилът ще бъде автоматично валидиран и преведен.
            Nach der Erstellung wird das Profil automatisch validiert und übersetzt.
          </p>
        </div>
      </div>
    </div>
  );
}

