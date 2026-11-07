const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const useLatest = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};

const useInterval = (callback, delay) => {
  const saved = useLatest(callback); // newest callback, without touching the timer

  useEffect(() => {
    if (delay === null) return; // paused
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
