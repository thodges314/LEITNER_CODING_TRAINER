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
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.padding = '12px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'system-ui, sans-serif';

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

    const statsBar = document.createElement('div');
    statsBar.style.display = 'flex';
    statsBar.style.flexWrap = 'wrap';
    statsBar.style.gap = '14px';
    statsBar.style.fontSize = '12px';
    statsBar.style.color = '#94a3b8';
    statsBar.innerHTML = `
      <span>Ticks: <strong style="color: #38bdf8;">${report.ticks}</strong></span>
      <span>Alpha: <strong style="color: #f59e0b;">${report.finalAlpha.toFixed(4)}</strong></span>
      <span>Energy: <strong style="color: #a78bfa;">${report.kineticEnergy.toFixed(2)}</strong></span>
      <span>Converged: <strong style="color: ${report.converged ? '#34d399' : '#f87171'};">${report.converged ? 'Yes' : 'No'}</strong></span>
    `;
    container.appendChild(statsBar);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Headless force simulation preview')
      .style('background', 'rgba(15, 23, 42, 0.75)')
      .style('border-radius', '8px')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)');

    svg
      .append('g')
      .attr('class', 'sim-links')
      .selectAll('line')
      .data(report.links)
      .join('line')
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
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
      .attr('fill', (d, i) => (i === 0 ? '#f97316' : '#3b82f6'))
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);

    nodeGroups
      .append('text')
      .attr('dy', (d) => d.radius + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
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

