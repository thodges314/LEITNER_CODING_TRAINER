function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // each change (or unmount) cancels the previous timer
  }, [value, delay]);

  return debounced;
}
