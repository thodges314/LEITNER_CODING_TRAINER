interface TreemapNodeData {
  name: string;
  value?: number;
  children?: TreemapNodeData[];
}

interface TreemapCellMetric {
  name: string;
  value: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
  depth: number;
}

interface TreemapOptions {
  width?: number;
  height?: number;
  paddingInner?: number;
  paddingOuter?: number;
  round?: boolean;
  colors?: string[];
  onSelectCell?: (cell: TreemapCellMetric, index: number) => void;
}

interface TreemapInstance {
  svg: SVGSVGElement;
  getLeaves: () => TreemapCellMetric[];
  destroy: () => void;
}

function renderTreemap(
  container: HTMLElement,
  data: TreemapNodeData,
  options: TreemapOptions = {}
): TreemapInstance {
  const {
    width = 480,
    height = 320,
    paddingInner = 2,
    paddingOuter = 2,
    round = true,
    colors,
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

  const palette: string[] =
    Array.isArray(colors) && colors.length > 0
      ? colors
      : d3.schemeTableau10 || [
          '#4e79a7',
          '#f28e2c',
          '#e15759',
          '#76b7b2',
          '#59a14f',
          '#edc949',
          '#af7aa1',
          '#ff9da7',
          '#9c755f',
          '#bab0ab',
        ];

  let leafMetrics: TreemapCellMetric[] = [];

  if (data && typeof data === 'object') {
    const root = d3
      .hierarchy<TreemapNodeData>(data)
      .sum((d: TreemapNodeData) =>
        !d.children || d.children.length === 0 ? Math.max(0, Number(d.value) || 0) : 0
      )
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    if ((root.value || 0) > 0) {
      const treemapLayout = d3
        .treemap<TreemapNodeData>()
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
        .selectAll<TreemapCellMetric>('g.treemap-cell')
        .data(leafMetrics)
        .enter()
        .append('g')
        .attr('class', 'treemap-cell')
        .attr('transform', (d: TreemapCellMetric) => `translate(${d.x0}, ${d.y0})`)
        .attr('data-name', (d: TreemapCellMetric) => d.name)
        .attr('data-value', (d: TreemapCellMetric) => String(d.value))
        .attr('data-index', (_: TreemapCellMetric, i: number) => String(i))
        .on('click', function (_: any, d: TreemapCellMetric) {
          if (typeof onSelectCell === 'function') {
            const idx = leafMetrics.indexOf(d);
            onSelectCell(d, idx);
          }
        });

      cells
        .append('rect')
        .attr('class', 'treemap-rect')
        .attr('width', (d: TreemapCellMetric) => d.width)
        .attr('height', (d: TreemapCellMetric) => d.height)
        .attr('fill', (_: TreemapCellMetric, i: number) => palette[i % palette.length])
        .attr('data-name', (d: TreemapCellMetric) => d.name)
        .attr('data-value', (d: TreemapCellMetric) => String(d.value));

      cells
        .append('text')
        .attr('class', 'treemap-label')
        .attr('x', 6)
        .attr('y', 16)
        .text((d: TreemapCellMetric) => d.name);
    }
  }

  return {
    svg: svg.node() as SVGSVGElement,
    getLeaves(): TreemapCellMetric[] {
      return leafMetrics.slice();
    },
    destroy() {
      svg.remove();
      container.innerHTML = '';
    },
  };
}

