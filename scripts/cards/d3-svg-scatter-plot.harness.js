const SAMPLE_POINTS = [
  { x: 10, y: 20, label: 'P1', radius: 8 },
  { x: 25, y: 45, label: 'P2' },
  { x: 40, y: 30, label: 'P3' },
  { x: 55, y: 80, label: 'P4' },
];

// 1. Appends SVG canvas with correct dimensions
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScatterPlot(container, SAMPLE_POINTS, { width: 500, height: 350 });
  const svg = container.querySelector('svg');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '500' &&
    svg.getAttribute('height') === '350' &&
    instance.svg === svg;

  $test.check(
    'Appends SVG canvas with correct dimensions',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Renders chart-area group and both x and y axis groups with translation
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScatterPlot(container, SAMPLE_POINTS, {
    width: 450,
    height: 300,
    margin: { top: 15, right: 25, bottom: 45, left: 35 },
  });

  const chartArea = container.querySelector('g.chart-area');
  const xAxis = container.querySelector('g.x-axis');
  const yAxis = container.querySelector('g.y-axis');

  // innerHeight = 300 - 15 - 45 = 240
  const transform = chartArea?.getAttribute('transform') || '';
  const xTransform = xAxis?.getAttribute('transform') || '';

  const passed =
    chartArea !== null &&
    transform.includes('35') &&
    transform.includes('15') &&
    xAxis !== null &&
    xTransform.includes('240') &&
    yAxis !== null;

  $test.check(
    'Renders chart-area group and both x and y axis groups with translation',
    passed,
    { transform, xTransform }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders scatter dot circles with scaled coordinates and fill color
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScatterPlot(container, SAMPLE_POINTS, { color: 'purple' });
  const dots = Array.from(container.querySelectorAll('circle.scatter-dot'));

  const passed =
    dots.length === 4 &&
    dots[0].getAttribute('fill') === 'purple' &&
    // Inverted Y: P4 (y=80) should have smaller cy than P1 (y=20)
    parseFloat(dots[3].getAttribute('cy') || '999') < parseFloat(dots[0].getAttribute('cy') || '0');

  $test.check(
    'Renders scatter dot circles with scaled coordinates and fill color',
    passed,
    { dotCount: dots.length, cy0: dots[0]?.getAttribute('cy'), cy3: dots[3]?.getAttribute('cy') }
  );

  instance.destroy();
  container.remove();
}

// 4. Respects custom point radius per datum or defaultRadius option
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScatterPlot(container, SAMPLE_POINTS, { defaultRadius: 6 });
  const dots = container.querySelectorAll('circle.scatter-dot');

  const p1Radius = dots[0]?.getAttribute('r');
  const p2Radius = dots[1]?.getAttribute('r');

  const passed = p1Radius === '8' && p2Radius === '6';

  $test.check(
    'Respects custom point radius per datum or defaultRadius option',
    passed,
    { p1Radius, p2Radius }
  );

  instance.destroy();
  container.remove();
}

// 5. Clicking a dot invokes onSelectPoint callback with datum and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedDatum = null;
  let selectedIndex = null;

  const instance = renderScatterPlot(container, SAMPLE_POINTS, {
    onSelectPoint: (pt, i) => {
      selectedDatum = pt;
      selectedIndex = i;
    },
  });

  const dots = container.querySelectorAll('circle.scatter-dot');
  if (dots[2]) {
    dots[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed =
    selectedDatum !== null &&
    selectedDatum.label === 'P3' &&
    selectedDatum.x === 40 &&
    selectedIndex === 2;

  $test.check(
    'Clicking a dot invokes onSelectPoint callback with datum and index',
    passed,
    { selectedDatum, selectedIndex }
  );

  instance.destroy();
  container.remove();
}

// 6. Handles empty dataset and cleans up container on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderScatterPlot(container, SAMPLE_POINTS);
  instance.destroy();
  const cleaned = container.innerHTML === '';

  let emptyThrows = false;
  let emptyInstance = null;
  try {
    emptyInstance = renderScatterPlot(container, []);
  } catch (_) {
    emptyThrows = true;
  }

  const hasSvg = container.querySelector('svg') !== null;
  const passed = cleaned && !emptyThrows && emptyInstance !== null && hasSvg;

  $test.check(
    'Handles empty dataset and cleans up container on destroy',
    passed,
    { cleaned, emptyThrows, hasSvg }
  );

  if (emptyInstance) emptyInstance.destroy();
  container.remove();
}
