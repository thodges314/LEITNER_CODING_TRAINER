interface VoronoiPoint {
  x: number;
  y: number;
  id?: string | number;
  label?: string;
}

interface VoronoiSnappingOptions {
  width?: number;
  height?: number;
  pointRadius?: number;
  pointColor?: string;
  activeColor?: string;
  showCells?: boolean;
  onSelectPoint?: (point: VoronoiPoint, index: number) => void;
}

interface VoronoiSnappingInstance {
  svg: SVGSVGElement;
  findClosestIndex: (x: number, y: number) => number;
  destroy: () => void;
}

function renderVoronoiSnapping(
  container: HTMLElement,
  points: VoronoiPoint[] = [],
  options: VoronoiSnappingOptions = {}
): VoronoiSnappingInstance {
  const {
    width = 450,
    height = 300,
    pointRadius = 4,
    pointColor = 'steelblue',
    activeColor = 'orange',
    showCells = true,
    onSelectPoint,
  } = options;

  container.innerHTML = '';

  const safePoints: VoronoiPoint[] = Array.isArray(points) ? points : [];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const pointsLayer = svg.append('g').attr('class', 'points-layer');
  const cellsLayer = svg.append('g').attr('class', 'cells-layer');

  let delaunay: any = null;
  if (safePoints.length > 0) {
    delaunay = d3.Delaunay.from(
      safePoints,
      (d: VoronoiPoint) => d.x,
      (d: VoronoiPoint) => d.y
    );
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    const circles = pointsLayer
      .selectAll('circle.voronoi-point')
      .data(safePoints)
      .join('circle')
      .attr('class', 'voronoi-point')
      .attr('cx', (d: VoronoiPoint) => d.x)
      .attr('cy', (d: VoronoiPoint) => d.y)
      .attr('r', pointRadius)
      .attr('fill', pointColor);

    const setActive = (activeIndex: number) => {
      circles
        .attr('fill', (_: VoronoiPoint, i: number) => (i === activeIndex ? activeColor : pointColor))
        .attr('r', (_: VoronoiPoint, i: number) =>
          i === activeIndex ? pointRadius * 1.75 : pointRadius
        );
    };

    cellsLayer
      .selectAll('path.voronoi-cell')
      .data(safePoints)
      .join('path')
      .attr('class', 'voronoi-cell')
      .attr('d', (_: VoronoiPoint, i: number) => voronoi.renderCell(i))
      .attr('fill', 'transparent')
      .attr('stroke', showCells ? 'gray' : 'none')
      .attr('pointer-events', 'all')
      .on('click', function (_: MouseEvent, d: VoronoiPoint) {
        const idx = safePoints.indexOf(d);
        setActive(idx);
        if (typeof onSelectPoint === 'function') {
          onSelectPoint(d, idx);
        }
      });
  }

  return {
    svg: (svg.node() as SVGSVGElement | null)!,
    findClosestIndex(x: number, y: number): number {
      if (!delaunay || safePoints.length === 0) return -1;
      const idx = delaunay.find(x, y);
      return typeof idx === 'number' && idx >= 0 ? idx : -1;
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
