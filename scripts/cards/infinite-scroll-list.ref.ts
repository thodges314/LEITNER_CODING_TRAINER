function InfiniteList({
  items = [],
  onLoadMore,
  hasMore,
  loading,
}: {
  items?: string[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}): JSX.Element {
  const sentinelRef = useRef<HTMLLIElement | null>(null);
  const state = useRef<{ onLoadMore: () => void; loading: boolean }>({ onLoadMore, loading });
  state.current = { onLoadMore, loading };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el) return; // last page: no observer at all
    const observer = new IntersectionObserver((entries: Array<{ isIntersecting: boolean }>) => {
      if (entries.some((e) => e.isIntersecting) && !state.current.loading) state.current.onLoadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
      <li ref={sentinelRef} data-sentinel aria-hidden="true" />
    </ul>
  );
}
