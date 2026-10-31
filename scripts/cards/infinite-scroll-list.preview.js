function Demo() {
  const {
    items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    hasMore = true,
    loading = false,
    onLoadMore,
  } = usePreviewProps({
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    hasMore: true,
    loading: false,
  });

  const parsedInitial = Array.isArray(items) && items.length > 0 ? items : ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  const [list, setList] = useState(parsedInitial);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);

  useEffect(() => {
    setList(parsedInitial);
  }, [items]);

  useEffect(() => {
    setCanLoadMore(Boolean(hasMore));
  }, [hasMore]);

  const handleLoadMore = () => {
    if (onLoadMore) onLoadMore();
    log('onLoadMore');
    if (list.length >= 15) {
      setCanLoadMore(false);
      return;
    }
    setList((prev) => [
      ...prev,
      `Item ${prev.length + 1}`,
      `Item ${prev.length + 2}`,
    ]);
  };

  return (
    <div style={{ padding: '16px', maxHeight: '200px', overflowY: 'auto' }}>
      <InfiniteList
        items={list}
        hasMore={canLoadMore}
        loading={Boolean(loading)}
        onLoadMore={handleLoadMore}
      />
      {!canLoadMore && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Reached the end</div>}
    </div>
  );
}

<Demo />
