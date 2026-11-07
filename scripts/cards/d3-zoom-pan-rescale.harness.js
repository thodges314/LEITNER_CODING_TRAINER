const SAMPLE_ZOOM_POINTS = [
  { x: 10, y: 20 },
  { x: 25, y: 50 },
  { x: 50, y: 35 },
  { x: 75, y: 80 },
  { x: 100, y: 60 },
];

// 1. Mounts SVG with clip-path, plot-area, and data circles
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS, {
    width: 480,
    height: 260,
    color: 'seagreen',
  });

  const svg = container.querySelector('svg');
  const clipPath = container.querySelector('clipPath#zoom-chart-clip');
  const clipRect = clipPath?.querySelector('rect');
  const plotArea = container.querySelector('g.plot-area');
  const dataLayer = container.querySelector('g.data-layer');
  const circles = container.querySelectorAll('circle.data-point');
  const getFill = (el) => (el?.getAttribute('fill') || el?.style?.fill || '').trim();
  const fill = getFill(circles[0]);

  // innerWidth = 480 - 40 - 20 = 420; innerHeight = 260 - 15 - 25 = 220
  const passed =
    svg !== null &&
    svg.getAttribute('width') === '480' &&
    svg.getAttribute('height') === '260' &&
    clipRect !== null &&
    clipRect.getAttribute('width') === '420' &&
    clipRect.getAttribute('height') === '220' &&
    plotArea !== null &&
    plotArea.getAttribute('transform') === 'translate(40, 15)' &&
    dataLayer !== null &&
    dataLayer.getAttribute('clip-path') === 'url(#zoom-chart-clip)' &&
    circles.length === 5 &&
    fill.length > 0 &&
    instance.svg === svg;

  $test.check(
    'Mounts SVG with clip-path, plot-area, and data circles',
    passed,
    {
      width: svg?.getAttribute('width'),
      height: svg?.getAttribute('height'),
      circlesCount: circles.length,
      fill: circles[0]?.getAttribute('fill'),
    }
  );

  instance.destroy();
  container.remove();
}

// 2. Configures linear scales and renders initial X and Y axis groups
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS);

  const xAxis = container.querySelector('g.x-axis');
  const yAxis = container.querySelector('g.y-axis');
  const transform = instance.getTransform();

  const passed =
    xAxis !== null &&
    yAxis !== null &&
    xAxis.getAttribute('transform')?.includes('translate(0, 220)') &&
    xAxis.querySelectorAll('.tick').length > 3 &&
    yAxis.querySelectorAll('.tick').length > 3 &&
    transform.k === 1 &&
    transform.x === 0 &&
    transform.y === 0;

  $test.check(
    'Configures linear scales and renders initial X and Y axis groups',
    passed,
    {
      xAxisTransform: xAxis?.getAttribute('transform'),
      xTicks: xAxis?.querySelectorAll('.tick').length,
      yTicks: yAxis?.querySelectorAll('.tick').length,
      initialK: transform.k,
    }
  );

  instance.destroy();
  container.remove();
}

// 3. Rescales X-axis and updates circle cx coordinates on zoom scaling
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS);

  const firstCircleBefore = container.querySelector('circle.data-point');
  const initialCx = Number(firstCircleBefore?.getAttribute('cx'));

  instance.zoomBy(2);

  const transform = instance.getTransform();
  const firstCircleAfter = container.querySelector('circle.data-point');
  const updatedCx = Number(firstCircleAfter?.getAttribute('cx'));

  // When scaled by factor 2, k reaches 2 and point positions are rescaled
  const passed =
    transform.k === 2 &&
    !Number.isNaN(updatedCx) &&
    updatedCx !== initialCx;

  $test.check(
    'Rescales X-axis and updates circle cx coordinates on zoom scaling',
    passed,
    {
      scaleK: transform.k,
      initialCx,
      updatedCx,
    }
  );

  instance.destroy();
  container.remove();
}

// 4. Invokes onZoomChange callback with scale k and translation offsets
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let lastZoom = null;

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS, {
    onZoomChange: (state) => {
      lastZoom = state;
    },
  });

  instance.zoomBy(1.5);

  const passed =
    lastZoom !== null &&
    Math.abs(lastZoom.k - 1.5) < 1e-4 &&
    typeof lastZoom.x === 'number' &&
    typeof lastZoom.y === 'number';

  $test.check(
    'Invokes onZoomChange callback with scale k and translation offsets',
    passed,
    {
      lastZoom,
    }
  );

  instance.destroy();
  container.remove();
}

// 5. Resets zoom transform back to identity via resetZoom()
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS);

  instance.zoomBy(3);
  const transformAfterZoom = instance.getTransform();

  instance.resetZoom();
  const transformAfterReset = instance.getTransform();

  const passed =
    transformAfterZoom.k === 3 &&
    transformAfterReset.k === 1 &&
    transformAfterReset.x === 0 &&
    transformAfterReset.y === 0;

  $test.check(
    'Resets zoom transform back to identity via resetZoom()',
    passed,
    {
      afterZoomK: transformAfterZoom.k,
      afterResetK: transformAfterReset.k,
      afterResetX: transformAfterReset.x,
      afterResetY: transformAfterReset.y,
    }
  );

  instance.destroy();
  container.remove();
}

// 6. Cleans up SVG and DOM elements on destroy()
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderZoomChart(container, SAMPLE_ZOOM_POINTS);
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

