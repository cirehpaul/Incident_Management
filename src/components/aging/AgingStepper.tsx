'use client';

import React from 'react';
import type { AgingStep } from '@/lib/aging-store';

interface AgingStepDef {
  id: AgingStep;
  label: string;
  icon: string;
}

const AGING_STEPS: AgingStepDef[] = [
  { id: 'upload', label: 'Upload', icon: '📁' },
  { id: 'validation', label: 'Validation', icon: '✅' },
  { id: 'routing', label: 'Routing', icon: '🔀' },
  { id: 'previous-week', label: 'Last Week', icon: '📊' },
  { id: 'report', label: 'Report', icon: '📋' },
];

interface AgingStepperProps {
  currentStep: AgingStep;
  onStepClick?: (step: AgingStep) => void;
}

export function AgingStepper({ currentStep, onStepClick }: AgingStepperProps) {
  const currentIndex = AGING_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="stepper">
      {AGING_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = onStepClick && (isCompleted || index <= currentIndex);

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div className={`stepper-connector ${isCompleted ? 'completed' : ''}`} />
            )}
            <button
              className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              type="button"
            >
              <span className="stepper-icon">
                {isCompleted && !isActive ? '✓' : step.icon}
              </span>
              <span className="stepper-label">{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
