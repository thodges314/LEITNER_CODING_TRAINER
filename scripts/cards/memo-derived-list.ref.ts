interface SortedListProps {
  items: number[];
  onCompute?: () => void;
}

function SortedList({ items, onCompute }: SortedListProps): JSX.Element {
  const [count, setCount] = useState<number>(0);

  const sorted = useMemo<number[]>(() => {
    if (onCompute) onCompute();
    return [...items].sort((a, b) => a - b);
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
