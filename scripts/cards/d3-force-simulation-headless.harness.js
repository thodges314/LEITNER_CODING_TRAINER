const SAMPLE_NODES = [
  { id: 'A', x: 100, y: 100 },
  { id: 'B', x: 110, y: 100 },
  { id: 'C', x: 105, y: 110 },
];

const SAMPLE_LINKS = [
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
];

// 1. Converges synchronously without mutating input nodes or links
{
  const inputNodes = SAMPLE_NODES.map((n) => ({ ...n }));
  const inputLinks = SAMPLE_LINKS.map((l) => ({ ...l }));

  const report = runHeadlessForceSimulation(inputNodes, inputLinks, {
    width: 400,
    height: 300,
    alphaMin: 0.05,
    maxTicks: 300,
  });

  const inputsUnmutated =
    inputNodes[0].x === 100 &&
    inputNodes[1].x === 110 &&
    typeof inputLinks[0].source === 'string';

  const passed =
    inputsUnmutated &&
    report.nodes.length === 3 &&
    report.links.length === 2 &&
    report.ticks > 0 &&
    report.ticks < 300 &&
    report.finalAlpha < 0.05 &&
    report.converged === true &&
    typeof report.kineticEnergy === 'number' &&
    report.kineticEnergy >= 0;

  $test.check(
    'Converges synchronously without mutating input nodes or links',
    passed,
    {
      inputsUnmutated,
      ticks: report.ticks,
      finalAlpha: report.finalAlpha,
      converged: report.converged,
    }
  );
}

// 2. Centers network centroid near canvas midpoint and resolves link geometry
{
  const report = runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, {
    width: 500,
    height: 360,
    linkDistance: 70,
    alphaMin: 0.01,
    maxTicks: 300,
  });

  const avgX = report.nodes.reduce((sum, n) => sum + n.x, 0) / report.nodes.length;
  const avgY = report.nodes.reduce((sum, n) => sum + n.y, 0) / report.nodes.length;
  const firstLink = report.links[0];
  const nodeA = report.getNode('A');
  const nodeB = report.getNode('B');

  const expectedLength =
    nodeA && nodeB ? Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y) : -1;

  const passed =
    Math.abs(avgX - 250) < 15 &&
    Math.abs(avgY - 180) < 15 &&
    firstLink.sourceId === 'A' &&
    firstLink.targetId === 'B' &&
    Math.abs(firstLink.length - expectedLength) < 1e-6 &&
    firstLink.length > 30;

  $test.check(
    'Centers network centroid near canvas midpoint and resolves link geometry',
    passed,
    { avgX, avgY, firstLink }
  );
}

// 3. Separates overlapping coincident nodes using collision and charge forces
{
  const overlapping = [
    { id: 'N1', x: 200, y: 150, radius: 18 },
    { id: 'N2', x: 200, y: 150, radius: 18 },
  ];

  const report = runHeadlessForceSimulation(overlapping, [], {
    width: 400,
    height: 300,
    chargeStrength: 0,
    collisionRadius: 18,
    alphaMin: 0.01,
    maxTicks: 200,
  });

  const n1 = report.getNode('N1');
  const n2 = report.getNode('N2');
  const dist = n1 && n2 ? Math.hypot(n2.x - n1.x, n2.y - n1.y) : 0;

  const passed =
    n1 !== null &&
    n2 !== null &&
    n1.radius === 18 &&
    n2.radius === 18 &&
    dist >= 34;

  $test.check(
    'Separates overlapping coincident nodes using collision and charge forces',
    passed,
    { dist, n1, n2 }
  );
}

// 4. Respects maxTicks budget and reports converged: false when stopped early
{
  const report = runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, {
    alphaMin: 0.001,
    maxTicks: 5,
  });

  const passed =
    report.ticks === 5 &&
    report.finalAlpha >= 0.001 &&
    report.converged === false &&
    report.kineticEnergy > 0;

  $test.check(
    'Respects maxTicks budget and reports converged: false when stopped early',
    passed,
    {
      ticks: report.ticks,
      finalAlpha: report.finalAlpha,
      converged: report.converged,
      kineticEnergy: report.kineticEnergy,
    }
  );
}

// 5. Looks up settled nodes by ID via getNode and returns null for unknown IDs
{
  const report = runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS);
  const foundB = report.getNode('B');
  const missing = report.getNode('UNKNOWN');

  const passed =
    foundB !== null &&
    foundB.id === 'B' &&
    typeof foundB.x === 'number' &&
    typeof foundB.y === 'number' &&
    missing === null;

  $test.check(
    'Looks up settled nodes by ID via getNode and returns null for unknown IDs',
    passed,
    { foundB, missing }
  );
}

// 6. Handles empty node list gracefully without running ticks
{
  const emptyReport = runHeadlessForceSimulation([], []);

  const passed =
    Array.isArray(emptyReport.nodes) &&
    emptyReport.nodes.length === 0 &&
    Array.isArray(emptyReport.links) &&
    emptyReport.links.length === 0 &&
    emptyReport.ticks === 0 &&
    emptyReport.converged === true &&
    emptyReport.kineticEnergy === 0 &&
    emptyReport.getNode('A') === null;

  $test.check(
    'Handles empty node list gracefully without running ticks',
    passed,
    emptyReport
  );
}

