const DEFAULT_SIM_NODES = [
  { id: 'Core', radius: 14 },
  { id: 'Auth', radius: 11 },
  { id: 'API', radius: 12 },
  { id: 'Cache', radius: 10 },
  { id: 'DB', radius: 12 },
  { id: 'Worker', radius: 10 },
  { id: 'Search', radius: 10 },
];

const DEFAULT_SIM_LINKS = [
  { source: 'Core', target: 'Auth' },
  { source: 'Core', target: 'API' },
  { source: 'API', target: 'Cache' },
  { source: 'API', target: 'DB' },
  { source: 'API', target: 'Search' },
  { source: 'DB', target: 'Worker' },
  { source: 'Cache', target: 'Worker' },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      chargeStrength: -160,
      linkDistance: 65,
      collisionRadius: 12,
      maxTicks: 150,
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  function render(props) {
    container.innerHTML = '';

    const width = 440;
    const height = 270;
    const chargeStrength =
      typeof props.chargeStrength === 'number' ? props.chargeStrength : -160;
    const linkDistance =
      typeof props.linkDistance === 'number' ? props.linkDistance : 65;
    const collisionRadius =
      typeof props.collisionRadius === 'number' ? props.collisionRadius : 12;
    const maxTicks = typeof props.maxTicks === 'number' ? props.maxTicks : 150;

    const report = runHeadlessForceSimulation(DEFAULT_SIM_NODES, DEFAULT_SIM_LINKS, {
      width,
      height,
      chargeStrength,
      linkDistance,
      collisionRadius,
      alphaMin: 0.01,
      maxTicks,
    });

    if (typeof log === 'function') {
      log('simulationReport', {
        ticks: report.ticks,
        finalAlpha: Number(report.finalAlpha.toFixed(4)),
        converged: report.converged,
      });
    }

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'rgba(15, 23, 42, 0.75)')
      .style('border-radius', '8px')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)');

    svg
      .append('g')
      .attr('class', 'sim-links')
      .selectAll('line')
      .data(report.links)
      .join('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('stroke', 'rgba(148, 163, 184, 0.45)')
      .attr('stroke-width', 1.5);

    const nodeGroups = svg
      .append('g')
      .attr('class', 'sim-nodes')
      .selectAll('g.sim-node')
      .data(report.nodes)
      .join('g')
      .attr('class', 'sim-node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', function (_event, d) {
        if (typeof log === 'function') {
          log('onSelectNode', d.id, Math.round(d.x), Math.round(d.y));
        }
      });

    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d, i) => (i === 0 ? 'orange' : 'steelblue'))
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5);

    nodeGroups
      .append('text')
      .attr('dy', (d) => d.radius + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .text((d) => d.id);
  }

  render(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function (newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      render(currentProps);
    });
  }
})();
