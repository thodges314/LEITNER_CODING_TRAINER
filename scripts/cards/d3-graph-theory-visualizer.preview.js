const DEFAULT_NODES = [
  { id: '1', label: 'Router' },
  { id: '2', label: 'Server A' },
  { id: '3', label: 'Server B' },
  { id: '4', label: 'Client 1' },
  { id: '5', label: 'Client 2' },
];

const DEFAULT_LINKS = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '5' },
];

function Demo() {
  const {
    nodes = DEFAULT_NODES,
    links = DEFAULT_LINKS,
    width = 400,
    height = 300,
  } = usePreviewProps({
    nodes: DEFAULT_NODES,
    links: DEFAULT_LINKS,
    width: 400,
    height: 300,
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = renderForceGraph(containerRef.current, {
      nodes,
      links,
      width: Number(width) || 400,
      height: Number(height) || 300,
      onSelectNode: (node) => log('selectNode', node),
    });

    return () => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    };
  }, [nodes, links, width, height]);

  return (
    <div style={{ padding: '16px' }}>
      <div ref={containerRef} />
    </div>
  );
}

<Demo />
