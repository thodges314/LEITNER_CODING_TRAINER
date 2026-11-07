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
    onSelectBand,
  } = options;

  container.innerHTML = '';

  const pts: DensityPoint[] = Array.isArray(points) ? points : [];

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

  const bands: ContourBandSummary[] = contours.map((c: d3.ContourMultiPolygon, i: number) => ({
    index: i,
    value: c.value,
    ringCount: Array.isArray(c.coordinates)
      ? c.coordinates.reduce((sum: number, poly: any) => sum + (Array.isArray(poly) ? poly.length : 0), 0)
      : 0,
  }));

  const geoPath = d3.geoPath();

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const bandsGroup = svg.append('g').attr('class', 'contour-bands');
  const pointsGroup = svg.append('g').attr('class', 'density-points');

  bandsGroup
    .selectAll('path.contour-band')
    .data(contours)
    .join('path')
    .attr('class', 'contour-band')
    .attr('d', (c: d3.ContourMultiPolygon) => geoPath(c) || '')
    .attr('fill', (_c: d3.ContourMultiPolygon, i: number) =>
      d3.interpolateBlues((i + 1) / Math.max(1, contours.length))
    )
    .attr('fill-opacity', '0.55')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', '1')
    .on('click', function (_event: MouseEvent, c: d3.ContourMultiPolygon) {
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
      .attr('fill', 'white');
  }

  return {
    svg: (svg.node() as SVGSVGElement | null)!,
    contours,
    getBands() {
      return bands.map((b: ContourBandSummary) => ({ ...b }));
    },
    getPeakDensity() {
      if (bands.length === 0) return 0;
      return Math.max(...bands.map((b: ContourBandSummary) => b.value));
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
