function LoadMoreList({ fetchPage }) {
  const [items, setItems] = useState([]);
  const [loadedPage, setLoadedPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const load = useCallback(
    async (page) => {
      if (inFlight.current) return; // ignore clicks while a request is running
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPage(page);
        setItems((prev) => [...prev, ...result.items]);
        setLoadedPage(page);
        setHasMore(result.hasMore);
      } catch (e) {
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
