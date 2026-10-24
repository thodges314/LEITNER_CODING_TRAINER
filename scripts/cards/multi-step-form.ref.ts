function Wizard({
  steps,
  onSubmit,
}: {
  steps: Array<{ title: string; fields: Array<{ name: string; label: string }> }>;
  onSubmit: (values: Record<string, string>) => void;
}): JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const handleSubmit = (e: { preventDefault: () => void }): void => {
    e.preventDefault();
    const missing = step.fields.some((field) => !(values[field.name] ?? '').trim());
    if (missing) {
      setError('All fields are required');
      return;
    }
    setError(null);
    if (isLast) onSubmit(values);
    else setIndex(index + 1);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>
        Step {index + 1} of {steps.length}
      </p>
      <h2>{step.title}</h2>
      {step.fields.map((field) => (
        <label key={field.name}>
          {field.label}
          <input
            name={field.name}
            value={values[field.name] ?? ''}
            onChange={(e: { target: { value: string } }) =>
              setValues((v) => ({ ...v, [field.name]: e.target.value }))
            }
          />
        </label>
      ))}
      {error && <p role="alert">{error}</p>}
      <button
        type="button"
        disabled={index === 0}
        onClick={() => {
          setError(null);
          setIndex(index - 1);
        }}
      >
        Back
      </button>
      <button type="submit">{isLast ? 'Submit' : 'Next'}</button>
    </form>
  );
}
