interface FancyInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

interface FancyInputProps {
  placeholder?: string;
  type?: string;
  [key: string]: unknown;
}

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(function FancyInput(
  props: FancyInputProps,
  ref: { current: FancyInputHandle | null } | ((instance: FancyInputHandle | null) => void) | null
) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(
    ref,
    (): FancyInputHandle => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.focus();
        }
      },
      getValue: () => inputRef.current?.value ?? '',
    }),
    []
  );

  return <input ref={inputRef} {...props} />;
});
