function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = useState<T>(value);
  const lastUpdate = useRef<number>(Date.now());

  useEffect(() => {
    const remaining = interval - (Date.now() - lastUpdate.current);
    if (remaining <= 0) {
      lastUpdate.current = Date.now();
      setThrottled(value);
      return;
    }
    const timer = setTimeout(() => {
      lastUpdate.current = Date.now();
      setThrottled(value);
    }, remaining);
    return () => clearTimeout(timer);
  }, [value, interval]);

  return throttled;
}
