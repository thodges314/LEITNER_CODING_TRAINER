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
    report.converged === true;

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

// 2. Centers network centroid near canvas midpoint
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

  const passed =
    Math.abs(avgX - 250) < 15 &&
    Math.abs(avgY - 180) < 15;

  $test.check(
    'Centers network centroid near canvas midpoint',
    passed,
    { avgX, avgY }
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

  const n1 = report.nodes.find((n) => n.id === 'N1');
  const n2 = report.nodes.find((n) => n.id === 'N2');
  const dist = n1 && n2 ? Math.hypot(n2.x - n1.x, n2.y - n1.y) : 0;

  const passed =
    n1 !== undefined &&
    n2 !== undefined &&
    n1.radius === 18 &&
    n2.radius === 18 &&
    dist >= 34;

  $test.check(
    'Separates overlapping coincident nodes using collision and charge forces',
    passed,
    { dist, n1, n2 }
  );
}

// 4. Resolves link endpoints to node references with position coordinates
{
  const report = runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, {
    width: 400,
    height: 300,
    alphaMin: 0.01,
    maxTicks: 200,
  });

  const firstLink = report.links[0];
  const passed =
    firstLink !== undefined &&
    typeof firstLink.source === 'object' &&
    typeof firstLink.target === 'object' &&
    firstLink.source.id === 'A' &&
    firstLink.target.id === 'B' &&
    typeof firstLink.source.x === 'number' &&
    typeof firstLink.target.x === 'number';

  $test.check(
    'Resolves link endpoints to node references with position coordinates',
    passed,
    { firstLink }
  );
}

// 5. Respects maxTicks budget and reports converged: false when stopped early
{
  const report = runHeadlessForceSimulation(SAMPLE_NODES, SAMPLE_LINKS, {
    alphaMin: 0.001,
    maxTicks: 5,
  });

  const passed =
    report.ticks === 5 &&
    report.finalAlpha >= 0.001 &&
    report.converged === false;

  $test.check(
    'Respects maxTicks budget and reports converged: false when stopped early',
    passed,
    {
      ticks: report.ticks,
      finalAlpha: report.finalAlpha,
      converged: report.converged,
    }
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
    emptyReport.converged === true;

  $test.check(
    'Handles empty node list gracefully without running ticks',
    passed,
    emptyReport
  );
}
