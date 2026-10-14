function Wizard({ steps, onSubmit }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState({});
  const [error, setError] = useState(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const handleSubmit = (e) => {
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
            onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
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
