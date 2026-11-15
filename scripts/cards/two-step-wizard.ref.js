function TwoStepWizard({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (step === 1) {
    return (
      <div>
        <input
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

