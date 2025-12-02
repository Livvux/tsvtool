'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Sparkles, 
  Handshake, 
  Dog, 
  Cat, 
  Baby,
  Check,
  X,
  Search,
  Star
} from 'lucide-react';
import type { StepProps } from '../types';
import type { CompatibilityStatus } from '@/types/animal';

export function BehaviorStep({ formData, onUpdate, errors }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Verhalten & Charakter
        </h2>
        <p className="text-muted-foreground mt-2">
          Поведение и съвместимост
        </p>
      </div>

      {/* Character Description */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Характер / Wesen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="characteristics" className="text-base">
              Описание на характера <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="characteristics"
              value={formData.characteristics}
              onChange={(e) => onUpdate('characteristics', e.target.value)}
              placeholder="напр. спокоен, умен, нежен, обича да играе..."
              rows={4}
              className={`resize-none ${errors?.characteristics ? 'border-destructive' : ''}`}
            />
            {errors?.characteristics && (
              <p className="text-sm text-destructive">{errors.characteristics}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Опишете характера на животното подробно / Beschreiben Sie das Wesen des Tieres ausführlich
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary" />
            <span>Съвместимост / Verträglichkeit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Dogs */}
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="compatibleDogs" className="text-base">
                  С кучета / Mit Hunden <span className="text-destructive">*</span>
                </Label>
              </div>
              <Select
                value={formData.compatibleDogs}
                onValueChange={(value: CompatibilityStatus) => onUpdate('compatibleDogs', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Да / JA</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="NEIN">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span>Не / NEIN</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="kann getestet werden">
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-500" />
                      <span>Може да се тества</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cats */}
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center gap-2">
                <Cat className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="compatibleCats" className="text-base">
                  С котки / Mit Katzen <span className="text-destructive">*</span>
                </Label>
              </div>
              <Select
                value={formData.compatibleCats}
                onValueChange={(value: CompatibilityStatus) => onUpdate('compatibleCats', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Да / JA</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="NEIN">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span>Не / NEIN</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="kann getestet werden">
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-500" />
                      <span>Може да се тества</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Children */}
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="compatibleChildren" className="text-base">
                  С деца / Mit Kindern <span className="text-destructive">*</span>
                </Label>
              </div>
              <Select
                value={formData.compatibleChildren}
                onValueChange={(value: CompatibilityStatus) => onUpdate('compatibleChildren', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Да / JA</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="NEIN">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span>Не / NEIN</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="kann getestet werden">
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-500" />
                      <span>Може да се тества</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional compatibility notes */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Label htmlFor="compatibilityText" className="text-base">
              Допълнителна информация / Zusätzliche Information
            </Label>
            <Textarea
              id="compatibilityText"
              value={formData.compatibilityText || ''}
              onChange={(e) => onUpdate('compatibilityText', e.target.value)}
              placeholder="z.B. Verträgt sich besonders gut mit ruhigen Hunden..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <Star className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Съвет / Tipp
          </p>
          <p className="text-sm text-muted-foreground">
            Подробното описание на характера помага за по-бързо осиновяване. 
            Eine ausführliche Beschreibung hilft bei der schnelleren Vermittlung.
          </p>
        </div>
      </div>
    </div>
  );
}
