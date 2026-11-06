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

interface SettledNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SettledLink {
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

interface ForceSimReport {
  nodes: SettledNode[];
  links: SettledLink[];
  ticks: number;
  finalAlpha: number;
  converged: boolean;
  kineticEnergy: number;
  getNode: (id: string) => SettledNode | null;
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
      kineticEnergy: 0,
      getNode() {
        return null;
      },
    };
  }

  const nodesCopy = nodes.map((n) => ({
    ...n,
    radius: typeof n.radius === 'number' ? n.radius : collisionRadius,
  }));

  const linksCopy = Array.isArray(links) ? links.map((l) => ({ ...l })) : [];

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

  let kineticEnergy = 0;
  const settledNodes: SettledNode[] = nodesCopy.map((n) => {
    const x = Number(n.x) || 0;
    const y = Number(n.y) || 0;
    const vx = Number(n.vx) || 0;
    const vy = Number(n.vy) || 0;
    const radius = typeof n.radius === 'number' ? n.radius : collisionRadius;
    kineticEnergy += 0.5 * (vx * vx + vy * vy);
    return { id: String(n.id), x, y, vx, vy, radius };
  });

  const nodeById = new Map<string, SettledNode>(settledNodes.map((n) => [n.id, n]));

  const settledLinks: SettledLink[] = linksCopy.map((l: any) => {
    const src =
      typeof l.source === 'object' && l.source !== null
        ? l.source
        : nodeById.get(String(l.source));
    const tgt =
      typeof l.target === 'object' && l.target !== null
        ? l.target
        : nodeById.get(String(l.target));
    const sourceId = src ? String(src.id) : String(l.source);
    const targetId = tgt ? String(tgt.id) : String(l.target);
    const x1 = src ? Number(src.x) || 0 : 0;
    const y1 = src ? Number(src.y) || 0 : 0;
    const x2 = tgt ? Number(tgt.x) || 0 : 0;
    const y2 = tgt ? Number(tgt.y) || 0 : 0;
    const length = Math.hypot(x2 - x1, y2 - y1);
    return { sourceId, targetId, x1, y1, x2, y2, length };
  });

  return {
    nodes: settledNodes,
    links: settledLinks,
    ticks,
    finalAlpha,
    converged,
    kineticEnergy,
    getNode(id: string) {
      return nodeById.get(String(id)) ?? null;
    },
  };
}

