const SAMPLE_DATA = [
  { label: 'Alpha', value: 30 },
  { label: 'Beta', value: 80 },
  { label: 'Gamma', value: 50 },
];

// 1. Appends SVG container with correct dimensions, role, and aria-label
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBarChart(container, SAMPLE_DATA, { width: 500, height: 300 });
  const svg = container.querySelector('svg');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '500' &&
    svg.getAttribute('height') === '300' &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Bar chart' &&
    instance.svg === svg;

  $test.check(
    'Appends SVG container with correct dimensions, role, and aria-label',
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

  const instance = renderBarChart(container, SAMPLE_DATA, {
    width: 400,
    height: 260,
    margin: { top: 15, right: 25, bottom: 35, left: 45 },
  });

  const chartArea = container.querySelector('g.chart-area');
  const xAxis = container.querySelector('g.x-axis');
  const yAxis = container.querySelector('g.y-axis');

  // innerHeight = 260 - 15 - 35 = 210
  const transform = chartArea?.getAttribute('transform') || '';
  const xTransform = xAxis?.getAttribute('transform') || '';

  const passed =
    chartArea !== null &&
    transform.includes('15') &&
    transform.includes('45') &&
    xAxis !== null &&
    xTransform.includes('210') &&
    yAxis !== null;

  $test.check(
    'Renders chart-area group and both x and y axis groups with translation',
    passed,
    { transform, xTransform }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders bar elements with data attributes, proportional heights, and color
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBarChart(container, SAMPLE_DATA, {
    width: 400,
    height: 260,
    color: 'teal',
  });

  const bars = Array.from(container.querySelectorAll('rect.bar'));

  const passed =
    bars.length === 3 &&
    bars[0].getAttribute('data-label') === 'Alpha' &&
    bars[0].getAttribute('data-value') === '30' &&
    bars[0].getAttribute('data-index') === '0' &&
    bars[1].getAttribute('data-label') === 'Beta' &&
    bars[1].getAttribute('data-value') === '80' &&
    bars[0].getAttribute('fill') === 'teal' &&
    parseFloat(bars[1].getAttribute('height') || '0') > parseFloat(bars[0].getAttribute('height') || '0');

  $test.check(
    'Renders bar elements with data attributes, proportional heights, and color',
    passed,
    { barCount: bars.length, alphaVal: bars[0]?.getAttribute('data-value') }
  );

  instance.destroy();
  container.remove();
}

// 4. Clicking a bar triggers onSelectBar callback with datum and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedDatum = null;
  let selectedIndex = null;

  const instance = renderBarChart(container, SAMPLE_DATA, {
    onSelectBar: (d, i) => {
      selectedDatum = d;
      selectedIndex = i;
    },
  });

  const bars = container.querySelectorAll('rect.bar');
  if (bars[1]) {
    bars[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed =
    selectedDatum !== null &&
    selectedDatum.label === 'Beta' &&
    selectedDatum.value === 80 &&
    selectedIndex === 1;

  $test.check(
    'Clicking a bar triggers onSelectBar callback with datum and index',
    passed,
    { selectedDatum, selectedIndex }
  );

  instance.destroy();
  container.remove();
}

// 5. Calling destroy removes SVG and cleans up container
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBarChart(container, SAMPLE_DATA);
  const hadSvg = container.querySelector('svg') !== null;
  instance.destroy();
  const cleaned = container.innerHTML === '';

  $test.check(
    'Calling destroy removes SVG and cleans up container',
    hadSvg && cleaned,
    { hadSvg, cleaned }
  );

  container.remove();
}

// 6. Handles empty data gracefully without throwing
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let thrown = null;
  let instance = null;
  try {
    instance = renderBarChart(container, []);
  } catch (err) {
    thrown = err;
  }

  const passed = thrown === null && instance !== null && container.querySelector('svg') !== null;

  $test.check(
    'Handles empty data gracefully without throwing',
    passed,
    { thrown: thrown?.message }
  );

  if (instance) instance.destroy();
  container.remove();
}
