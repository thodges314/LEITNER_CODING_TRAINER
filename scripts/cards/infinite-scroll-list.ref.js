function InfiniteList({ items = [], onLoadMore, hasMore, loading }) {
  const sentinelRef = useRef(null);
  const state = useRef({ onLoadMore, loading });
  state.current = { onLoadMore, loading };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el) return; // last page: no observer at all
    const observer = new IntersectionObserver((entries) => {
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
