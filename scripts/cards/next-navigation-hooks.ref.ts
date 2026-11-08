'use client';

interface SearchFilterProps {
  defaultQuery?: string;
}

function SearchFilter({ defaultQuery = '' }: SearchFilterProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialQuery = searchParams.get('q') ?? defaultQuery;
  const [query, setQuery] = React.useState(initialQuery);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`${pathname}?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        data-testid="search-input"
        value={query}
        onChange={(e: { target: { value: string } }) => setQuery(e.target.value)}
      />
      <button type="submit" data-testid="search-submit">
        Search
      </button>
      <span data-testid="current-path">{pathname}</span>
    </form>
  );
}
