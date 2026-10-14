function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; // runs after render, so the next render sees this value
  }, [value]);
  return ref.current;
}
