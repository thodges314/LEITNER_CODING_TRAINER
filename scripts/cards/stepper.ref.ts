interface StepItem {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  initialStep?: number;
  onStepChange?: (stepIndex: number) => void;
  onComplete?: () => void;
}

function Stepper({
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
}: StepperProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  const goToStep = (index: number): void => {
    if (index >= 0 && index < steps.length && index !== currentStep) {
      setCurrentStep(index);
      if (typeof onStepChange === 'function') onStepChange(index);
    }
  };

  const handlePrev = (): void => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleNext = (): void => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      if (typeof onComplete === 'function') onComplete();
    }
  };

  const isLast = currentStep === steps.length - 1;

  return (
    <div>
      <nav aria-label="Progress">
        <ol>
          {steps.map((step, index) => {
            const status: 'active' | 'completed' | 'upcoming' =
              index === currentStep ? 'active' : index < currentStep ? 'completed' : 'upcoming';
            const isClickable = index <= currentStep;

            return (
              <li key={step.id} data-status={status}>
                <button
                  type="button"
                  data-status={status}
                  aria-current={status === 'active' ? 'step' : undefined}
                  disabled={!isClickable}
                  onClick={(): void => {
                    if (isClickable) goToStep(index);
                  }}
                >
                  <span>{index + 1}</span>
                  <strong>{step.title}</strong>
                  {step.description && <span>{step.description}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div>
        <button
          type="button"
          data-action="prev"
          disabled={currentStep === 0}
          onClick={handlePrev}
        >
          Back
        </button>
        <button type="button" data-action="next" onClick={handleNext}>
          {isLast ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
