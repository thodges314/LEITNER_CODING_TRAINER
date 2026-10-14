function FilterList({ items }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((item) => item.toLowerCase().includes(q)) : items;

  return (
    <div>
      <input aria-label="Filter" value={query} onChange={(e) => setQuery(e.target.value)} />
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
