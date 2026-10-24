interface StorageEventLike {
  key?: string | null;
  newValue?: string | null;
}

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  };

  const [value, setStored] = useState<T>(read);
  const latest = useRef<T>(value);
  latest.current = value;

  // Changing the key re-reads storage.
  const lastKey = useRef<string>(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      setStored(read());
    }
  }, [key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(latest.current) : next;
      latest.current = resolved;
      setStored(resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* quota exceeded or storage disabled: keep the in-memory value */
      }
    },
    [key],
  );

  // Other tabs.
  useEffect(() => {
    const onStorage = (e: StorageEventLike): void => {
      if (e.key !== key) return;
      try {
        setStored(e.newValue === null || e.newValue === undefined ? initialValue : (JSON.parse(e.newValue) as T));
      } catch {
        setStored(initialValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [value, setValue];
}
