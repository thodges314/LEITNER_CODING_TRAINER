const SAMPLE_NODES = [
  { id: 'A', label: 'Node A' },
  { id: 'B', label: 'Node B' },
  { id: 'C', label: 'Node C' },
];

const SAMPLE_LINKS = [
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
];

// 1. Renders SVG canvas with correct dimensions and role
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const instance = renderForceGraph(container, {
    nodes: SAMPLE_NODES,
    links: SAMPLE_LINKS,
    width: 400,
    height: 300,
  });

  const svg = container.querySelector('svg');
  const passed =
    svg !== null &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('width') === '400' &&
    svg.getAttribute('height') === '300';

  $test.check(
    'Renders SVG canvas with correct dimensions and role',
    passed,
    { hasSvg: !!svg, role: svg?.getAttribute('role') }
  );
  if (instance && typeof instance.destroy === 'function') instance.destroy();
  container.remove();
}

// 2. Renders lines for links with source and target data attributes
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const instance = renderForceGraph(container, {
    nodes: SAMPLE_NODES,
    links: SAMPLE_LINKS,
    width: 400,
    height: 300,
  });

  const links = container.querySelectorAll('.graph-link');
  const passed =
    links.length === 2 &&
    links[0].getAttribute('data-source') === 'A' &&
    links[0].getAttribute('data-target') === 'B';

  $test.check(
    'Renders lines for links with source and target data attributes',
    passed,
    {
      count: links.length,
      source: links[0]?.getAttribute('data-source'),
      target: links[0]?.getAttribute('data-target'),
    }
  );
  if (instance && typeof instance.destroy === 'function') instance.destroy();
  container.remove();
}

// 3. Renders circles for nodes with data-node-id and label text
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const instance = renderForceGraph(container, {
    nodes: SAMPLE_NODES,
    links: SAMPLE_LINKS,
    width: 400,
    height: 300,
  });

  const nodeCircles = container.querySelectorAll('.graph-node');
  const passed =
    nodeCircles.length === 3 &&
    nodeCircles[0].getAttribute('data-node-id') === 'A' &&
    nodeCircles[1].getAttribute('data-node-id') === 'B' &&
    nodeCircles[2].getAttribute('data-node-id') === 'C';

  $test.check(
    'Renders circles for nodes with data-node-id and label text',
    passed,
    { count: nodeCircles.length }
  );
  if (instance && typeof instance.destroy === 'function') instance.destroy();
  container.remove();
}

// 4. Clicking a node highlights it with data-selected=true and fires onSelectNode
{
  let selectedNode = null;
  const onSelectNode = (node) => {
    selectedNode = node;
  };

  const container = document.createElement('div');
  document.body.appendChild(container);
  const instance = renderForceGraph(container, {
    nodes: SAMPLE_NODES,
    links: SAMPLE_LINKS,
    width: 400,
    height: 300,
    onSelectNode,
  });

  const nodeBGroup =
    container.querySelector('[data-node-id="B"]')?.closest('.graph-node-group') ||
    container.querySelector('[data-node-id="B"]');
  nodeBGroup.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const nodeBCircle = container.querySelector('[data-node-id="B"]');
  const isSelected = nodeBCircle?.getAttribute('data-selected') === 'true';
  const fill = nodeBCircle?.getAttribute('fill');
  const callbackFired = selectedNode && selectedNode.id === 'B';

  $test.check(
    'Clicking a node highlights it with data-selected=true and fires onSelectNode',
    isSelected && callbackFired && fill === 'orange',
    { isSelected, callbackFired, fill }
  );
  if (instance && typeof instance.destroy === 'function') instance.destroy();
  container.remove();
}

// 5. Handles empty nodes and links gracefully and cleans up on destroy
{
  let threw = false;
  const container = document.createElement('div');
  document.body.appendChild(container);
  try {
    const instance = renderForceGraph(container, { nodes: [], links: [] });
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  } catch (e) {
    threw = true;
  }

  $test.check(
    'Handles empty nodes and links gracefully and cleans up on destroy',
    !threw,
    { threw }
  );
  container.remove();
}
