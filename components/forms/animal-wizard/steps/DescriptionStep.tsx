'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StepProps } from '../types';

export function DescriptionStep({ formData, onUpdate, errors }: StepProps) {
  const descriptionLength = formData.descShort?.length || 0;
  const minLength = 20;
  const isDescriptionValid = descriptionLength >= minLength;

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Beschreibung & Standort
        </h2>
        <p className="text-muted-foreground mt-2">
          Описание и местоположение
        </p>
      </div>

      {/* Description */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>✍️</span>
            <span>Кратко описание / Kurzbeschreibung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="descShort" className="text-base">
              Описание (на български) <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descShort"
              value={formData.descShort}
              onChange={(e) => onUpdate('descShort', e.target.value)}
              placeholder="Напишете кратко описание на животното на български език. Това ще бъде автоматично преведено на немски..."
              rows={5}
              className={`resize-none ${errors?.descShort ? 'border-destructive' : ''}`}
            />
            
            {/* Character counter */}
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDescriptionValid ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
                {isDescriptionValid ? (
                  <span className="flex items-center gap-1">
                    ✅ Минимална дължина достигната
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    ⚠️ Минимум {minLength} символа ({minLength - descriptionLength} още)
                  </span>
                )}
              </p>
              <span className={`text-sm font-mono ${isDescriptionValid ? 'text-muted-foreground' : 'text-amber-600'}`}>
                {descriptionLength} / {minLength}+
              </span>
            </div>
            
            {errors?.descShort && (
              <p className="text-sm text-destructive">{errors.descShort}</p>
            )}
          </div>
          
          {/* Translation info */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span>🌐</span>
              <span>Текстът ще бъде автоматично преведен на немски / Der Text wird automatisch ins Deutsche übersetzt</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📍</span>
            <span>Местоположение / Standort</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base">
                Местоположение / Aufenthaltsort <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onUpdate('location', e.target.value)}
                placeholder="напр. в приют Разград"
                className={errors?.location ? 'border-destructive' : ''}
              />
              {errors?.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seekingHomeSince" className="text-base">
                Търси дом от / Sucht Zuhause seit
              </Label>
              <Input
                id="seekingHomeSince"
                value={formData.seekingHomeSince || ''}
                onChange={(e) => onUpdate('seekingHomeSince', e.target.value)}
                placeholder="напр. 2023"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Въведете годината / Jahr eingeben (z.B. 2023)
              </p>
            </div>
          </div>

          {/* Web Link */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label htmlFor="webLink" className="text-base flex items-center gap-2">
              <span>🔗</span>
              <span>Уеб линк / Web Link</span>
            </Label>
            <Input
              id="webLink"
              type="url"
              value={formData.webLink || ''}
              onChange={(e) => onUpdate('webLink', e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Линк към допълнителна информация / Link zu weiteren Informationen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Writing tips */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
        <span className="text-xl">📖</span>
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Съвети за описанието / Tipps für die Beschreibung
          </p>
          <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
            <li>• Опишете какво прави животното специално</li>
            <li>• Споменете любими дейности или играчки</li>
            <li>• Beschreiben Sie, was das Tier besonders macht</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

