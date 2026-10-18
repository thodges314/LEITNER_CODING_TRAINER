const FIELDS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

function SignupForm({ onSubmit }) {
  const [values, setValues] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [attempt, setAttempt] = useState(0);
  const summaryRef = useRef(null);
  const inputs = useRef({});

  useEffect(() => {
    if (attempt > 0 && summaryRef.current) summaryRef.current.focus();
  }, [attempt]);

  const submit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    onSubmit({ name: values.name.trim(), email: values.email.trim() });
  };

  const failing = FIELDS.filter((field) => errors[field.id]);

  return (
    <form onSubmit={submit} noValidate>
      {failing.length > 0 && (
        <div role="alert">
          <h2 tabIndex={-1} ref={summaryRef}>
            There is a problem
          </h2>
          <ul>
            {failing.map((field) => (
              <li key={field.id}>
                <a
                  href={'#' + field.id}
                  onClick={(event) => {
                    event.preventDefault();
                    inputs.current[field.id].focus();
                  }}
                >
                  {errors[field.id]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {FIELDS.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <input
            id={field.id}
            ref={(el) => {
              inputs.current[field.id] = el;
            }}
            value={values[field.id]}
            onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            aria-invalid={errors[field.id] ? 'true' : undefined}
            aria-describedby={errors[field.id] ? field.id + '-error' : undefined}
          />
          {errors[field.id] && <p id={field.id + '-error'}>{errors[field.id]}</p>}
        </div>
      ))}
      <button type="submit">Create account</button>
    </form>
  );
}
