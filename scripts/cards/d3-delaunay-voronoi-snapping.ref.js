function renderVoronoiSnapping(container, points = [], options = {}) {
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

  const safePoints = Array.isArray(points) ? points : [];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

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
      .join('circle')
      .attr('class', 'voronoi-point')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', pointRadius)
      .attr('fill', pointColor);

    const setActive = (activeIndex) => {
      circles
        .attr('fill', (_, i) => (i === activeIndex ? activeColor : pointColor))
        .attr('r', (_, i) => (i === activeIndex ? pointRadius * 1.75 : pointRadius));
    };

    cellsLayer
      .selectAll('path.voronoi-cell')
      .data(safePoints)
      .join('path')
      .attr('class', 'voronoi-cell')
      .attr('d', (_, i) => voronoi.renderCell(i))
      .attr('fill', 'transparent')
      .attr('stroke', showCells ? 'gray' : 'none')
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
