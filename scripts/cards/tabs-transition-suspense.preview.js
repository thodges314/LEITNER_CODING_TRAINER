function Demo() {
  const {
    delayMs = 600,
    load,
  } = usePreviewProps({
    delayMs: 600,
  });

  const cacheRef = useRef(new Map());

  const handleLoad = useCallback((tab) => {
    if (load) return load(tab);
    if (!cacheRef.current.has(tab)) {
      cacheRef.current.set(
        tab,
        new Promise((resolve) => {
          setTimeout(() => {
            log('tabLoaded', tab);
            if (tab === 'home') resolve('Home content: Welcome to the React 19 transition demo!');
            else if (tab === 'posts') resolve('Posts content: Articles rendered with use() and useTransition.');
            else resolve('About content: Concurrent rendering keeps old UI visible while loading.');
          }, Number(delayMs) || 600);
        })
      );
    }
    return cacheRef.current.get(tab);
  }, [delayMs, load]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <TabbedViewer load={handleLoad} />
    </div>
  );
}

<Demo />
