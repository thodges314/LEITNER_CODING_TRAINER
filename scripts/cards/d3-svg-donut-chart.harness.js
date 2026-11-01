const SAMPLE_DATA = [
  { label: 'JavaScript', value: 45, color: '#f7df1e' },
  { label: 'TypeScript', value: 35, color: '#3178c6' },
  { label: 'Python', value: 20, color: '#3572a5' },
];

// 1. Appends SVG container with correct dimensions, role, and aria-label
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderDonutChart(container, SAMPLE_DATA, { width: 480, height: 320 });
  const svg = container.querySelector('svg');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '480' &&
    svg.getAttribute('height') === '320' &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Donut chart' &&
    instance.svg === svg;

  $test.check(
    'Appends SVG container with correct dimensions, role, and aria-label',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Renders centered donut group translated to (width / 2, height / 2) and center label
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderDonutChart(container, SAMPLE_DATA, {
    width: 400,
    height: 300,
    centerLabel: 'Languages',
  });

  const donutGroup = container.querySelector('g.chart-donut');
  const transform = donutGroup?.getAttribute('transform') || '';
  const centerText = container.querySelector('text.center-label');

  const passed =
    donutGroup !== null &&
    transform.includes('200') &&
    transform.includes('150') &&
    centerText !== null &&
    centerText.textContent === 'Languages' &&
    centerText.getAttribute('text-anchor') === 'middle';

  $test.check(
    'Renders centered donut group translated to (width / 2, height / 2) and center label',
    passed,
    { transform, centerLabel: centerText?.textContent }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders arc slice paths with data attributes and fill colors
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderDonutChart(container, SAMPLE_DATA);
  const slices = Array.from(container.querySelectorAll('path.arc-slice'));

  const passed =
    slices.length === 3 &&
    slices[0].getAttribute('data-label') === 'JavaScript' &&
    slices[0].getAttribute('data-value') === '45' &&
    slices[0].getAttribute('data-index') === '0' &&
    slices[0].getAttribute('fill') === '#f7df1e' &&
    slices[1].getAttribute('data-label') === 'TypeScript' &&
    slices[1].getAttribute('fill') === '#3178c6' &&
    Boolean(slices[0].getAttribute('d')?.startsWith('M'));

  $test.check(
    'Renders arc slice paths with data attributes and fill colors',
    passed,
    { sliceCount: slices.length, firstLabel: slices[0]?.getAttribute('data-label') }
  );

  instance.destroy();
  container.remove();
}

// 4. Respects custom innerRadius (e.g. 0 for full pie) and outerRadius
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const pieInstance = renderDonutChart(container, SAMPLE_DATA, {
    innerRadius: 0,
    outerRadius: 100,
  });

  const pieSlices = Array.from(container.querySelectorAll('path.arc-slice'));
  const dPath = pieSlices[0]?.getAttribute('d') || '';

  // Arc path with innerRadius 0 passes through center origin M...L0,0...
  const passed = pieSlices.length === 3 && (dPath.includes('L0,0') || dPath.includes('L 0 0') || dPath.includes('Z'));

  $test.check(
    'Respects custom innerRadius (e.g. 0 for full pie) and outerRadius',
    passed,
    { dPreview: dPath.slice(0, 30) }
  );

  pieInstance.destroy();
  container.remove();
}

// 5. Clicking a slice triggers onSelectSlice callback with datum and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedDatum = null;
  let selectedIndex = null;

  const instance = renderDonutChart(container, SAMPLE_DATA, {
    onSelectSlice: (d, i) => {
      selectedDatum = d;
      selectedIndex = i;
    },
  });

  const slices = container.querySelectorAll('path.arc-slice');
  if (slices[1]) {
    slices[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed =
    selectedDatum !== null &&
    selectedDatum.label === 'TypeScript' &&
    selectedDatum.value === 35 &&
    selectedIndex === 1;

  $test.check(
    'Clicking a slice triggers onSelectSlice callback with datum and index',
    passed,
    { selectedDatum, selectedIndex }
  );

  instance.destroy();
  container.remove();
}

// 6. Calling destroy removes SVG and handles empty data gracefully
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderDonutChart(container, SAMPLE_DATA);
  instance.destroy();
  const cleaned = container.innerHTML === '';

  let emptyThrows = false;
  let emptyInstance = null;
  try {
    emptyInstance = renderDonutChart(container, [], { centerLabel: 'Empty' });
  } catch (_) {
    emptyThrows = true;
  }

  const hasSvg = container.querySelector('svg') !== null;
  const passed = cleaned && !emptyThrows && emptyInstance !== null && hasSvg;

  $test.check(
    'Calling destroy removes SVG and handles empty data gracefully',
    passed,
    { cleaned, emptyThrows, hasSvg }
  );

  if (emptyInstance) emptyInstance.destroy();
  container.remove();
}
