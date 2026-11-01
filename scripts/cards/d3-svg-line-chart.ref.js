function renderLineChart(container, data = [], options = {}) {
  const {
    width = 420,
    height = 260,
    margin: customMargin = {},
    strokeColor = '#38bdf8',
    strokeWidth = 2,
    showPoints = true,
    onSelectPoint,
  } = options;

  container.innerHTML = '';

  const margin = {
    top: customMargin.top ?? 20,
    right: customMargin.right ?? 20,
    bottom: customMargin.bottom ?? 35,
    left: customMargin.left ?? 40,
  };

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Line chart');

  const g = svg
    .append('g')
    .attr('class', 'chart-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xExtent = d3.extent(data, (d) => d.x);
  const xDomain = data.length > 0 && xExtent[0] !== undefined ? [xExtent[0], xExtent[1]] : [0, 1];
  const maxY = d3.max(data, (d) => d.y);
  const yDomain = data.length > 0 && maxY !== undefined ? [0, maxY] : [0, 1];

  const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  g.append('path')
    .datum(data)
    .attr('class', 'chart-line')
    .attr('fill', 'none')
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .attr('d', lineGenerator);

  if (showPoints) {
    g.selectAll('circle.chart-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'chart-point')
      .attr('data-x', (d) => d.x)
      .attr('data-y', (d) => d.y)
      .attr('data-index', (_, i) => i)
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', strokeColor)
      .on('click', (_, d) => {
        if (typeof onSelectPoint === 'function') {
          const idx = data.indexOf(d);
          onSelectPoint(d, idx);
        }
      });
  }

  return {
    svg: svg.node(),
    destroy() {
      container.innerHTML = '';
    },
  };
}
