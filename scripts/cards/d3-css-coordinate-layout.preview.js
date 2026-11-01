const DEFAULT_POINTS = [
  { id: '1', x: 10, y: 20, value: 15, label: 'A', color: 'steelblue' },
  { id: '2', x: 80, y: 75, value: 45, label: 'B', color: 'seagreen' },
  { id: '3', x: 45, y: 90, value: 30, label: 'C', color: 'crimson' },
  { id: '4', x: 70, y: 30, value: 20, label: 'D', color: 'purple' },
  { id: '5', x: 30, y: 55, value: 40, label: 'E', color: 'teal' },
];

function Demo() {
  const {
    data = DEFAULT_POINTS,
    width = 400,
    height = 280,
  } = usePreviewProps({
    data: DEFAULT_POINTS,
    width: 400,
    height: 280,
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = renderCoordinateLayout(containerRef.current, {
      data,
      width: Number(width) || 400,
      height: Number(height) || 280,
      onSelectPoint: (p) => log('selectPoint', p),
    });
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [data, width, height]);

  return (
    <div style={{ padding: '16px' }}>
      <div ref={containerRef} />
    </div>
  );
}

<Demo />
