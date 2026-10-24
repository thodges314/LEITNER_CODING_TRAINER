function VirtualList({
  items,
  itemHeight,
  height,
  overscan = 3,
}: {
  items: string[];
  itemHeight: number;
  height: number;
  overscan?: number;
}): JSX.Element {
  const [scrollTop, setScrollTop] = useState<number>(0);

  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + overscan);

  const visible: JSX.Element[] = [];
  for (let i = start; i < end; i++) {
    visible.push(
      <div key={i} role="listitem" style={{ position: 'absolute', left: 0, right: 0, top: i * itemHeight, height: itemHeight }}>
        {items[i]}
      </div>
    );
  }

  return (
    <div
      role="list"
      style={{ height, overflowY: 'auto', position: 'relative' }}
      onScroll={(e: { currentTarget: { scrollTop: number } }) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>{visible}</div>
    </div>
  );
}
