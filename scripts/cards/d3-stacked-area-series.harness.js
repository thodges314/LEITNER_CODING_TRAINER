const SAMPLE_MONTHS = [
  { month: 'Jan', desktop: 120, mobile: 80, tablet: 20 },
  { month: 'Feb', desktop: 150, mobile: 100, tablet: 30 },
  { month: 'Mar', desktop: 180, mobile: 140, tablet: 40 },
  { month: 'Apr', desktop: 200, mobile: 160, tablet: 50 },
];

// 1. Mounts SVG and plot area with specified dimensions
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS, {
    width: 500,
    height: 300,
  });

  const svg = container.querySelector('svg');
  const plotArea = container.querySelector('g.plot-area');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '500' &&
    svg.getAttribute('height') === '300' &&
    plotArea !== null &&
    plotArea.getAttribute('transform') === 'translate(45, 15)' &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG and plot area with specified dimensions',
    passed,
    {
      width: svg?.getAttribute('width'),
      height: svg?.getAttribute('height'),
      plotTransform: plotArea?.getAttribute('transform'),
    }
  );

  instance.destroy();
  container.remove();
}

// 2. Computes stacked baselines and sets dynamic upper Y domain
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS, {
    keys: ['desktop', 'mobile', 'tablet'],
  });

  const keys = instance.getLayerKeys();
  const yDomain = instance.getYDomain();

  // Total max for April: 200 + 160 + 50 = 410
  const passed =
    Array.isArray(keys) &&
    keys.length === 3 &&
    keys[0] === 'desktop' &&
    keys[1] === 'mobile' &&
    keys[2] === 'tablet' &&
    Array.isArray(yDomain) &&
    yDomain[0] === 0 &&
    yDomain[1] >= 410;

  $test.check(
    'Computes stacked baselines and sets dynamic upper Y domain',
    passed,
    {
      keys,
      yDomain,
    }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders stacked area path layers with fills and opacity
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS, {
    keys: ['desktop', 'mobile'],
    colors: ['steelblue', 'orange'],
  });

  const layersGroup = container.querySelector('g.stacked-layers');
  const paths = container.querySelectorAll('path.stacked-layer');

  const passed =
    layersGroup !== null &&
    paths.length === 2 &&
    paths[0].getAttribute('d') !== null &&
    paths[0].getAttribute('d').startsWith('M') &&
    paths[0].getAttribute('fill') === 'steelblue' &&
    paths[1].getAttribute('fill') === 'orange';

  $test.check(
    'Renders stacked area path layers with fills and opacity',
    passed,
    {
      layersCount: paths.length,
      firstLayerD: paths[0]?.getAttribute('d')?.slice(0, 20),
      firstFill: paths[0]?.getAttribute('fill'),
    }
  );

  instance.destroy();
  container.remove();
}

// 4. Renders X and Y axis groups with formatted tick labels
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS);

  const xAxis = container.querySelector('g.x-axis');
  const yAxis = container.querySelector('g.y-axis');
  const xTicks = xAxis ? xAxis.querySelectorAll('.tick') : [];
  const yTicks = yAxis ? yAxis.querySelectorAll('.tick') : [];

  const passed =
    xAxis !== null &&
    yAxis !== null &&
    xAxis.getAttribute('transform')?.includes('translate(0,') &&
    xTicks.length === SAMPLE_MONTHS.length &&
    yTicks.length > 2;

  $test.check(
    'Renders X and Y axis groups with formatted tick labels',
    passed,
    {
      hasXAxis: xAxis !== null,
      hasYAxis: yAxis !== null,
      xTicksCount: xTicks.length,
      yTicksCount: yTicks.length,
    }
  );

  instance.destroy();
  container.remove();
}

// 5. Invokes onSelectLayer callback with key and index when layer is clicked
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let clickedKey = null;
  let clickedIndex = null;

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS, {
    keys: ['desktop', 'mobile', 'tablet'],
    onSelectLayer: (key, index) => {
      clickedKey = key;
      clickedIndex = index;
    },
  });

  const paths = container.querySelectorAll('path.stacked-layer');
  if (paths.length >= 2) {
    paths[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const passed = clickedKey === 'mobile' && clickedIndex === 1;

  $test.check(
    'Invokes onSelectLayer callback with key and index when layer is clicked',
    passed,
    {
      clickedKey,
      clickedIndex,
    }
  );

  instance.destroy();
  container.remove();
}

// 6. Cleans up SVG and DOM elements on destroy()
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderStackedAreaChart(container, SAMPLE_MONTHS);
  instance.destroy();

  const passed = container.children.length === 0;

  $test.check(
    'Cleans up SVG and DOM elements on destroy()',
    passed,
    {
      remainingChildren: container.children.length,
    }
  );

  container.remove();
}

