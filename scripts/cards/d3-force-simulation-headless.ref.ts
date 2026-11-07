interface ForceSimNode {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

interface ForceSimLink {
  source: string | ForceSimNode;
  target: string | ForceSimNode;
  distance?: number;
}

interface ForceSimOptions {
  width?: number;
  height?: number;
  chargeStrength?: number;
  linkDistance?: number;
  collisionRadius?: number;
  alphaMin?: number;
  maxTicks?: number;
}

interface ForceSimReport {
  nodes: ForceSimNode[];
  links: ForceSimLink[];
  ticks: number;
  finalAlpha: number;
  converged: boolean;
}

function runHeadlessForceSimulation(
  nodes: ForceSimNode[],
  links: ForceSimLink[] = [],
  options: ForceSimOptions = {}
): ForceSimReport {
  const {
    width = 400,
    height = 300,
    chargeStrength = -120,
    linkDistance = 60,
    collisionRadius = 8,
    alphaMin = 0.01,
    maxTicks = 300,
  } = options;

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return {
      nodes: [],
      links: [],
      ticks: 0,
      finalAlpha: 1,
      converged: true,
    };
  }

  const nodesCopy: ForceSimNode[] = nodes.map((n: ForceSimNode) => ({
    ...n,
    radius: typeof n.radius === 'number' ? n.radius : collisionRadius,
  }));

  const linksCopy: ForceSimLink[] = Array.isArray(links) ? links.map((l: ForceSimLink) => ({ ...l })) : [];

  const sim = d3
    .forceSimulation<ForceSimNode>(nodesCopy)
    .alphaMin(alphaMin)
    .force('charge', d3.forceManyBody<ForceSimNode>().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collide',
      d3.forceCollide<ForceSimNode>((d: ForceSimNode) =>
        typeof d.radius === 'number' ? d.radius : collisionRadius
      )
    )
    .force(
      'link',
      d3
        .forceLink<ForceSimNode, ForceSimLink>(linksCopy)
        .id((d: ForceSimNode) => d.id)
        .distance((l: ForceSimLink) =>
          typeof l.distance === 'number' ? l.distance : linkDistance
        )
    )
    .stop();

  let ticks = 0;
  while (sim.alpha() >= alphaMin && ticks < maxTicks) {
    sim.tick();
    ticks++;
  }

  const finalAlpha = sim.alpha();
  const converged = finalAlpha < alphaMin;

  return {
    nodes: nodesCopy,
    links: linksCopy,
    ticks,
    finalAlpha,
    converged,
  };
}
