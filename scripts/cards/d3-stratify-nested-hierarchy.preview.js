const DEFAULT_HIERARCHY_DATA = [
  { id: 'flare', parentId: null },
  { id: 'analytics', parentId: 'flare' },
  { id: 'cluster', parentId: 'analytics', value: 3838 },
  { id: 'graph', parentId: 'analytics', value: 7000 },
  { id: 'optimization', parentId: 'analytics', value: 4500 },
  { id: 'animate', parentId: 'flare', value: 2000 },
  { id: 'physics', parentId: 'flare', value: 3200 },
];

(function () {
  const container = document.getElementById('preview-root');
  if (!container) return;

  let currentProps = Object.assign(
    {
      data: DEFAULT_HIERARCHY_DATA,
    },
    typeof window !== 'undefined' ? window.__previewProps : {}
  );

  function render(props) {
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.padding = '12px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'system-ui, sans-serif';

    const data =
      Array.isArray(props.data) && props.data.length > 0
        ? props.data
        : DEFAULT_HIERARCHY_DATA;

    let result;
    try {
      result = stratifyHierarchy(data);
    } catch (err) {
      container.innerHTML = `<div style="color: crimson; padding: 16px;">Failed to stratify hierarchy: ${err.message}</div>`;
      return;
    }

    if (typeof log === 'function') {
      log('stratifySummary', {
        rootId: result.rootId,
        totalValue: result.totalValue,
        maxDepth: result.maxDepth,
        leavesCount: result.leaves.length,
      });
    }

    const width = 420;
    const height = 240;
    const margin = { top: 20, right: 80, bottom: 20, left: 50 };

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'rgba(15, 23, 42, 0.6)')
      .style('border-radius', '8px')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const treeLayout = d3.tree().size([innerHeight, innerWidth]);
    const treeData = treeLayout(result.root);

    g.selectAll('path.link')
      .data(treeData.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal().x((d) => d.y).y((d) => d.x))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(148, 163, 184, 0.4)')
      .attr('stroke-width', 1.5);

    const nodes = g
      .selectAll('g.node')
      .data(treeData.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    nodes
      .append('circle')
      .attr('r', (d) => (d.children ? 6 : 4.5))
      .attr('fill', (d) => (d.children ? 'steelblue' : 'seagreen'))
      .attr('stroke', 'black')
      .attr('stroke-width', 1.5);

    nodes
      .append('text')
      .attr('dy', '0.32em')
      .attr('x', (d) => (d.children ? -8 : 8))
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) => `${d.id} (${(d.value || 0).toLocaleString()})`)
      .attr('font-size', '11px')
      .attr('fill', 'white');

    nodes.on('click', function (_event, d) {
      const ancestors = result.ancestorsOf(d.id);
      if (typeof log === 'function') {
        log('selectNode', d.id, ancestors);
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
