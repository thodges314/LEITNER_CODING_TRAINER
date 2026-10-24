interface FetchPageResult {
  items: string[];
  hasMore: boolean;
}

interface LoadMoreListProps {
  fetchPage: (page: number) => Promise<FetchPageResult>;
}

function LoadMoreList({ fetchPage }: LoadMoreListProps): JSX.Element {
  const [items, setItems] = useState<string[]>([]);
  const [loadedPage, setLoadedPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const inFlight = useRef<boolean>(false);

  const load = useCallback(
    async (page: number): Promise<void> => {
      if (inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPage(page);
        setItems((prev: string[]) => [...prev, ...result.items]);
        setLoadedPage(page);
        setHasMore(result.hasMore);
      } catch (e: unknown) {
        setError(e);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {loading && <p role="status">Loading…</p>}
      {error && (
        <>
          <p role="alert">Failed to load</p>
          <button onClick={() => load(loadedPage + 1)}>Retry</button>
        </>
      )}
      {hasMore && !loading && !error && <button onClick={() => load(loadedPage + 1)}>Load more</button>}
    </div>
  );
}
