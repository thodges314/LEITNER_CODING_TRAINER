interface ScatterDatum {
  x: number;
  y: number;
  label?: string;
  radius?: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ScatterPlotOptions {
  width?: number;
  height?: number;
  margin?: Partial<Margin>;
  defaultRadius?: number;
  color?: string;
  onSelectPoint?: (datum: ScatterDatum, index: number) => void;
}

interface ScatterPlotInstance {
  svg: SVGSVGElement;
  destroy: () => void;
}

function renderScatterPlot(
  container: HTMLElement,
  data: ScatterDatum[],
  options: ScatterPlotOptions = {}
): ScatterPlotInstance {
  const {
    width = 450,
    height = 300,
    margin: customMargin = {},
    defaultRadius = 5,
    color = '#3b82f6',
    onSelectPoint,
  } = options;

  const margin: Margin = Object.assign({ top: 20, right: 20, bottom: 40, left: 40 }, customMargin);
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  container.innerHTML = '';

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Scatter plot');

  const g = svg
    .append('g')
    .attr('class', 'chart-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const points: ScatterDatum[] = Array.isArray(data) ? data : [];
  const xExtent = d3.extent(points, (d: ScatterDatum) => d.x);
  const yExtent = d3.extent(points, (d: ScatterDatum) => d.y);

  const xDomain = xExtent[0] !== undefined && xExtent[1] !== undefined ? xExtent : [0, 1];
  const yDomain = yExtent[0] !== undefined && yExtent[1] !== undefined ? yExtent : [0, 1];

  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .nice()
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .nice()
    .range([innerHeight, 0]);

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  g.selectAll('circle.scatter-dot')
    .data(points)
    .enter()
    .append('circle')
    .attr('class', 'scatter-dot')
    .attr('cx', (d: ScatterDatum) => xScale(d.x))
    .attr('cy', (d: ScatterDatum) => yScale(d.y))
    .attr('r', (d: ScatterDatum) => d.radius || defaultRadius)
    .attr('fill', color)
    .attr('data-x', (d: ScatterDatum) => String(d.x))
    .attr('data-y', (d: ScatterDatum) => String(d.y))
    .attr('data-index', (_: any, i: number) => String(i))
    .each(function (this: any, d: ScatterDatum) {
      if (d.label !== undefined) {
        d3.select(this).attr('data-label', d.label);
      }
    })
    .on('click', function (_: any, d: ScatterDatum) {
      if (typeof onSelectPoint === 'function') {
        const index = points.indexOf(d);
        onSelectPoint(d, index >= 0 ? index : 0);
      }
    });

  return {
    svg: svg.node() as SVGSVGElement,
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
