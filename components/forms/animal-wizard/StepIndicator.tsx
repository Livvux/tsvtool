'use client';

import { cn } from '@/lib/utils';
import { WIZARD_STEPS } from './types';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
        />
        
        {WIZARD_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                  'transition-all duration-300 ease-out',
                  'border-2 shadow-sm',
                  isCurrent && 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30',
                  isCompleted && !isCurrent && 'bg-primary/10 border-primary text-primary',
                  !isCurrent && !isCompleted && isPast && 'bg-muted border-primary/50 text-primary/50',
                  !isCurrent && !isCompleted && !isPast && 'bg-card border-border text-muted-foreground'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-3 text-center">
                <p className={cn(
                  'text-sm font-medium transition-colors',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  'text-xs mt-0.5 transition-colors',
                  isCurrent && 'text-muted-foreground',
                  !isCurrent && 'text-muted-foreground/60'
                )}>
                  {step.titleBG}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mobile view - simplified */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {WIZARD_STEPS[currentStep - 1].icon} {WIZARD_STEPS[currentStep - 1].title}
          </span>
          <span className="text-sm text-muted-foreground">
            Стъпка {currentStep} от {WIZARD_STEPS.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {WIZARD_STEPS[currentStep - 1].description}
        </p>
      </div>
    </div>
  );
}

