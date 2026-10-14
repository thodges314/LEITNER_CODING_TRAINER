function SortedList({ items, onCompute }) {
  const [count, setCount] = useState(0);

  const sorted = useMemo(() => {
    if (onCompute) onCompute();
    return [...items].sort((a, b) => a - b); // copy first: never mutate props
  }, [items]);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <ul>
        {sorted.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
