interface WizardData {
  name: string;
  email: string;
}

interface TwoStepWizardProps {
  onSubmit: (data: WizardData) => void;
}

function TwoStepWizard({ onSubmit }: TwoStepWizardProps): JSX.Element {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  if (step === 1) {
    return (
      <div>
        <input
          aria-label="Name"
          placeholder="Name"
          value={name}
          onChange={(e: { target: { value: string } }) => setName(e.target.value)}
        />
        <button
          type="button"
          disabled={name.trim() === ''}
          onClick={() => setStep(2)}
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        aria-label="Email"
        placeholder="Email"
        value={email}
        onChange={(e: { target: { value: string } }) => setEmail(e.target.value)}
      />
      <button type="button" onClick={() => setStep(1)}>
        Back
      </button>
      <button
        type="button"
        disabled={email.trim() === ''}
        onClick={() => onSubmit({ name, email })}
      >
        Submit
      </button>
    </div>
  );
}
