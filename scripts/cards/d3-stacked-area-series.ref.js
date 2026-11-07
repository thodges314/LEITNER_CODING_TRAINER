function renderStackedAreaChart(container, data, options = {}) {
  container.innerHTML = '';

  const width = options.width ?? 480;
  const height = options.height ?? 280;
  const keys = options.keys ?? ['desktop', 'mobile', 'tablet'];
  const colors = options.colors ?? ['steelblue', 'seagreen', 'orange'];
  const margin = { top: 15, right: 20, bottom: 25, left: 45 };

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const plotArea = svg
    .append('g')
    .attr('class', 'plot-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const stackGen = d3.stack().keys(keys);
  const layers = stackGen(data);

  const maxY = d3.max(layers, layer => d3.max(layer, d => d[1])) || 1;

  const xScale = d3
    .scalePoint()
    .domain(data.map(d => d.month))
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxY])
    .nice()
    .range([innerHeight, 0]);

  const areaGen = d3
    .area()
    .x(d => xScale(d.data.month))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  const layersGroup = plotArea.append('g').attr('class', 'stacked-layers');

  layers.forEach((layer, i) => {
    const color = colors[i % colors.length];
    layersGroup
      .append('path')
      .datum(layer)
      .attr('class', 'stacked-layer')
      .attr('d', areaGen(layer) || '')
      .attr('fill', color)
      .attr('fill-opacity', '0.75')
      .attr('stroke', color)
      .attr('stroke-width', '1.5')
      .on('click', () => {
        if (typeof options.onSelectLayer === 'function') {
          options.onSelectLayer(layer.key, i);
        }
      });
  });

  plotArea
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  plotArea
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  return {
    svg: svg.node(),
    getLayerKeys: () => [...keys],
    getYDomain: () => yScale.domain(),
    destroy: () => {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
