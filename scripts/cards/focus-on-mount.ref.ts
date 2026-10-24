interface FocusInputProps {
  placeholder?: string;
  label?: string;
}

function FocusInput({ placeholder, label }: FocusInputProps): JSX.Element {
  const inputRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus(); // only once: the dependency list is empty
  }, []);

  return (
    <label>
      {label}
      <input ref={inputRef} placeholder={placeholder} />
    </label>
  );
}
