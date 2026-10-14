function useForm({ initialValues, validate = () => ({}), onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => validate(values), [validate, values]);

  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(values).map((key) => [key, true])));
    if (Object.keys(validate(values)).length > 0) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset };
}
