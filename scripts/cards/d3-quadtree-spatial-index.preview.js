const DEFAULT_QUAD_POINTS = [
  { x: 40, y: 50, id: 'P1' },
  { x: 80, y: 120, id: 'P2' },
  { x: 120, y: 60, id: 'P3' },
  { x: 160, y: 200, id: 'P4' },
  { x: 200, y: 140, id: 'P5' },
  { x: 240, y: 80, id: 'P6' },
  { x: 280, y: 220, id: 'P7' },
  { x: 320, y: 110, id: 'P8' },
  { x: 360, y: 170, id: 'P9' },
  { x: 400, y: 90, id: 'P10' },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      points: DEFAULT_QUAD_POINTS,
      width: 440,
      height: 280,
      searchRadius: 45,
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  function render(props) {
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.padding = '12px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'system-ui, sans-serif';

    const width = typeof props.width === 'number' ? props.width : 440;
    const height = typeof props.height === 'number' ? props.height : 280;
    const searchRadius = typeof props.searchRadius === 'number' ? props.searchRadius : 45;

    const points =
      Array.isArray(props.points) && props.points.length > 0
        ? props.points
        : DEFAULT_QUAD_POINTS;

    const index = createQuadtreeIndex(points);

    const statsBar = document.createElement('div');
    statsBar.style.display = 'flex';
    statsBar.style.gap = '16px';
    statsBar.style.fontSize = '12px';
    statsBar.style.color = 'slategray';
    statsBar.innerHTML = `
      <span>Indexed: <strong style="color: steelblue;">${index.size()}</strong></span>
      <span>Radius: <strong style="color: orange;">${searchRadius}px</strong></span>
      <span id="quad-status" style="color: seagreen;">Hover canvas to search</span>
    `;
    container.appendChild(statsBar);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'rgba(15, 23, 42, 0.75)')
      .style('border-radius', '8px')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)')
      .style('cursor', 'crosshair');

    const gridGroup = svg.append('g').attr('class', 'quad-grid');
    const pointsGroup = svg.append('g').attr('class', 'quad-points');
    const searchGroup = svg.append('g').attr('class', 'quad-search');

    const quads = [];
    index.tree.visit(function (_node, x0, y0, x1, y1) {
      quads.push({ x0, y0, x1, y1 });
      return false;
    });

    gridGroup
      .selectAll('rect.quad-cell')
      .data(quads)
      .join('rect')
      .attr('class', 'quad-cell')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);

    const pointDots = pointsGroup
      .selectAll('circle.point-dot')
      .data(points)
      .join('circle')
      .attr('class', 'point-dot')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 4)
      .attr('fill', 'steelblue')
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5);

    const searchCircle = searchGroup
      .append('circle')
      .attr('r', searchRadius)
      .attr('fill', 'rgba(70, 130, 180, 0.1)')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('display', 'none');

    const connectorLine = searchGroup
      .append('line')
      .attr('stroke', 'seagreen')
      .attr('stroke-width', 2)
      .style('display', 'none');

    const statusEl = statsBar.querySelector('#quad-status');

    svg.on('mousemove', function (event) {
      const [mx, my] = d3.pointer(event);
      searchCircle.attr('cx', mx).attr('cy', my).style('display', 'block');

      const matches = index.findPointsInRadius(mx, my, searchRadius);
      const nearest = index.findNearest(mx, my, searchRadius);

      const matchSet = new Set(matches);
      pointDots
        .attr('fill', (d) => (d === nearest ? 'crimson' : matchSet.has(d) ? 'seagreen' : 'steelblue'))
        .attr('r', (d) => (d === nearest ? 6.5 : matchSet.has(d) ? 5.5 : 4));

      if (nearest) {
        connectorLine
          .attr('x1', mx)
          .attr('y1', my)
          .attr('x2', nearest.x)
          .attr('y2', nearest.y)
          .style('display', 'block');
      } else {
        connectorLine.style('display', 'none');
      }

      if (statusEl) {
        statusEl.textContent = `Found ${matches.length} within radius${nearest ? ` · Nearest: ${nearest.id ?? 'point'}` : ''}`;
      }
    });

    svg.on('mouseleave', function () {
      searchCircle.style('display', 'none');
      connectorLine.style('display', 'none');
      pointDots.attr('fill', 'steelblue').attr('r', 4);
      if (statusEl) {
        statusEl.textContent = 'Hover canvas to search';
      }
    });

    svg.on('click', function (event) {
      const [mx, my] = d3.pointer(event);
      const matches = index.findPointsInRadius(mx, my, searchRadius);
      const nearest = index.findNearest(mx, my, searchRadius);
      if (typeof log === 'function') {
        log('spatialSearch', mx, my, matches.length);
      }
    });
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
