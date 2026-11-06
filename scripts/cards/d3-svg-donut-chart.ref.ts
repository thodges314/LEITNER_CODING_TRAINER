interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartOptions {
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  onSelectSlice?: (datum: DonutDatum, index: number) => void;
}

interface DonutChartInstance {
  svg: SVGSVGElement;
  destroy: () => void;
}

function renderDonutChart(
  container: HTMLElement,
  data: DonutDatum[],
  options: DonutChartOptions = {}
): DonutChartInstance {
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
    .value((d: DonutDatum) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const pieData = Array.isArray(data) ? pie(data) : [];

  g.selectAll('path.arc-slice')
    .data(pieData)
    .enter()
    .append('path')
    .attr('class', 'arc-slice')
    .attr('d', arc)
    .attr('data-label', (d: any) => d.data.label)
    .attr('data-value', (d: any) => String(d.data.value))
    .attr('data-index', (_: any, i: number) => String(i))
    .attr('fill', (d: any, i: number) => d.data.color || d3.schemeCategory10[i % 10])
    .on('click', function (_: any, d: any) {
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
    svg: svg.node() as SVGSVGElement,
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
