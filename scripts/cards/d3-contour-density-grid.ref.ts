interface DensityPoint {
  x: number;
  y: number;
  weight?: number;
}

interface ContourBandSummary {
  index: number;
  value: number;
  ringCount: number;
}

interface ContourDensityOptions {
  width?: number;
  height?: number;
  bandwidth?: number;
  thresholds?: number;
  cellSize?: number;
  showPoints?: boolean;
  colors?: string[];
  onSelectBand?: (band: ContourBandSummary, index: number) => void;
}

interface ContourDensityInstance {
  svg: SVGSVGElement;
  contours: d3.ContourMultiPolygon[];
  getBands: () => ContourBandSummary[];
  getPeakDensity: () => number;
  destroy: () => void;
}

function renderContourDensity(
  container: HTMLElement,
  points: DensityPoint[],
  options: ContourDensityOptions = {}
): ContourDensityInstance {
  const {
    width = 460,
    height = 300,
    bandwidth = 20,
    thresholds = 8,
    cellSize = 4,
    showPoints = true,
    colors = ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    onSelectBand,
  } = options;

  container.innerHTML = '';

  const pts: DensityPoint[] = Array.isArray(points) ? points : [];
  const palette =
    Array.isArray(colors) && colors.length > 0
      ? colors
      : ['#1e3a8a', '#2563eb', '#60a5fa'];

  let contours: d3.ContourMultiPolygon[] = [];
  if (pts.length > 0) {
    const generator = d3
      .contourDensity<DensityPoint>()
      .x((d: DensityPoint) => d.x)
      .y((d: DensityPoint) => d.y)
      .weight((d: DensityPoint) => (typeof d.weight === 'number' ? d.weight : 1))
      .size([width, height])
      .bandwidth(bandwidth)
      .thresholds(thresholds)
      .cellSize(cellSize);

    contours = generator(pts);
  }

  const bands: ContourBandSummary[] = contours.map((c, i) => ({
    index: i,
    value: c.value,
    ringCount: Array.isArray(c.coordinates)
      ? c.coordinates.reduce(
          (sum: number, poly: number[][][]) => sum + (Array.isArray(poly) ? poly.length : 0),
          0
        )
      : 0,
  }));

  const geoPath = d3.geoPath();

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Contour density chart');

  const bandsGroup = svg.append('g').attr('class', 'contour-bands');
  const pointsGroup = svg.append('g').attr('class', 'density-points');

  bandsGroup
    .selectAll('path.contour-band')
    .data(contours)
    .join('path')
    .attr('class', 'contour-band')
    .attr('d', (c: d3.ContourMultiPolygon) => geoPath(c) || '')
    .attr('fill', (_c: d3.ContourMultiPolygon, i: number) =>
      palette[Math.min(i, palette.length - 1)]
    )
    .attr('fill-opacity', '0.55')
    .attr('stroke', '#38bdf8')
    .attr('stroke-width', '1')
    .attr('data-value', (c: d3.ContourMultiPolygon) => String(c.value))
    .attr('data-index', (_c: d3.ContourMultiPolygon, i: number) => String(i))
    .on('click', function (_event: any, c: d3.ContourMultiPolygon) {
      const idx = contours.indexOf(c);
      const index = idx >= 0 ? idx : 0;
      if (typeof onSelectBand === 'function') {
        onSelectBand({ ...bands[index] }, index);
      }
    });

  if (showPoints !== false) {
    pointsGroup
      .selectAll('circle.density-point')
      .data(pts)
      .join('circle')
      .attr('class', 'density-point')
      .attr('cx', (d: DensityPoint) => d.x)
      .attr('cy', (d: DensityPoint) => d.y)
      .attr('r', 2.5)
      .attr('fill', '#f8fafc');
  }

  return {
    svg: svg.node() as SVGSVGElement,
    contours,
    getBands() {
      return bands.map((b) => ({ ...b }));
    },
    getPeakDensity() {
      if (bands.length === 0) return 0;
      return Math.max(...bands.map((b) => b.value));
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}

