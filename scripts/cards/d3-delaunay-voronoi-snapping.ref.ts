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
  onHoverPoint?: (point: VoronoiPoint | null, index: number | null) => void;
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
    pointColor = '#3b82f6',
    activeColor = '#f97316',
    showCells = true,
    onHoverPoint,
    onSelectPoint,
  } = options;

  container.innerHTML = '';

  const safePoints: VoronoiPoint[] = Array.isArray(points) ? points : [];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Voronoi diagram');

  const pointsLayer = svg.append('g').attr('class', 'points-layer');
  const cellsLayer = svg.append('g').attr('class', 'cells-layer');

  let delaunay: d3.Delaunay<VoronoiPoint> | null = null;
  if (safePoints.length > 0) {
    delaunay = d3.Delaunay.from(
      safePoints,
      (d: VoronoiPoint) => d.x,
      (d: VoronoiPoint) => d.y
    );
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    const circles = pointsLayer
      .selectAll<VoronoiPoint>('circle.voronoi-point')
      .data(safePoints)
      .enter()
      .append('circle')
      .attr('class', 'voronoi-point')
      .attr('cx', (d: VoronoiPoint) => d.x)
      .attr('cy', (d: VoronoiPoint) => d.y)
      .attr('r', pointRadius)
      .attr('fill', pointColor)
      .attr('data-index', (_: VoronoiPoint, i: number) => String(i))
      .attr('data-x', (d: VoronoiPoint) => String(d.x))
      .attr('data-y', (d: VoronoiPoint) => String(d.y))
      .attr('data-active', 'false')
      .each(function (this: any, d: VoronoiPoint) {
        if (d.label !== undefined) {
          d3.select(this).attr('data-label', d.label);
        }
      });

    const setActive = (activeIndex: number) => {
      circles
        .attr('data-active', (_: VoronoiPoint, i: number) =>
          i === activeIndex ? 'true' : 'false'
        )
        .attr('fill', (_: VoronoiPoint, i: number) =>
          i === activeIndex ? activeColor : pointColor
        )
        .attr('r', (_: VoronoiPoint, i: number) =>
          i === activeIndex ? pointRadius * 1.75 : pointRadius
        );
    };

    cellsLayer
      .selectAll<VoronoiPoint>('path.voronoi-cell')
      .data(safePoints)
      .enter()
      .append('path')
      .attr('class', 'voronoi-cell')
      .attr('d', (_: VoronoiPoint, i: number) => voronoi.renderCell(i))
      .attr('data-index', (_: VoronoiPoint, i: number) => String(i))
      .attr('fill', 'transparent')
      .attr('stroke', showCells ? '#94a3b8' : 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', function (_: any, d: VoronoiPoint) {
        const idx = safePoints.indexOf(d);
        setActive(idx);
        if (typeof onHoverPoint === 'function') {
          onHoverPoint(d, idx);
        }
      })
      .on('mouseleave', function () {
        setActive(-1);
        if (typeof onHoverPoint === 'function') {
          onHoverPoint(null, null);
        }
      })
      .on('click', function (_: any, d: VoronoiPoint) {
        const idx = safePoints.indexOf(d);
        setActive(idx);
        if (typeof onSelectPoint === 'function') {
          onSelectPoint(d, idx);
        }
      });
  }

  return {
    svg: svg.node() as SVGSVGElement,
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

