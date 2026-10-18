function formatTime(ms) {
  const pad = (n) => String(n).padStart(2, '0');
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function Stopwatch() {
  const [base, setBase] = useState(0); // ms accumulated before the current run
  const [startedAt, setStartedAt] = useState(null); // Date.now() when the current run began
  const [laps, setLaps] = useState([]);
  const [, setTick] = useState(0);
  const running = startedAt !== null;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 10);
    return () => clearInterval(id);
  }, [running]);

  const total = base + (running ? Date.now() - startedAt : 0);

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
