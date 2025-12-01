'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Dog, Cat, Lightbulb } from 'lucide-react';
import type { StepProps } from '../types';
import type { AnimalType, Gender } from '@/types/animal';

export function BasicInfoStep({ formData, onUpdate, errors }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <PawPrint className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Grundinformationen
        </h2>
        <p className="text-muted-foreground mt-2">
          Основна информация за животното
        </p>
      </div>

      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="pt-6 space-y-6">
          {/* Name & Animal Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="name" className="text-base">
                Име / Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder="z.B. Bella, Max..."
                className={errors?.name ? 'border-destructive' : ''}
              />
              {errors?.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="animal" className="text-base">
                Вид животно / Tier-Art <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.animal}
                onValueChange={(value: AnimalType) => onUpdate('animal', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hund">
                    <span className="flex items-center gap-2">
                      <Dog className="w-4 h-4" />
                      <span>Куче / Hund</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Katze">
                    <span className="flex items-center gap-2">
                      <Cat className="w-4 h-4" />
                      <span>Котка / Katze</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender & Breed Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="gender" className="text-base">
                Пол / Geschlecht <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: Gender) => onUpdate('gender', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weiblich">
                    <span>Женски / Weiblich</span>
                  </SelectItem>
                  <SelectItem value="männlich">
                    <span>Мъжки / Männlich</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="breed" className="text-base">
                Порода / Rasse <span className="text-destructive">*</span>
              </Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => onUpdate('breed', e.target.value)}
                placeholder="z.B. Mischling, Labrador..."
                className={errors?.breed ? 'border-destructive' : ''}
              />
              {errors?.breed && (
                <p className="text-sm text-destructive">{errors.breed}</p>
              )}
            </div>
          </div>

          {/* Birth Date, Size, Color Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="birthDate" className="text-base">
                Рождена дата / Geboren
              </Label>
              <DatePicker
                value={formData.birthDate}
                onChange={(value) => onUpdate('birthDate', value)}
              />
              <p className="text-xs text-muted-foreground">
                Приблизително / Ungefähr ist OK
              </p>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="shoulderHeight" className="text-base">
                Размер / Schulterhöhe (cm)
              </Label>
              <Input
                id="shoulderHeight"
                type="number"
                min="1"
                max="200"
                value={formData.shoulderHeight || ''}
                onChange={(e) => onUpdate('shoulderHeight', e.target.value)}
                placeholder="z.B. 45"
              />
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="color" className="text-base">
                Цвят / Farbe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => onUpdate('color', e.target.value)}
                placeholder="z.B. schwarz-weiß..."
                className={errors?.color ? 'border-destructive' : ''}
              />
              {errors?.color && (
                <p className="text-sm text-destructive">{errors.color}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helpful tip */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Съвет / Tipp</p>
          <p className="text-sm text-muted-foreground">
            Полетата с <span className="text-destructive">*</span> са задължителни. 
            Felder mit <span className="text-destructive">*</span> sind Pflichtfelder.
          </p>
        </div>
      </div>
    </div>
  );
}
