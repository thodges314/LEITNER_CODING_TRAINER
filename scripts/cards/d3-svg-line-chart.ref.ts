interface LinePoint {
  x: number;
  y: number;
}

interface Margin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface LineChartOptions {
  width?: number;
  height?: number;
  margin?: Margin;
  strokeColor?: string;
  strokeWidth?: number;
  showPoints?: boolean;
  onSelectPoint?: (point: LinePoint, index: number) => void;
}

interface LineChartInstance {
  svg: SVGSVGElement;
  destroy: () => void;
}

function renderLineChart(
  container: HTMLElement,
  data: LinePoint[] = [],
  options: LineChartOptions = {}
): LineChartInstance {
  const {
    width = 420,
    height = 260,
    margin: customMargin = {},
    strokeColor = 'steelblue',
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

  const xExtent = d3.extent(data, (d: LinePoint) => d.x);
  const xDomain = data.length > 0 && xExtent[0] !== undefined ? [xExtent[0], xExtent[1]] : [0, 1];
  const maxY = d3.max(data, (d: LinePoint) => d.y);
  const yDomain = data.length > 0 && maxY !== undefined ? [0, maxY] : [0, 1];

  const xScale = d3.scaleLinear().domain(xDomain as [number, number]).range([0, innerWidth]);
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
    .x((d: LinePoint) => xScale(d.x))
    .y((d: LinePoint) => yScale(d.y))
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
      .attr('data-x', (d: LinePoint) => d.x)
      .attr('data-y', (d: LinePoint) => d.y)
      .attr('data-index', (_: any, i: number) => i)
      .attr('cx', (d: LinePoint) => xScale(d.x))
      .attr('cy', (d: LinePoint) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', strokeColor)
      .on('click', (_: any, d: LinePoint) => {
        if (typeof onSelectPoint === 'function') {
          const idx = data.indexOf(d);
          onSelectPoint(d, idx);
        }
      });
  }

  return {
    svg: svg.node() as SVGSVGElement,
    destroy() {
      container.innerHTML = '';
    },
  };
}
