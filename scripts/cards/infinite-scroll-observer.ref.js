function useInfiniteScroll(onLoadMore) {
  const sentinelRef = useRef(null);
  const latest = useRef(onLoadMore);
  latest.current = onLoadMore; // always call the newest callback without re-creating the observer

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) latest.current();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return sentinelRef;
}
