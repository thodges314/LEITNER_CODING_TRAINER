const SAMPLE_CLUSTER = [
  { x: 140, y: 120 },
  { x: 145, y: 125 },
  { x: 150, y: 118 },
  { x: 138, y: 122 },
  { x: 142, y: 128 },
  { x: 300, y: 180 },
  { x: 305, y: 185 },
  { x: 295, y: 175 },
];

// 1. Mounts SVG container with dimensions, role, aria-label, and layer groups
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderContourDensity(container, SAMPLE_CLUSTER, {
    width: 440,
    height: 280,
  });

  const svg = container.querySelector('svg');
  const bandsGroup = container.querySelector('g.contour-bands');
  const pointsGroup = container.querySelector('g.density-points');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '440' &&
    svg.getAttribute('height') === '280' &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Contour density chart' &&
    bandsGroup !== null &&
    pointsGroup !== null &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG container with dimensions, role, aria-label, and layer groups',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Generates MultiPolygon density contours and renders SVG band paths
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderContourDensity(container, SAMPLE_CLUSTER, {
    width: 440,
    height: 280,
    bandwidth: 20,
    thresholds: 6,
  });

  const bandPaths = Array.from(container.querySelectorAll('path.contour-band'));
  const pointDots = container.querySelectorAll('circle.density-point');
  const bands = instance.getBands();
  const peak = instance.getPeakDensity();

  const allPathsValid = bandPaths.every((p) => {
    const d = p.getAttribute('d') || '';
    return d.startsWith('M') && d.endsWith('Z');
  });

  const passed =
    bandPaths.length > 0 &&
    bandPaths.length === bands.length &&
    bandPaths.length === instance.contours.length &&
    allPathsValid &&
    pointDots.length === SAMPLE_CLUSTER.length &&
    peak > 0 &&
    bands[bands.length - 1].value === peak &&
    bands.every((b) => b.ringCount >= 1);

  $test.check(
    'Generates MultiPolygon density contours and renders SVG band paths',
    passed,
    { bandCount: bands.length, peak, allPathsValid }
  );

  instance.destroy();
  container.remove();
}

// 3. Respects point weights when computing peak kernel density
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const unweighted = renderContourDensity(
    container,
    [
      { x: 200, y: 150, weight: 1 },
      { x: 205, y: 152, weight: 1 },
    ],
    { bandwidth: 20, thresholds: 5 }
  );
  const peakUnweighted = unweighted.getPeakDensity();
  unweighted.destroy();

  const weighted = renderContourDensity(
    container,
    [
      { x: 200, y: 150, weight: 10 },
      { x: 205, y: 152, weight: 10 },
    ],
    { bandwidth: 20, thresholds: 5 }
  );
  const peakWeighted = weighted.getPeakDensity();
  weighted.destroy();

  const passed = peakUnweighted > 0 && peakWeighted > peakUnweighted * 5;

  $test.check(
    'Respects point weights when computing peak kernel density',
    passed,
    { peakUnweighted, peakWeighted }
  );

  container.remove();
}

// 4. Clicking a contour band invokes onSelectBand with band summary and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedBand = null;
  let selectedIdx = null;

  const instance = renderContourDensity(container, SAMPLE_CLUSTER, {
    thresholds: 5,
    onSelectBand: (band, idx) => {
      selectedBand = band;
      selectedIdx = idx;
    },
  });

  const paths = container.querySelectorAll('path.contour-band');
  paths[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const passed =
    selectedBand !== null &&
    selectedBand.index === 0 &&
    selectedBand.value > 0 &&
    selectedBand.ringCount >= 1 &&
    selectedIdx === 0;

  $test.check(
    'Clicking a contour band invokes onSelectBand with band summary and index',
    passed,
    { selectedBand, selectedIdx }
  );

  instance.destroy();
  container.remove();
}

// 5. Respects showPoints: false by hiding raw density point circles
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderContourDensity(container, SAMPLE_CLUSTER, {
    showPoints: false,
  });

  const bandCount = container.querySelectorAll('path.contour-band').length;
  const pointCount = container.querySelectorAll('circle.density-point').length;

  const passed = bandCount > 0 && pointCount === 0;

  $test.check(
    'Respects showPoints: false by hiding raw density point circles',
    passed,
    { bandCount, pointCount }
  );

  instance.destroy();
  container.remove();
}

// 6. Handles empty points array gracefully and cleans up DOM on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const emptyInstance = renderContourDensity(container, []);
  const bands = emptyInstance.getBands();
  const peak = emptyInstance.getPeakDensity();
  emptyInstance.destroy();
  const cleanedUp = container.innerHTML === '';

  const passed =
    Array.isArray(bands) &&
    bands.length === 0 &&
    peak === 0 &&
    cleanedUp;

  $test.check(
    'Handles empty points array gracefully and cleans up DOM on destroy',
    passed,
    { bandsCount: bands.length, peak, cleanedUp }
  );

  container.remove();
}

