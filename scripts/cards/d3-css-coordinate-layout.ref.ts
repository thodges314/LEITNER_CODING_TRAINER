interface CoordinatePoint {
  id: string;
  x: number;
  y: number;
  value: number;
  label: string;
  color?: string;
}

interface D3CoordinateLayoutProps {
  data: CoordinatePoint[];
  width?: number;
  height?: number;
  onSelectPoint?: (point: CoordinatePoint) => void;
}

function D3CoordinateLayout({
  data = [],
  width = 400,
  height = 300,
  onSelectPoint,
}: D3CoordinateLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const padding = 20;

  const xExtent = d3.extent(data, (d: CoordinatePoint) => d.x);
  const xDomain =
    xExtent[0] === undefined || xExtent[0] === xExtent[1]
      ? [0, 100]
      : xExtent;
  const xScale = d3.scaleLinear().domain(xDomain).range([padding, width - padding]);

  const yExtent = d3.extent(data, (d: CoordinatePoint) => d.y);
  const yDomain =
    yExtent[0] === undefined || yExtent[0] === yExtent[1]
      ? [0, 100]
      : yExtent;
  const yScale = d3.scaleLinear().domain(yDomain).range([height - padding, padding]);

  const valExtent = d3.extent(data, (d: CoordinatePoint) => d.value);
  const sizeScale =
    valExtent[0] === undefined || valExtent[0] === valExtent[1]
      ? () => 32
      : d3.scaleLinear().domain(valExtent).range([16, 48]);

  const handleClick = (p: CoordinatePoint) => {
    setSelectedId(p.id);
    if (typeof onSelectPoint === 'function') {
      onSelectPoint(p);
    }
  };

  return (
    <div
      className="coordinate-layout"
      style={{ position: 'relative', width, height }}
    >
      {data.map((p: CoordinatePoint) => {
        const size = sizeScale(p.value);
        const left = xScale(p.x) - size / 2;
        const top = yScale(p.y) - size / 2;
        const isSelected = p.id === selectedId;

        return (
          <div
            key={p.id}
            className="coordinate-point"
            data-point-id={p.id}
            data-label={p.label}
            data-x={p.x}
            data-y={p.y}
            data-selected={isSelected ? 'true' : 'false'}
            onClick={() => handleClick(p)}
            style={{
              position: 'absolute',
              left,
              top,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: isSelected ? 'orange' : (p.color || 'steelblue'),
            }}
          >
            {p.label}
          </div>
        );
      })}
    </div>
  );
}
