import { memo } from 'react';

const STEPS = ['Enhancement', 'Scenarios', 'Test Cases', 'Automation'] as const;

type StepState = 'pending' | 'active' | 'completed';

type Props = {
  /**
   * 1–4 while Generate All is running (active step).
   * 5 = all completed (all green, shown briefly before parent clears it).
   * 0 = idle, renders nothing.
   */
  activeStep: number;
};

export const StepStepper = memo(function StepStepper({ activeStep }: Props): JSX.Element | null {
  if (activeStep === 0) return null;

  const allDone = activeStep > STEPS.length;

  return (
    <div
      className={`step-stepper${allDone ? ' step-stepper--done' : ''}`}
      role="status"
      aria-label={allDone ? 'All steps completed' : `Generating step ${activeStep} of 4`}
    >
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state: StepState = allDone || n < activeStep ? 'completed' : n === activeStep ? 'active' : 'pending';
        const connectorState: StepState = allDone || n < activeStep ? 'completed' : 'pending';
        return (
          <div key={label} className="step-item">
            <div className={`step-dot step-dot--${state}`} aria-hidden="true">
              {state === 'completed' ? '✓' : n}
            </div>
            <span className={`step-label step-label--${state}`}>{label}</span>
            {i < STEPS.length - 1 && (
              <div className={`step-connector step-connector--${connectorState}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
});
