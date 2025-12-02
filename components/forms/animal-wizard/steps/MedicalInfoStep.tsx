'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Stethoscope, 
  Hospital, 
  ClipboardList, 
  Info,
  Check,
  X,
  RefreshCw,
  HeartPulse,
  Bandage
} from 'lucide-react';
import type { StepProps } from '../types';
import type { YesNo, YesNoPartial, ChipStatus } from '@/types/animal';

export function MedicalInfoStep({ formData, onUpdate }: StepProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Medizinische Information
        </h2>
        <p className="text-muted-foreground mt-2">
          Медицинска информация за животното
        </p>
      </div>

      {/* Basic Medical Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hospital className="w-5 h-5 text-primary" />
            <span>Основен статус / Grundstatus</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="castrated" className="text-base">
                Кастриран / Kastriert <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.castrated}
                onValueChange={(value: YesNo) => onUpdate('castrated', value)}
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="vaccinated" className="text-base">
                Ваксиниран / Geimpft <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.vaccinated}
                onValueChange={(value: YesNoPartial) => onUpdate('vaccinated', value)}
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
                  <SelectItem value="teilweise">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                      <span>Частично / Teilweise</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="chipped" className="text-base">
                Чипиран / Gechipt <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.chipped}
                onValueChange={(value: ChipStatus) => onUpdate('chipped', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vollständig">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Да / Vollständig</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="teilweise">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                      <span>Частично / Teilweise</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="nein">
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span>Не / Nein</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="health" className="text-base">
                Здраве / Gesundheit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.health}
                onValueChange={(value: YesNo) => onUpdate('health', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JA">
                    <span className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-green-600" />
                      <span>Здрав / Gesund</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="NEIN">
                    <span className="flex items-center gap-2">
                      <Bandage className="w-4 h-4 text-amber-500" />
                      <span>Проблеми / Probleme</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="bloodType" className="text-base">
                Кръвна група / Blutgruppe
              </Label>
              <Input
                id="bloodType"
                value={formData.bloodType || ''}
                onChange={(e) => onUpdate('bloodType', e.target.value)}
                placeholder="Falls bekannt..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span>Подробности / Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="diseases" className="text-base">
              Болести / Krankheiten
            </Label>
            <Textarea
              id="diseases"
              value={formData.diseases || ''}
              onChange={(e) => onUpdate('diseases', e.target.value)}
              placeholder="Bekannte Krankheiten oder Allergien..."
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Оставете празно ако няма / Leer lassen wenn keine
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handicap" className="text-base">
              Увреждания / Handicap
            </Label>
            <Textarea
              id="handicap"
              value={formData.handicap || ''}
              onChange={(e) => onUpdate('handicap', e.target.value)}
              placeholder="Körperliche Einschränkungen..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthText" className="text-base">
              Здравни бележки / Gesundheitsnotizen
            </Label>
            <Textarea
              id="healthText"
              value={formData.healthText || ''}
              onChange={(e) => onUpdate('healthText', e.target.value)}
              placeholder="Weitere wichtige Gesundheitsinformationen..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Важно / Wichtig
          </p>
          <p className="text-sm text-muted-foreground">
            Медицинската информация помага на бъдещите осиновители. 
            Medizinische Infos helfen zukünftigen Adoptiveltern.
          </p>
        </div>
      </div>
    </div>
  );
}
