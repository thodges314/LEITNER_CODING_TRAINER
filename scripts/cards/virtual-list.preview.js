function Demo() {
  const {
    itemHeight = 35,
    height = 200,
    overscan = 3,
    itemsCount = 1000,
  } = usePreviewProps({
    itemHeight: 35,
    height: 200,
    overscan: 3,
    itemsCount: 1000,
  });

  const count = Math.max(1, Number(itemsCount) || 1000);
  const items = useMemo(() => Array.from({ length: count }, (_, i) => `Row item #${i + 1}`), [count]);

  return (
    <div style={{ padding: '16px' }}>
      <VirtualList
        items={items}
        itemHeight={Number(itemHeight) || 35}
        height={Number(height) || 200}
        overscan={Number(overscan) || 3}
      />
    </div>
  );
}

<Demo />
