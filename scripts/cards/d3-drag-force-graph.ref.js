function renderForceDirectedGraph(container, data, options = {}) {
  container.innerHTML = '';

  const width = options.width ?? 480;
  const height = options.height ?? 300;
  const nodeRadius = options.nodeRadius ?? 8;
  const chargeStrength = options.chargeStrength ?? -120;
  const linkDistance = options.linkDistance ?? 50;

  const nodes = (data?.nodes || []).map(d => ({ ...d }));
  const links = (data?.links || []).map(d => ({ ...d }));

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const linksLayer = svg.append('g').attr('class', 'links-layer');
  const nodesLayer = svg.append('g').attr('class', 'nodes-layer');

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id(d => d.id)
        .distance(linkDistance)
    )
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkElements = linksLayer
    .selectAll('line.graph-link')
    .data(links)
    .join('line')
    .attr('class', 'graph-link')
    .attr('stroke', 'slategray')
    .attr('stroke-opacity', '0.6')
    .attr('stroke-width', '1.5');

  const dragBehavior = d3
    .drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  const nodeElements = nodesLayer
    .selectAll('circle.graph-node')
    .data(nodes)
    .join('circle')
    .attr('class', 'graph-node')
    .attr('r', nodeRadius)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('stroke-width', '1.5')
    .call(dragBehavior)
    .on('click', (event, d) => {
      if (typeof options.onNodeClick === 'function') {
        options.onNodeClick(d);
      }
    });

  simulation.on('tick', () => {
    linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeElements
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  return {
    svg: svg.node(),
    simulation,
    getNodes: () => simulation.nodes(),
    getLinks: () => {
      const linkForce = simulation.force('link');
      return linkForce ? linkForce.links() : links;
    },
    pinNode: (id, x, y) => {
      const node = simulation.nodes().find(n => n.id === id);
      if (node) {
        node.fx = x;
        node.fy = y;
        simulation.alpha(0.1).restart();
      }
    },
    unpinNode: id => {
      const node = simulation.nodes().find(n => n.id === id);
      if (node) {
        node.fx = null;
        node.fy = null;
        simulation.alpha(0.1).restart();
      }
    },
    destroy: () => {
      simulation.stop();
      svg.remove();
      container.innerHTML = '';
    },
  };
}
