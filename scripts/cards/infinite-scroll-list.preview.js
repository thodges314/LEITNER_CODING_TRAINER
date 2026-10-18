function Demo() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = () => {
    log('onLoadMore')();
    if (items.length >= 15) {
      setHasMore(false);
      return;
    }
    setItems((prev) => [
      ...prev,
      `Item ${prev.length + 1}`,
      `Item ${prev.length + 2}`,
    ]);
  };

  return (
    <div style={{ padding: '16px', maxHeight: '200px', overflowY: 'auto' }}>
      <InfiniteList items={items} hasMore={hasMore} loading={false} onLoadMore={loadMore} />
      {!hasMore && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>Reached the end</div>}
    </div>
  );
}

<Demo />
