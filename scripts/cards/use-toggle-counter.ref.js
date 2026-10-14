function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useCounter({ initial = 0, min = -Infinity, max = Infinity, step = 1 } = {}) {
  const clamp = useCallback((n) => Math.min(max, Math.max(min, n)), [min, max]);
  const [count, setCount] = useState(() => clamp(initial));
  const increment = useCallback(() => setCount((c) => clamp(c + step)), [clamp, step]);
  const decrement = useCallback(() => setCount((c) => clamp(c - step)), [clamp, step]);
  const reset = useCallback(() => setCount(clamp(initial)), [clamp, initial]);
  const set = useCallback((n) => setCount(clamp(n)), [clamp]);
  return { count, increment, decrement, reset, set };
}
