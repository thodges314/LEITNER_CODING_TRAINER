interface SearchFormProps {
  onSearch: (query: string) => void;
}

function SearchForm({ onSearch }: SearchFormProps): JSX.Element {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: { preventDefault: () => void }): void => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={(e: { target: { value: string } }) => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
}
