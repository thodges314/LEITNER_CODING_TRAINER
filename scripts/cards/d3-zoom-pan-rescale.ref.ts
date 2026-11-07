interface ZoomPoint {
  x: number;
  y: number;
  id?: string | number;
}

interface ZoomTransformState {
  k: number;
  x: number;
  y: number;
}

interface ZoomChartOptions {
  width?: number;
  height?: number;
  scaleExtent?: [number, number];
  color?: string;
  onZoomChange?: (transform: ZoomTransformState) => void;
}

interface ZoomChartInstance {
  svg: SVGSVGElement;
  getTransform: () => ZoomTransformState;
  zoomBy: (factor: number) => void;
  resetZoom: () => void;
  destroy: () => void;
}

function renderZoomChart(
  container: HTMLElement,
  data: ZoomPoint[] = [],
  options: ZoomChartOptions = {}
): ZoomChartInstance {
  container.innerHTML = '';

  const width = options.width ?? 480;
  const height = options.height ?? 260;
  const scaleExtent = options.scaleExtent ?? [1, 8];
  const color = options.color ?? 'steelblue';
  const margin = { top: 15, right: 20, bottom: 25, left: 40 };

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const defs = svg.append('defs');
  defs
    .append('clipPath')
    .attr('id', 'zoom-chart-clip')
    .append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  const plotArea = svg
    .append('g')
    .attr('class', 'plot-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const maxX = d3.max(data, d => d.x) || 100;
  const maxY = d3.max(data, d => d.y) || 100;

  const xScale = d3.scaleLinear().domain([0, maxX]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]);

  const dataLayer = plotArea
    .append('g')
    .attr('class', 'data-layer')
    .attr('clip-path', 'url(#zoom-chart-clip)');

  const circles = dataLayer
    .selectAll('circle.data-point')
    .data(data)
    .join('circle')
    .attr('class', 'data-point')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 5)
    .attr('fill', color);

  const xAxisGroup = plotArea
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  plotArea
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent(scaleExtent)
    .extent([
      [0, 0],
      [innerWidth, innerHeight],
    ])
    .on('zoom', event => {
      const transform = event.transform;
      const newXScale = transform.rescaleX(xScale);
      xAxisGroup.call(d3.axisBottom(newXScale));
      circles.attr('cx', d => newXScale(d.x));
      if (typeof options.onZoomChange === 'function') {
        options.onZoomChange({
          k: transform.k,
          x: transform.x,
          y: transform.y,
        });
      }
    });

  svg.call(zoomBehavior);

  return {
    svg: svg.node() as SVGSVGElement,
    getTransform: () => {
      const t = d3.zoomTransform(svg.node());
      return { k: t.k, x: t.x, y: t.y };
    },
    zoomBy: (factor: number) => {
      svg.call(zoomBehavior.scaleBy, factor);
    },
    resetZoom: () => {
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    },
    destroy: () => {
      svg.remove();
      container.innerHTML = '';
    },
  };
}
