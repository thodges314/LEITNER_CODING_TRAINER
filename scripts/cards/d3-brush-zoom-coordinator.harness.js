const SAMPLE_SERIES = [
  { x: 0, y: 20 },
  { x: 10, y: 45 },
  { x: 20, y: 30 },
  { x: 30, y: 80 },
  { x: 40, y: 65 },
  { x: 50, y: 90 },
];

// 1. Mounts SVG with focus and context chart groups and brush layer
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBrushCoordinator(container, SAMPLE_SERIES, {
    width: 500,
    focusHeight: 180,
    contextHeight: 60,
  });

  const svg = container.querySelector('svg');
  const focusChart = container.querySelector('g.focus-chart');
  const contextChart = container.querySelector('g.context-chart');
  const brushLayer = container.querySelector('g.brush-layer');
  const focusDots = container.querySelectorAll('circle.focus-dot');

  const expectedHeight = String(180 + 60 + 25 + 15 + 25);

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '500' &&
    svg.getAttribute('height') === expectedHeight &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Brush coordinator chart' &&
    focusChart !== null &&
    contextChart !== null &&
    brushLayer !== null &&
    focusDots.length === 6 &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG with focus and context chart groups and brush layer',
    passed,
    {
      width: svg?.getAttribute('width'),
      height: svg?.getAttribute('height'),
      dots: focusDots.length,
    }
  );

  instance.destroy();
  container.remove();
}

// 2. Renders focus and context line paths with full initial domain
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBrushCoordinator(container, SAMPLE_SERIES, {
    color: '#10b981',
  });

  const focusLine = container.querySelector('path.focus-line');
  const contextLine = container.querySelector('path.context-line');
  const domain = instance.getDomain();
  const filtered = instance.getFilteredData();

  const passed =
    focusLine !== null &&
    (focusLine.getAttribute('d') || '').startsWith('M') &&
    focusLine.getAttribute('stroke') === '#10b981' &&
    contextLine !== null &&
    (contextLine.getAttribute('d') || '').startsWith('M') &&
    domain[0] === 0 &&
    domain[1] === 50 &&
    filtered.length === 6;

  $test.check(
    'Renders focus and context line paths with full initial domain',
    passed,
    { domain, filteredCount: filtered.length, stroke: focusLine?.getAttribute('stroke') }
  );

  instance.destroy();
  container.remove();
}

// 3. Applies initialSelection on mount and filters focus dots to active window
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBrushCoordinator(container, SAMPLE_SERIES, {
    initialSelection: [10, 30],
  });

  const domain = instance.getDomain();
  const filtered = instance.getFilteredData();
  const dots = Array.from(container.querySelectorAll('circle.focus-dot'));
  const dotXs = dots.map((c) => Number(c.getAttribute('data-x')));

  const passed =
    Math.abs(domain[0] - 10) < 1e-6 &&
    Math.abs(domain[1] - 30) < 1e-6 &&
    filtered.length === 3 &&
    dots.length === 3 &&
    dotXs[0] === 10 &&
    dotXs[1] === 20 &&
    dotXs[2] === 30;

  $test.check(
    'Applies initialSelection on mount and filters focus dots to active window',
    passed,
    { domain, dotXs }
  );

  instance.destroy();
  container.remove();
}

// 4. Updating domain via setBrushDomain rescales focus view and fires onBrushChange
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let lastDomain = null;
  let lastFiltered = null;

  const instance = renderBrushCoordinator(container, SAMPLE_SERIES, {
    onBrushChange: (dom, pts) => {
      lastDomain = dom;
      lastFiltered = pts;
    },
  });

  instance.setBrushDomain([20, 40]);

  const domainAfterSet = instance.getDomain();
  const dotsAfterSet = container.querySelectorAll('circle.focus-dot');
  // At domain [20, 40], x=20 maps to cx=0 and x=40 maps to cx=innerWidth (420)
  const firstDotCx = Number(dotsAfterSet[0]?.getAttribute('cx'));
  const lastDotCx = Number(dotsAfterSet[dotsAfterSet.length - 1]?.getAttribute('cx'));

  const passed =
    lastDomain !== null &&
    Math.abs(lastDomain[0] - 20) < 1e-6 &&
    Math.abs(lastDomain[1] - 40) < 1e-6 &&
    Array.isArray(lastFiltered) &&
    lastFiltered.length === 3 &&
    Math.abs(domainAfterSet[0] - 20) < 1e-6 &&
    Math.abs(domainAfterSet[1] - 40) < 1e-6 &&
    dotsAfterSet.length === 3 &&
    Math.abs(firstDotCx - 0) < 1e-4 &&
    Math.abs(lastDotCx - 420) < 1e-4;

  $test.check(
    'Updating domain via setBrushDomain rescales focus view and fires onBrushChange',
    passed,
    { lastDomain, dotsCount: dotsAfterSet.length, firstDotCx, lastDotCx }
  );

  instance.destroy();
  container.remove();
}

// 5. Clearing brush selection with null restores full domain and all data points
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderBrushCoordinator(container, SAMPLE_SERIES, {
    initialSelection: [10, 20],
  });

  const narrowedCount = instance.getFilteredData().length;
  instance.setBrushDomain(null);
  const restoredDomain = instance.getDomain();
  const restoredCount = instance.getFilteredData().length;
  const restoredDots = container.querySelectorAll('circle.focus-dot').length;

  const passed =
    narrowedCount === 2 &&
    restoredDomain[0] === 0 &&
    restoredDomain[1] === 50 &&
    restoredCount === 6 &&
    restoredDots === 6;

  $test.check(
    'Clearing brush selection with null restores full domain and all data points',
    passed,
    { narrowedCount, restoredDomain, restoredCount, restoredDots }
  );

  instance.destroy();
  container.remove();
}

// 6. Handles empty data gracefully and cleans up DOM on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const emptyInstance = renderBrushCoordinator(container, []);
  const emptyDomain = emptyInstance.getDomain();
  const emptyFiltered = emptyInstance.getFilteredData();
  emptyInstance.destroy();
  const cleanedUp = container.innerHTML === '';

  const passed =
    Array.isArray(emptyDomain) &&
    emptyDomain.length === 2 &&
    Array.isArray(emptyFiltered) &&
    emptyFiltered.length === 0 &&
    cleanedUp;

  $test.check(
    'Handles empty data gracefully and cleans up DOM on destroy',
    passed,
    { emptyDomain, emptyFilteredCount: emptyFiltered.length, cleanedUp }
  );

  container.remove();
}

