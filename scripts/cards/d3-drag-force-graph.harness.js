const SAMPLE_GRAPH = {
  nodes: [
    { id: 'A', group: 1 },
    { id: 'B', group: 1 },
    { id: 'C', group: 2 },
    { id: 'D', group: 2 },
  ],
  links: [
    { source: 'A', target: 'B', value: 1 },
    { source: 'B', target: 'C', value: 2 },
    { source: 'C', target: 'D', value: 1 },
  ],
};

// 1. Mounts SVG with links-layer, nodes-layer, and initial element selections
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH, {
    width: 480,
    height: 300,
    nodeRadius: 10,
  });

  const svg = container.querySelector('svg');
  const linksLayer = container.querySelector('g.links-layer');
  const nodesLayer = container.querySelector('g.nodes-layer');
  const linkLines = container.querySelectorAll('line.graph-link');
  const nodeCircles = container.querySelectorAll('circle.graph-node');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '480' &&
    svg.getAttribute('height') === '300' &&
    linksLayer !== null &&
    nodesLayer !== null &&
    linkLines.length === 3 &&
    nodeCircles.length === 4 &&
    nodeCircles[0].getAttribute('r') === '10' &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG with links-layer, nodes-layer, and initial element selections',
    passed,
    {
      width: svg?.getAttribute('width'),
      height: svg?.getAttribute('height'),
      linksCount: linkLines.length,
      nodesCount: nodeCircles.length,
    }
  );

  instance.destroy();
  container.remove();
}

// 2. Initializes force simulation with link, charge, and center forces
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH);

  const sim = instance.simulation;
  const linkForce = sim ? sim.force('link') : null;
  const chargeForce = sim ? sim.force('charge') : null;
  const centerForce = sim ? sim.force('center') : null;
  const nodes = instance.getNodes();
  const links = instance.getLinks();

  const passed =
    sim !== null &&
    linkForce !== null &&
    chargeForce !== null &&
    centerForce !== null &&
    nodes.length === 4 &&
    links.length === 3;

  $test.check(
    'Initializes force simulation with link, charge, and center forces',
    passed,
    {
      hasSim: sim !== null,
      hasLinkForce: linkForce !== null,
      hasChargeForce: chargeForce !== null,
      hasCenterForce: centerForce !== null,
      nodesCount: nodes.length,
      linksCount: links.length,
    }
  );

  instance.destroy();
  container.remove();
}

// 3. Updates link and node SVG coordinates on simulation tick
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH);

  instance.simulation.tick(10);

  const firstNode = container.querySelector('circle.graph-node');
  const firstLink = container.querySelector('line.graph-link');

  const cx = Number(firstNode?.getAttribute('cx'));
  const cy = Number(firstNode?.getAttribute('cy'));
  const x1 = Number(firstLink?.getAttribute('x1'));
  const y1 = Number(firstLink?.getAttribute('y1'));

  const passed =
    !Number.isNaN(cx) &&
    !Number.isNaN(cy) &&
    !Number.isNaN(x1) &&
    !Number.isNaN(y1);

  $test.check(
    'Updates link and node SVG coordinates on simulation tick',
    passed,
    {
      cx,
      cy,
      x1,
      y1,
    }
  );

  instance.destroy();
  container.remove();
}

// 4. Invokes onNodeClick callback when node circle is clicked
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let clickedNode = null;

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH, {
    onNodeClick: (node) => {
      clickedNode = node;
    },
  });

  const nodeCircles = container.querySelectorAll('circle.graph-node');
  if (nodeCircles.length > 0) {
    nodeCircles[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed = clickedNode !== null && clickedNode.id === 'B';

  $test.check(
    'Invokes onNodeClick callback when node circle is clicked',
    passed,
    {
      clickedId: clickedNode?.id,
    }
  );

  instance.destroy();
  container.remove();
}

// 5. Pins and unpins node coordinates via pinNode() and unpinNode()
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH);

  instance.pinNode('A', 150, 200);
  const nodePinned = instance.getNodes().find((n) => n.id === 'A');
  const pinOk = nodePinned?.fx === 150 && nodePinned?.fy === 200;

  instance.unpinNode('A');
  const nodeUnpinned = instance.getNodes().find((n) => n.id === 'A');
  const unpinOk = nodeUnpinned?.fx === null && nodeUnpinned?.fy === null;

  const passed = pinOk && unpinOk;

  $test.check(
    'Pins and unpins node coordinates via pinNode() and unpinNode()',
    passed,
    {
      pinnedFx: nodePinned?.fx,
      pinnedFy: nodePinned?.fy,
      unpinnedFx: nodeUnpinned?.fx,
      unpinnedFy: nodeUnpinned?.fy,
    }
  );

  instance.destroy();
  container.remove();
}

// 6. Stops simulation and cleans up DOM elements on destroy()
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderForceDirectedGraph(container, SAMPLE_GRAPH);
  instance.destroy();

  const passed = container.children.length === 0;

  $test.check(
    'Stops simulation and cleans up DOM elements on destroy()',
    passed,
    {
      remainingChildren: container.children.length,
    }
  );

  container.remove();
}
