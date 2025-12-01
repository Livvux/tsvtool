'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { WIZARD_STEPS } from './types';

interface StepNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
}

export function StepNavigation({
  currentStep,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting,
  canProceed,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === WIZARD_STEPS.length;

  return (
    <div className={cn(
      'flex items-center gap-4 pt-6',
      isFirstStep ? 'justify-end' : 'justify-between'
    )}>
      {!isFirstStep && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isSubmitting}
          className="min-w-[140px] gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад / Zurück</span>
        </Button>
      )}

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canProceed}
          className="min-w-[180px] gap-2 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Изпращане...</span>
            </>
          ) : (
            <>
              <span>Създаване / Erstellen</span>
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="min-w-[140px] gap-2"
        >
          <span>Напред / Weiter</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
