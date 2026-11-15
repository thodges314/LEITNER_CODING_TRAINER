function RenderCounter({ label = 'Clicks' }) {
  const [count, setCount] = useState(0);
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        {label}: {count}
      </button>
      <span>Renders: {renders.current}</span>
    </div>
  );
}

