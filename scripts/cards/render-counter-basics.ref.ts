function RenderCounter({ label = 'Clicks' }: { label?: string }): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const renders = useRef<number>(0);
  renders.current += 1;

  return (
    <div>
      <button type="button" onClick={() => setCount((c: number) => c + 1)}>
        {label}: {count}
      </button>
      <span>Renders: {renders.current}</span>
    </div>
  );
}

