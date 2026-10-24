function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value; // runs after render, so the next render sees this value
  }, [value]);
  return ref.current;
}
