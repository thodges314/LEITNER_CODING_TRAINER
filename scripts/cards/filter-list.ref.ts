interface FilterListProps {
  items: string[];
}

function FilterList({ items }: FilterListProps): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((item: string) => item.toLowerCase().includes(q)) : items;

  return (
    <div>
      <input aria-label="Filter" value={query} onChange={(e: unknown) => setQuery((e as { target: { value: string } }).target.value)} />
      <ul>
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p role="status">
        {visible.length === 0 ? 'No matches' : `${visible.length} result${visible.length === 1 ? '' : 's'}`}
      </p>
    </div>
  );
}
