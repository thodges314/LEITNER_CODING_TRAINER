interface CategoryMetric {
  category: string;
  value: number;
}

interface BarGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
}

interface ScaleChartOptions {
  width?: number;
  height?: number;
  padding?: number;
  paddingInner?: number;
  clamp?: boolean;
  barColor?: string;
}

interface ScaleChartInstance {
  svg: SVGSVGElement;
  getDomainExtent: () => [number, number];
  getBarGeometry: (category: string, value: number) => BarGeometry | null;
  invertY: (pixelY: number) => number;
  destroy: () => void;
}

function renderScaledCoordinateChart(
  container: HTMLElement,
  data: CategoryMetric[],
  options: ScaleChartOptions = {}
): ScaleChartInstance {
  const {
    width = 440,
    height = 240,
    padding = 32,
    paddingInner = 0.2,
    clamp = true,
    barColor = 'steelblue',
  } = options;

  const root = d3.select(container);
  root.selectAll('*').remove();

  const items = Array.isArray(data) ? data : [];
  const rawExtent = d3.extent(items, (d: CategoryMetric) => d.value);
  const minVal = rawExtent[0] !== undefined ? rawExtent[0] : 0;
  const maxVal = rawExtent[1] !== undefined ? rawExtent[1] : 0;
  const upperBound = maxVal > 0 ? maxVal : 100;

  const xScale = d3
    .scaleBand<string>()
    .domain(items.map((d) => d.category))
    .range([padding, width - padding])
    .paddingInner(paddingInner);

  const yScale = d3
    .scaleLinear()
    .domain([0, upperBound])
    .range([height - padding, padding])
    .clamp(Boolean(clamp));

  function getBarGeometry(category: string, value: number): BarGeometry | null {
    const x = xScale(category);
    if (x === undefined) return null;
    const barWidth = xScale.bandwidth();
    const y = yScale(value);
    const baselineY = yScale(0);
    const barHeight = Math.max(0, baselineY - y);
    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      centerX: x + barWidth / 2,
    };
  }

  const svgSel = root
    .append('svg')
    .attr('width', String(width))
    .attr('height', String(height))
    .attr('role', 'img')
    .attr('aria-label', 'Scaled coordinate chart');

  const baselineY = height - padding;
  svgSel
    .append('line')
    .attr('class', 'zero-baseline')
    .attr('x1', String(padding))
    .attr('y1', String(baselineY))
    .attr('x2', String(width - padding))
    .attr('y2', String(baselineY))
    .attr('stroke', 'gray');

  const barsGroup = svgSel.append('g').attr('class', 'scaled-bars');

  barsGroup
    .selectAll<CategoryMetric>('rect.scale-bar')
    .data(items, (d: CategoryMetric) => d.category)
    .join('rect')
    .attr('class', 'scale-bar')
    .attr('data-category', (d) => d.category)
    .attr('x', (d) => {
      const g = getBarGeometry(d.category, d.value);
      return String(g ? g.x : 0);
    })
    .attr('y', (d) => {
      const g = getBarGeometry(d.category, d.value);
      return String(g ? g.y : baselineY);
    })
    .attr('width', (d) => {
      const g = getBarGeometry(d.category, d.value);
      return String(g ? g.width : 0);
    })
    .attr('height', (d) => {
      const g = getBarGeometry(d.category, d.value);
      return String(g ? g.height : 0);
    })
    .attr('fill', barColor);

  return {
    svg: svgSel.node() as SVGSVGElement,
    getDomainExtent(): [number, number] {
      return [minVal, maxVal];
    },
    getBarGeometry,
    invertY(pixelY: number): number {
      return yScale.invert(pixelY);
    },
    destroy(): void {
      svgSel.remove();
      container.innerHTML = '';
    },
  };
}
