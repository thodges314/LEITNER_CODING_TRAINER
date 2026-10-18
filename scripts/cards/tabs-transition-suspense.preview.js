function Demo() {
  const cacheRef = useRef(new Map());

  const load = useCallback((tab) => {
    if (!cacheRef.current.has(tab)) {
      cacheRef.current.set(
        tab,
        new Promise((resolve) => {
          setTimeout(() => {
            log('tabLoaded', tab);
            if (tab === 'home') resolve('Home content: Welcome to the React 19 transition demo!');
            else if (tab === 'posts') resolve('Posts content: Articles rendered with use() and useTransition.');
            else resolve('About content: Concurrent rendering keeps old UI visible while loading.');
          }, 600);
        })
      );
    }
    return cacheRef.current.get(tab);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <TabbedViewer load={load} />
    </div>
  );
}

<Demo />
