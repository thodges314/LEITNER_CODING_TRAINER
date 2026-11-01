function renderDonutChart(container, data, options = {}) {
  const {
    width = 400,
    height = 300,
    innerRadius = 60,
    outerRadius = Math.min(width, height) / 2 - 20,
    centerLabel = '',
    onSelectSlice,
  } = options;

  container.innerHTML = '';

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Donut chart');

  const g = svg
    .append('g')
    .attr('class', 'chart-donut')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const colorScale = d3.schemeCategory10 || [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  ];

  const pieData = Array.isArray(data) ? pie(data) : [];

  g.selectAll('path.arc-slice')
    .data(pieData)
    .enter()
    .append('path')
    .attr('class', 'arc-slice')
    .attr('d', arc)
    .attr('data-label', (d) => d.data.label)
    .attr('data-value', (d) => String(d.data.value))
    .attr('data-index', (_, i) => String(i))
    .attr('fill', (d, i) => d.data.color || colorScale[i % colorScale.length])
    .on('click', function (_, d) {
      if (typeof onSelectSlice === 'function') {
        onSelectSlice(d.data, d.index !== undefined ? d.index : 0);
      }
    });

  if (centerLabel && typeof centerLabel === 'string') {
    g.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(centerLabel);
  }

  return {
    svg: svg.node(),
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
