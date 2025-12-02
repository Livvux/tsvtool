'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  PenLine, 
  MapPin, 
  Link as LinkIcon, 
  Globe,
  Check,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import type { StepProps } from '../types';

export function DescriptionStep({ formData, onUpdate, errors }: StepProps) {
  const descriptionLength = formData.descShort?.length || 0;
  const minLength = 20;
  const isDescriptionValid = descriptionLength >= minLength;

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="w-8 h-8 text-primary" />
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
            <PenLine className="w-5 h-5 text-primary" />
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
              <p className={`text-sm flex items-center gap-1.5 ${isDescriptionValid ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
                {isDescriptionValid ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Минимална дължина достигната</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Минимум {minLength} символа ({minLength - descriptionLength} още)</span>
                  </>
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
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Текстът ще бъде автоматично преведен на немски / Der Text wird automatisch ins Deutsche übersetzt</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Местоположение / Standort</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
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

            <div className="space-y-2 flex flex-col h-full">
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
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
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
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <BookOpen className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Съвети за описанието / Tipps für die Beschreibung
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Опишете какво прави животното специално
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Споменете любими дейности или играчки
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Beschreiben Sie, was das Tier besonders macht
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
