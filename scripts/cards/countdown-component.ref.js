function Countdown({ seconds, onDone, tickMs = 1000 }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => r - 1), tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false);
      if (onDoneRef.current) onDoneRef.current();
    }
  }, [remaining, running]);

  return (
    <div>
      <span role="timer">{remaining}</span>
      <button onClick={() => remaining > 0 && setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Pause</button>
      <button
        onClick={() => {
          setRunning(false);
          setRemaining(seconds);
        }}
      >
        Reset
      </button>
    </div>
  );
}
