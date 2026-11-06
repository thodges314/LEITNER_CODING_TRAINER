const SAMPLE_METRICS = [
  { category: 'Q1', value: 25 },
  { category: 'Q2', value: 50 },
  { category: 'Q3', value: 100 },
  { category: 'Q4', value: 75 },
];

// 1. Mounts SVG container, baseline, and scaled rect.scale-bar elements
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScaledCoordinateChart(container, SAMPLE_METRICS, {
    width: 440,
    height: 240,
    padding: 30,
    barColor: 'steelblue',
  });

  const svg = container.querySelector('svg');
  const baseline = container.querySelector('line.zero-baseline');
  const bars = Array.from(container.querySelectorAll('rect.scale-bar'));
  const extent = instance.getDomainExtent();

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '440' &&
    svg.getAttribute('height') === '240' &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Scaled coordinate chart' &&
    baseline !== null &&
    baseline.getAttribute('y1') === '210' &&
    bars.length === 4 &&
    extent[0] === 25 &&
    extent[1] === 100;

  $test.check(
    'Mounts SVG container, baseline, and scaled rect.scale-bar elements',
    passed,
    { extent, barCount: bars.length }
  );

  instance.destroy();
  container.remove();
}

// 2. Maps data values to inverted SVG Y coordinates and proportional heights
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  // height=220, padding=20 -> plotY spans [200, 20] (180px total height)
  const instance = renderScaledCoordinateChart(container, SAMPLE_METRICS, {
    width: 400,
    height: 220,
    padding: 20,
    paddingInner: 0,
  });

  const gZero = instance.getBarGeometry('Q1', 0);
  const gHalf = instance.getBarGeometry('Q2', 50);
  const gMax = instance.getBarGeometry('Q3', 100);
  const gUnknown = instance.getBarGeometry('UNKNOWN', 50);

  const passed =
    gZero !== null &&
    Math.abs(gZero.y - 200) < 0.01 &&
    Math.abs(gZero.height - 0) < 0.01 &&
    gHalf !== null &&
    Math.abs(gHalf.y - 110) < 0.01 &&
    Math.abs(gHalf.height - 90) < 0.01 &&
    gMax !== null &&
    Math.abs(gMax.y - 20) < 0.01 &&
    Math.abs(gMax.height - 180) < 0.01 &&
    gUnknown === null;

  $test.check(
    'Maps data values to inverted SVG Y coordinates and proportional heights',
    passed,
    { gZero, gHalf, gMax, gUnknown }
  );

  instance.destroy();
  container.remove();
}

// 3. Computes categorical band X positions, bandwidth, and centerX
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  // width=440, padding=20 -> range [20, 420] = 400px across 4 categories with paddingInner=0 -> 100px each
  const instance = renderScaledCoordinateChart(container, SAMPLE_METRICS, {
    width: 440,
    height: 240,
    padding: 20,
    paddingInner: 0,
  });

  const g1 = instance.getBarGeometry('Q1', 25);
  const g2 = instance.getBarGeometry('Q2', 50);
  const g4 = instance.getBarGeometry('Q4', 75);

  const passed =
    g1 !== null &&
    g2 !== null &&
    g4 !== null &&
    Math.abs(g1.x - 20) < 0.01 &&
    Math.abs(g1.width - 100) < 0.01 &&
    Math.abs(g1.centerX - 70) < 0.01 &&
    Math.abs(g2.x - 120) < 0.01 &&
    Math.abs(g4.x - 320) < 0.01;

  $test.check(
    'Computes categorical band X positions, bandwidth, and centerX',
    passed,
    { g1, g2, g4 }
  );

  instance.destroy();
  container.remove();
}

// 4. Supports continuous Y coordinate inversion via invertY and clamping
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  // height=220, padding=20 -> y=200 is value 0, y=110 is value 50, y=20 is value 100
  const clampedChart = renderScaledCoordinateChart(container, SAMPLE_METRICS, {
    height: 220,
    padding: 20,
    clamp: true,
  });

  const valAtTop = clampedChart.invertY(20);
  const valAtMid = clampedChart.invertY(110);
  const valAtBase = clampedChart.invertY(200);
  const gClampedOver = clampedChart.getBarGeometry('Q3', 250);

  clampedChart.destroy();

  const unclampedChart = renderScaledCoordinateChart(container, SAMPLE_METRICS, {
    height: 220,
    padding: 20,
    clamp: false,
  });
  const gUnclampedOver = unclampedChart.getBarGeometry('Q3', 150);
  unclampedChart.destroy();

  const passed =
    Math.abs(valAtTop - 100) < 0.01 &&
    Math.abs(valAtMid - 50) < 0.01 &&
    Math.abs(valAtBase - 0) < 0.01 &&
    gClampedOver !== null &&
    Math.abs(gClampedOver.y - 20) < 0.01 &&
    gUnclampedOver !== null &&
    gUnclampedOver.y < 20;

  $test.check(
    'Supports continuous Y coordinate inversion via invertY and clamping',
    passed,
    { valAtTop, valAtMid, valAtBase, clampedY: gClampedOver?.y, unclampedY: gUnclampedOver?.y }
  );

  container.remove();
}

// 5. Handles empty dataset gracefully and cleans up DOM on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const emptyChart = renderScaledCoordinateChart(container, []);
  const extent = emptyChart.getDomainExtent();
  const barCount = container.querySelectorAll('rect.scale-bar').length;

  emptyChart.destroy();
  const cleanedUp = container.innerHTML === '';

  const passed =
    extent[0] === 0 && extent[1] === 0 && barCount === 0 && cleanedUp;

  $test.check(
    'Handles empty dataset gracefully and cleans up DOM on destroy',
    passed,
    { extent, barCount, cleanedUp }
  );

  container.remove();
}
