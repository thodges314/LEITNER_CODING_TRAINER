type UseToggleReturn = [boolean, () => void, (next: boolean) => void];

interface UseCounterOptions {
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (n: number) => void;
}

function useToggle(initial = false): UseToggleReturn {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v: boolean) => !v), []);
  return [value, toggle, setValue];
}

function useCounter({
  initial = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: UseCounterOptions = {}): UseCounterReturn {
  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max]);
  const [count, setCount] = useState(() => clamp(initial));
  const increment = useCallback(() => setCount((c: number) => clamp(c + step)), [clamp, step]);
  const decrement = useCallback(() => setCount((c: number) => clamp(c - step)), [clamp, step]);
  const reset = useCallback(() => setCount(clamp(initial)), [clamp, initial]);
  const set = useCallback((n: number) => setCount(clamp(n)), [clamp]);
  return { count, increment, decrement, reset, set };
}
