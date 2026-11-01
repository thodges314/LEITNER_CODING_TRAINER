interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface ForceGraphOptions {
  nodes?: GraphNode[];
  links?: GraphLink[];
  width?: number;
  height?: number;
  onSelectNode?: (node: GraphNode) => void;
}

function renderForceGraph(
  container: HTMLElement,
  options: ForceGraphOptions = {}
): { simulation: any; destroy: () => void } {
  const {
    nodes = [],
    links = [],
    width = 400,
    height = 300,
    onSelectNode,
  } = options;

  container.innerHTML = '';

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Force graph');

  const nodesCopy: GraphNode[] = nodes.map((n) => ({ ...n }));
  const linksCopy: GraphLink[] = links.map((l) => ({ ...l }));

  const simulation = d3
    .forceSimulation(nodesCopy)
    .force(
      'link',
      d3.forceLink(linksCopy).id((d: any) => d.id).distance(60)
    )
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkGroup = svg.append('g').attr('class', 'links');
  const linkLines = linkGroup
    .selectAll('line')
    .data(linksCopy)
    .enter()
    .append('line')
    .attr('class', 'graph-link')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('data-source', (d: any) =>
      typeof d.source === 'object' ? d.source.id : d.source
    )
    .attr('data-target', (d: any) =>
      typeof d.target === 'object' ? d.target.id : d.target
    );

  const nodeGroup = svg.append('g').attr('class', 'nodes');
  const nodeElements = nodeGroup
    .selectAll('g.graph-node-group')
    .data(nodesCopy)
    .enter()
    .append('g')
    .attr('class', 'graph-node-group');

  const circles = nodeElements
    .append('circle')
    .attr('class', 'graph-node')
    .attr('r', 14)
    .attr('data-node-id', (d: GraphNode) => d.id)
    .attr('data-selected', 'false')
    .attr('fill', 'skyblue')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5);

  nodeElements
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('font-size', 11)
    .attr('fill', 'black')
    .text((d: GraphNode) => d.label);

  nodeElements.on('click', (_event: any, d: GraphNode) => {
    circles
      .attr('data-selected', (n: GraphNode) => (n.id === d.id ? 'true' : 'false'))
      .attr('fill', (n: GraphNode) => (n.id === d.id ? 'orange' : 'skyblue'));

    if (typeof onSelectNode === 'function') {
      onSelectNode(d);
    }
  });

  const ticked = () => {
    linkLines
      .attr('x1', (d: any) => (typeof d.source === 'object' ? d.source.x || 0 : 0))
      .attr('y1', (d: any) => (typeof d.source === 'object' ? d.source.y || 0 : 0))
      .attr('x2', (d: any) => (typeof d.target === 'object' ? d.target.x || 0 : 0))
      .attr('y2', (d: any) => (typeof d.target === 'object' ? d.target.y || 0 : 0));

    nodeElements.attr(
      'transform',
      (d: GraphNode) => `translate(${d.x ?? width / 2}, ${d.y ?? height / 2})`
    );
  };

  simulation.on('tick', ticked);
  simulation.tick();
  ticked();

  return {
    simulation,
    destroy: () => {
      simulation.stop();
      svg.remove();
    },
  };
}
