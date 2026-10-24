function formatTime(ms: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function Stopwatch(): JSX.Element {
  const [base, setBase] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [laps, setLaps] = useState<string[]>([]);
  const [, setTick] = useState<number>(0);
  const running = startedAt !== null;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 10);
    return () => clearInterval(id);
  }, [running]);

  const total = base + (running ? Date.now() - (startedAt as number) : 0);

  const toggle = () => {
    if (running) {
      setBase(total);
      setStartedAt(null);
    } else {
      setStartedAt(Date.now());
    }
  };
  const lap = () => setLaps((l) => [...l, formatTime(total)]);
  const reset = () => {
    setBase(0);
    setStartedAt(null);
    setLaps([]);
  };

  return (
    <div>
      <div role="timer" aria-label="Elapsed time">{formatTime(total)}</div>
      <button type="button" onClick={toggle}>{running ? 'Pause' : 'Start'}</button>
      <button type="button" onClick={lap} disabled={!running}>Lap</button>
      <button type="button" onClick={reset}>Reset</button>
      <ol aria-label="Laps">
        {laps.map((t, i) => (
          <li key={i}>Lap {i + 1} {t}</li>
        ))}
      </ol>
    </div>
  );
}
