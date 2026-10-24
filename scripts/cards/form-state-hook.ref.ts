interface FormTargetLike {
  name: string;
  type?: string;
  value?: unknown;
  checked?: boolean;
}

interface FormEventLike {
  target: FormTargetLike;
}

interface SubmitEventLike {
  preventDefault?: () => void;
}

interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  handleChange: (e: FormEventLike) => void;
  handleBlur: (e: FormEventLike) => void;
  handleSubmit: (e?: SubmitEventLike) => Promise<void>;
  reset: () => void;
}

function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate = () => ({}),
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => validate(values), [validate, values]);

  const handleChange = useCallback((e: FormEventLike) => {
    const { name, type, value, checked } = e.target;
    setValues((v: T) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleBlur = useCallback((e: FormEventLike) => {
    const { name } = e.target;
    setTouched((t: Record<string, boolean>) => ({ ...t, [name]: true }));
  }, []);

  const handleSubmit = async (e?: SubmitEventLike): Promise<void> => {
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
