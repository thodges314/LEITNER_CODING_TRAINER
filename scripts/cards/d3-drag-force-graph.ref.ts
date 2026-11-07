interface ForceGraphNode {
  id: string;
  group?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  value?: number;
}

interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

interface ForceGraphOptions {
  width?: number;
  height?: number;
  nodeRadius?: number;
  chargeStrength?: number;
  linkDistance?: number;
  onNodeClick?: (node: ForceGraphNode) => void;
}

interface ForceGraphInstance {
  svg: SVGSVGElement;
  simulation: d3.Simulation<ForceGraphNode>;
  getNodes: () => ForceGraphNode[];
  getLinks: () => ForceGraphLink[];
  pinNode: (id: string, x: number, y: number) => void;
  unpinNode: (id: string) => void;
  destroy: () => void;
}

function renderForceDirectedGraph(
  container: HTMLElement,
  data: ForceGraphData,
  options: ForceGraphOptions = {}
): ForceGraphInstance {
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
    .forceSimulation<ForceGraphNode>(nodes)
    .force(
      'link',
      d3
        .forceLink<ForceGraphNode, ForceGraphLink>(links)
        .id((d: ForceGraphNode) => d.id)
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
    .drag<SVGCircleElement, ForceGraphNode>()
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
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    nodeElements
      .attr('cx', d => d.x ?? 0)
      .attr('cy', d => d.y ?? 0);
  });

  return {
    svg: svg.node() as SVGSVGElement,
    simulation,
    getNodes: () => simulation.nodes(),
    getLinks: () => {
      const linkForce = simulation.force('link');
      return linkForce ? (linkForce.links() as ForceGraphLink[]) : links;
    },
    pinNode: (id: string, x: number, y: number) => {
      const node = simulation.nodes().find(n => n.id === id);
      if (node) {
        node.fx = x;
        node.fy = y;
        simulation.alpha(0.1).restart();
      }
    },
    unpinNode: (id: string) => {
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

