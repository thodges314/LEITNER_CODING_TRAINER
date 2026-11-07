function runHeadlessForceSimulation(nodes, links = [], options = {}) {
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

  const nodesCopy = nodes.map((n) => ({
    ...n,
    radius: typeof n.radius === 'number' ? n.radius : collisionRadius,
  }));

  const linksCopy = Array.isArray(links) ? links.map((l) => ({ ...l })) : [];

  const sim = d3
    .forceSimulation(nodesCopy)
    .alphaMin(alphaMin)
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collide',
      d3.forceCollide((d) => (typeof d.radius === 'number' ? d.radius : collisionRadius))
    )
    .force(
      'link',
      d3
        .forceLink(linksCopy)
        .id((d) => d.id)
        .distance((l) => (typeof l.distance === 'number' ? l.distance : linkDistance))
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
