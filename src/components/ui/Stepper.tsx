'use client';

import React from 'react';
import type { AppStep } from '@/lib/store';

interface Step {
  id: AppStep;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { id: 'upload', label: 'Upload', icon: '📁' },
  { id: 'validation', label: 'Validation', icon: '✅' },
  { id: 'routing', label: 'Routing', icon: '🔀' },
  { id: 'previous-week', label: 'Previous Week', icon: '📊' },
  { id: 'report', label: 'Report', icon: '📋' },
];

interface StepperProps {
  currentStep: AppStep;
  onStepClick?: (step: AppStep) => void;
  completedSteps?: AppStep[];
}

export function Stepper({ currentStep, onStepClick, completedSteps = [] }: StepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="stepper">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
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
