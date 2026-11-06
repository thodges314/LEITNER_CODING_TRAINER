function renderTreemap(container, data, options = {}) {
  const {
    width = 480,
    height = 320,
    paddingInner = 2,
    paddingOuter = 2,
    round = true,
    onSelectCell,
  } = options;

  container.innerHTML = '';

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Treemap chart');

  let leafMetrics = [];

  if (data && typeof data === 'object') {
    const root = d3
      .hierarchy(data)
      .sum((d) =>
        !d.children || d.children.length === 0 ? Math.max(0, Number(d.value) || 0) : 0
      )
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    if ((root.value || 0) > 0) {
      const treemapLayout = d3
        .treemap()
        .tile(d3.treemapSquarify)
        .size([width, height])
        .paddingInner(paddingInner)
        .paddingOuter(paddingOuter)
        .round(round);

      const rectRoot = treemapLayout(root);
      const validLeaves = rectRoot.leaves().filter((leaf) => (leaf.value || 0) > 0);

      leafMetrics = validLeaves.map((leaf) => ({
        name: leaf.data.name,
        value: leaf.value || 0,
        x0: leaf.x0,
        y0: leaf.y0,
        x1: leaf.x1,
        y1: leaf.y1,
        width: Math.max(0, leaf.x1 - leaf.x0),
        height: Math.max(0, leaf.y1 - leaf.y0),
        depth: leaf.depth,
      }));

      const cells = svg
        .selectAll('g.treemap-cell')
        .data(leafMetrics)
        .enter()
        .append('g')
        .attr('class', 'treemap-cell')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)
        .attr('data-name', (d) => d.name)
        .attr('data-value', (d) => String(d.value))
        .attr('data-index', (_, i) => String(i))
        .on('click', function (_, d) {
          if (typeof onSelectCell === 'function') {
            const idx = leafMetrics.indexOf(d);
            onSelectCell(d, idx);
          }
        });

      cells
        .append('rect')
        .attr('class', 'treemap-rect')
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('fill', (_, i) => d3.schemeTableau10[i % 10])
        .attr('data-name', (d) => d.name)
        .attr('data-value', (d) => String(d.value));

      cells
        .append('text')
        .attr('class', 'treemap-label')
        .attr('x', 6)
        .attr('y', 16)
        .text((d) => d.name);
    }
  }

  return {
    svg: svg.node(),
    getLeaves() {
      return leafMetrics.slice();
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}

