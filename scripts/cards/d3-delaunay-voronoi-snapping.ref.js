function renderVoronoiSnapping(container, points = [], options = {}) {
  const {
    width = 450,
    height = 300,
    pointRadius = 4,
    pointColor = '#3b82f6',
    activeColor = '#f97316',
    showCells = true,
    onSelectPoint,
  } = options;

  container.innerHTML = '';

  const safePoints = Array.isArray(points) ? points : [];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Voronoi diagram');

  const pointsLayer = svg.append('g').attr('class', 'points-layer');
  const cellsLayer = svg.append('g').attr('class', 'cells-layer');

  let delaunay = null;
  if (safePoints.length > 0) {
    delaunay = d3.Delaunay.from(
      safePoints,
      (d) => d.x,
      (d) => d.y
    );
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    const circles = pointsLayer
      .selectAll('circle.voronoi-point')
      .data(safePoints)
      .enter()
      .append('circle')
      .attr('class', 'voronoi-point')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', pointRadius)
      .attr('fill', pointColor)
      .attr('data-index', (_, i) => String(i))
      .attr('data-x', (d) => String(d.x))
      .attr('data-y', (d) => String(d.y))
      .attr('data-active', 'false')
      .each(function (d) {
        if (d.label !== undefined) {
          d3.select(this).attr('data-label', d.label);
        }
      });

    const setActive = (activeIndex) => {
      circles
        .attr('data-active', (_, i) => (i === activeIndex ? 'true' : 'false'))
        .attr('fill', (_, i) => (i === activeIndex ? activeColor : pointColor))
        .attr('r', (_, i) => (i === activeIndex ? pointRadius * 1.75 : pointRadius));
    };

    cellsLayer
      .selectAll('path.voronoi-cell')
      .data(safePoints)
      .enter()
      .append('path')
      .attr('class', 'voronoi-cell')
      .attr('d', (_, i) => voronoi.renderCell(i))
      .attr('data-index', (_, i) => String(i))
      .attr('fill', 'transparent')
      .attr('stroke', showCells ? '#94a3b8' : 'none')
      .attr('pointer-events', 'all')
      .on('click', function (_, d) {
        const idx = safePoints.indexOf(d);
        setActive(idx);
        if (typeof onSelectPoint === 'function') {
          onSelectPoint(d, idx);
        }
      });
  }

  return {
    svg: svg.node(),
    findClosestIndex(x, y) {
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

