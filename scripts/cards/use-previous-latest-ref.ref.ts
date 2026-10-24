function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

function useInterval(callback: () => void, delay: number | null): void {
  const saved = useLatest(callback); // newest callback, without touching the timer

  useEffect(() => {
    if (delay === null) return; // paused
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay, saved]);
}
