function renderContourDensity(container, points, options = {}) {
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

  const pts = Array.isArray(points) ? points : [];

  let contours = [];
  if (pts.length > 0) {
    const generator = d3
      .contourDensity()
      .x((d) => d.x)
      .y((d) => d.y)
      .weight((d) => (typeof d.weight === 'number' ? d.weight : 1))
      .size([width, height])
      .bandwidth(bandwidth)
      .thresholds(thresholds)
      .cellSize(cellSize);

    contours = generator(pts);
  }

  const bands = contours.map((c, i) => ({
    index: i,
    value: c.value,
    ringCount: Array.isArray(c.coordinates)
      ? c.coordinates.reduce((sum, poly) => sum + (Array.isArray(poly) ? poly.length : 0), 0)
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
    .attr('d', (c) => geoPath(c) || '')
    .attr('fill', (_c, i) => d3.interpolateBlues((i + 1) / Math.max(1, contours.length)))
    .attr('fill-opacity', '0.55')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', '1')
    .on('click', function (_event, c) {
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
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 2.5)
      .attr('fill', 'white');
  }

  return {
    svg: svg.node(),
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
