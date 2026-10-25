interface SignupFormValues {
  name: string;
  email: string;
}

interface SignupFormProps {
  onSubmit: (values: SignupFormValues) => void;
}

const FIELDS: { id: keyof SignupFormValues; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
];

function validate(values: SignupFormValues): Partial<Record<keyof SignupFormValues, string>> {
  const errors: Partial<Record<keyof SignupFormValues, string>> = {};
  if (!values.name.trim()) errors.name = 'Enter your name';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

function SignupForm({ onSubmit }: SignupFormProps): JSX.Element {
  const [values, setValues] = useState<SignupFormValues>({ name: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormValues, string>>>({});
  const [attempt, setAttempt] = useState<number>(0);
  const summaryRef = useRef<HTMLElement | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (attempt > 0 && summaryRef.current) summaryRef.current.focus();
  }, [attempt]);

  const submit = (event: { preventDefault: () => void }): void => {
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
                  onClick={(event: { preventDefault: () => void }): void => {
                    event.preventDefault();
                    inputs.current[field.id]?.focus();
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
            ref={(el: HTMLInputElement | null): void => {
              inputs.current[field.id] = el;
            }}
            value={values[field.id]}
            onChange={(event: { target: { value: string } }): void =>
              setValues({ ...values, [field.id]: event.target.value })
            }
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
