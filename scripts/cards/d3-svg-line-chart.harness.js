const SAMPLE_POINTS = [
  { x: 10, y: 15 },
  { x: 20, y: 35 },
  { x: 30, y: 25 },
  { x: 40, y: 60 },
  { x: 50, y: 45 },
];

// 1. Mounts SVG container with chart-area grouping
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderLineChart(container, SAMPLE_POINTS, { width: 450, height: 280 });
  const svg = container.querySelector('svg');
  const chartArea = container.querySelector('g.chart-area');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '450' &&
    svg.getAttribute('height') === '280' &&
    chartArea !== null &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG container with chart-area grouping',
    passed,
    { width: svg?.getAttribute('width'), hasChartArea: chartArea !== null }
  );

  instance.destroy();
  container.remove();
}

// 2. Generates smooth curve path with stroke styling and M-command path string
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderLineChart(container, SAMPLE_POINTS, {
    strokeColor: 'orange',
    strokeWidth: 3,
  });

  const path = container.querySelector('path.chart-line');
  const dAttr = path?.getAttribute('d') || '';

  const passed =
    path !== null &&
    path.getAttribute('fill') === 'none' &&
    path.getAttribute('stroke') === 'orange' &&
    path.getAttribute('stroke-width') === '3' &&
    dAttr.startsWith('M') &&
    dAttr.length > 20;

  $test.check(
    'Generates smooth curve path with stroke styling and M-command path string',
    passed,
    { dAttr: dAttr.slice(0, 30), stroke: path?.getAttribute('stroke') }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders data point markers with scaled coordinates
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderLineChart(container, SAMPLE_POINTS);
  const points = Array.from(container.querySelectorAll('circle.chart-point'));

  const passed =
    points.length === 5 &&
    parseFloat(points[3].getAttribute('cy') || '999') < parseFloat(points[0].getAttribute('cy') || '0');

  $test.check(
    'Renders data point markers with scaled coordinates',
    passed,
    { pointCount: points.length, cy0: points[0]?.getAttribute('cy'), cy3: points[3]?.getAttribute('cy') }
  );

  instance.destroy();
  container.remove();
}

// 4. Respects showPoints: false by omitting point markers
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderLineChart(container, SAMPLE_POINTS, { showPoints: false });
  const points = container.querySelectorAll('circle.chart-point');
  const path = container.querySelector('path.chart-line');

  const passed = points.length === 0 && path !== null;

  $test.check(
    'Respects showPoints: false by omitting point markers',
    passed,
    { pointCount: points.length, hasPath: path !== null }
  );

  instance.destroy();
  container.remove();
}

// 5. Clicking a point circle fires onSelectPoint with point and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedPoint = null;
  let selectedIndex = null;

  const instance = renderLineChart(container, SAMPLE_POINTS, {
    onSelectPoint: (pt, i) => {
      selectedPoint = pt;
      selectedIndex = i;
    },
  });

  const circles = container.querySelectorAll('circle.chart-point');
  if (circles[2]) {
    circles[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed =
    selectedPoint !== null &&
    selectedPoint.x === 30 &&
    selectedPoint.y === 25 &&
    selectedIndex === 2;

  $test.check(
    'Clicking a point circle fires onSelectPoint with point and index',
    passed,
    { selectedPoint, selectedIndex }
  );

  instance.destroy();
  container.remove();
}

// 6. Calling destroy cleans up container and handles empty data gracefully
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderLineChart(container, SAMPLE_POINTS);
  instance.destroy();
  const cleaned = container.innerHTML === '';

  let emptyInstance = null;
  let emptyThrows = false;
  try {
    emptyInstance = renderLineChart(container, []);
  } catch (_) {
    emptyThrows = true;
  }

  $test.check(
    'Calling destroy cleans up container and handles empty data gracefully',
    cleaned && !emptyThrows && emptyInstance !== null,
    { cleaned, emptyThrows }
  );

  if (emptyInstance) emptyInstance.destroy();
  container.remove();
}
