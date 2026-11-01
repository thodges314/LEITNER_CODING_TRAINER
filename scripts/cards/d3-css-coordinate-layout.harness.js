const SAMPLE_POINTS = [
  { id: 'p1', x: 0, y: 0, value: 10, label: 'Origin' },
  { id: 'p2', x: 100, y: 100, value: 50, label: 'Peak' },
  { id: 'p3', x: 50, y: 50, value: 30, label: 'Mid' },
];

// 1. Initial render mounts container with specified width/height and renders coordinate points
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = renderCoordinateLayout(container, { data: SAMPLE_POINTS, width: 400, height: 300 });
  const points = container.querySelectorAll('.coordinate-point');

  const passed =
    points.length === 3 &&
    container.style.position === 'relative' &&
    points[0].getAttribute('data-point-id') === 'p1' &&
    points[1].getAttribute('data-point-id') === 'p2' &&
    points[2].getAttribute('data-point-id') === 'p3';

  $test.check(
    'Initial render mounts container with specified width/height and renders coordinate points',
    passed,
    { pointCount: points.length }
  );
  if (typeof cleanup === 'function') cleanup();
  container.remove();
}

// 2. D3 linear scales calculate correct left and top coordinates with inverted Y-axis
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = renderCoordinateLayout(container, { data: SAMPLE_POINTS, width: 400, height: 300 });
  const p1 = container.querySelector('[data-point-id="p1"]');
  const p2 = container.querySelector('[data-point-id="p2"]');

  const p1Left = parseFloat(p1.style.left);
  const p1Top = parseFloat(p1.style.top);
  const p2Left = parseFloat(p2.style.left);
  const p2Top = parseFloat(p2.style.top);

  const leftCorrect = Math.abs(p1Left - 12) < 2 && Math.abs(p2Left - 356) < 2;
  const topCorrect = Math.abs(p1Top - 272) < 2 && Math.abs(p2Top - (-4)) < 2;

  $test.check(
    'D3 linear scales calculate correct left and top coordinates with inverted Y-axis',
    leftCorrect && topCorrect,
    { p1Left, p1Top, p2Left, p2Top }
  );
  if (typeof cleanup === 'function') cleanup();
  container.remove();
}

// 3. D3 size scale sizes elements proportionally to data values
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = renderCoordinateLayout(container, { data: SAMPLE_POINTS, width: 400, height: 300 });
  const p1 = container.querySelector('[data-point-id="p1"]');
  const p2 = container.querySelector('[data-point-id="p2"]');
  const p3 = container.querySelector('[data-point-id="p3"]');

  const p1Size = parseFloat(p1.style.width);
  const p2Size = parseFloat(p2.style.width);
  const p3Size = parseFloat(p3.style.width);

  const passed =
    Math.abs(p1Size - 16) < 2 &&
    Math.abs(p2Size - 48) < 2 &&
    Math.abs(p3Size - 32) < 4;

  $test.check(
    'D3 size scale sizes elements proportionally to data values',
    passed,
    { p1Size, p2Size, p3Size }
  );
  if (typeof cleanup === 'function') cleanup();
  container.remove();
}

// 4. Clicking a point calls onSelectPoint and updates data-selected to true
{
  let selected = null;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = renderCoordinateLayout(container, {
    data: SAMPLE_POINTS,
    width: 400,
    height: 300,
    onSelectPoint: (p) => {
      selected = p;
    },
  });

  const p2 = container.querySelector('[data-point-id="p2"]');
  const p1 = container.querySelector('[data-point-id="p1"]');
  p2.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const passed =
    p2.getAttribute('data-selected') === 'true' &&
    p1.getAttribute('data-selected') === 'false' &&
    p2.style.backgroundColor === 'orange' &&
    selected !== null &&
    selected.id === 'p2';

  $test.check(
    'Clicking a point calls onSelectPoint and updates data-selected to true',
    passed,
    { p2Selected: p2.getAttribute('data-selected'), selectedId: selected?.id }
  );
  if (typeof cleanup === 'function') cleanup();
  container.remove();
}

// 5. Empty or single-point data gracefully falls back to default domain and sizes
{
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = renderCoordinateLayout(container, {
    data: [{ id: 'solo', x: 50, y: 50, value: 100, label: 'Solo' }],
    width: 400,
    height: 300,
  });

  const solo = container.querySelector('[data-point-id="solo"]');
  const size = parseFloat(solo.style.width);
  const left = parseFloat(solo.style.left);
  const top = parseFloat(solo.style.top);

  const passed =
    solo !== null &&
    Math.abs(size - 32) < 2 &&
    !Number.isNaN(left) &&
    !Number.isNaN(top);

  $test.check(
    'Empty or single-point data gracefully falls back to default domain and sizes',
    passed,
    { size, left, top }
  );
  if (typeof cleanup === 'function') cleanup();
  container.remove();
}
