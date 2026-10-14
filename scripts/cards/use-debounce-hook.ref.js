function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // each change (or unmount) cancels the previous timer
  }, [value, delay]);

  return debounced;
}

function useThrottle(value, interval) {
  const [throttled, setThrottled] = useState(value);
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const remaining = interval - (Date.now() - lastUpdate.current);
    if (remaining <= 0) {
      lastUpdate.current = Date.now();
      setThrottled(value); // leading edge: the interval has already elapsed
      return;
    }
    const timer = setTimeout(() => {
      lastUpdate.current = Date.now();
      setThrottled(value); // trailing edge: always the latest value
    }, remaining);
    return () => clearTimeout(timer);
  }, [value, interval]);

  return throttled;
}
