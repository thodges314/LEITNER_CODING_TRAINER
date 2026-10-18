function getVisibleRange({ scrollTop, itemHeight, viewportHeight, itemCount, overscan = 0 }) {
  const totalHeight = itemCount * itemHeight;
  const maxScroll = Math.max(0, totalHeight - viewportHeight);
  const top = Math.min(Math.max(0, scrollTop), maxScroll);
  const first = Math.floor(top / itemHeight);
  const last = Math.ceil((top + viewportHeight) / itemHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(itemCount, last + overscan);
  return { start, end, offsetTop: start * itemHeight, totalHeight };
}
