interface BarDatum {
  label: string;
  value: number;
}

interface Margin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface BarChartOptions {
  width?: number;
  height?: number;
  margin?: Margin;
  color?: string;
  onSelectBar?: (datum: BarDatum, index: number) => void;
}

interface BarChartInstance {
  svg: SVGSVGElement;
  destroy: () => void;
}

function renderBarChart(
  container: HTMLElement,
  data: BarDatum[] = [],
  options: BarChartOptions = {}
): BarChartInstance {
  const {
    width = 400,
    height = 260,
    margin: customMargin = {},
    color = 'steelblue',
    onSelectBar,
  } = options;

  container.innerHTML = '';

  const margin = {
    top: customMargin.top ?? 20,
    right: customMargin.right ?? 20,
    bottom: customMargin.bottom ?? 40,
    left: customMargin.left ?? 40,
  };

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg
    .append('g')
    .attr('class', 'chart-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const labels = data.map((d: BarDatum) => d.label);
  const maxVal = d3.max(data, (d: BarDatum) => d.value) || 0;

  const xScale = d3
    .scaleBand()
    .domain(labels)
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxVal])
    .nice()
    .range([innerHeight, 0]);

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  g.selectAll('rect.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', (d: BarDatum) => xScale(d.label) ?? 0)
    .attr('y', (d: BarDatum) => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', (d: BarDatum) => Math.max(0, innerHeight - yScale(d.value)))
    .attr('fill', color)
    .on('click', (_: any, d: BarDatum) => {
      if (typeof onSelectBar === 'function') {
        const idx = data.indexOf(d);
        onSelectBar(d, idx);
      }
    });

  return {
    svg: svg.node() as SVGSVGElement,
    destroy() {
      container.innerHTML = '';
    },
  };
}
