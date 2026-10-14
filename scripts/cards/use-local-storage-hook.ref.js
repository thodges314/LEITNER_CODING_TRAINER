function useLocalStorage(key, initialValue) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  };

  const [value, setStored] = useState(read);
  const latest = useRef(value);
  latest.current = value;

  // Changing the key re-reads storage.
  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      setStored(read());
    }
  }, [key]);

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(latest.current) : next;
      latest.current = resolved;
      setStored(resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* quota exceeded or storage disabled: keep the in-memory value */
      }
    },
    [key]
  );

  // Other tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      try {
        setStored(e.newValue === null ? initialValue : JSON.parse(e.newValue));
      } catch {
        setStored(initialValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}
