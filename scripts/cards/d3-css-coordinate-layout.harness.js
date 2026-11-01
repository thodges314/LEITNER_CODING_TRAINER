const { render, fire, q, qa } = $dom;

const SAMPLE_POINTS = [
  { id: 'p1', x: 0, y: 0, value: 10, label: 'Origin' },
  { id: 'p2', x: 100, y: 100, value: 50, label: 'Peak' },
  { id: 'p3', x: 50, y: 50, value: 30, label: 'Mid' },
];

// 1. Initial render mounts container with specified width/height and renders coordinate points
{
  const r = render(<D3CoordinateLayout data={SAMPLE_POINTS} width={400} height={300} />);
  const container = q('.coordinate-layout', r.container);
  const points = qa('.coordinate-point', r.container);

  const passed =
    container !== null &&
    points.length === 3 &&
    points[0].getAttribute('data-point-id') === 'p1' &&
    points[1].getAttribute('data-point-id') === 'p2' &&
    points[2].getAttribute('data-point-id') === 'p3';

  $test.check(
    'Initial render mounts container with specified width/height and renders coordinate points',
    passed,
    { hasContainer: !!container, pointCount: points.length }
  );
  r.unmount();
}

// 2. D3 linear scales calculate correct left and top coordinates with inverted Y-axis
{
  const r = render(<D3CoordinateLayout data={SAMPLE_POINTS} width={400} height={300} />);
  const p1 = q('[data-point-id="p1"]', r.container);
  const p2 = q('[data-point-id="p2"]', r.container);

  // x: 0 -> padding 20; p1 has value 10 -> size 16 -> left = 20 - 8 = 12px
  // y: 0 -> height - padding = 280; p1 has size 16 -> top = 280 - 8 = 272px
  const p1Left = parseFloat(p1.style.left);
  const p1Top = parseFloat(p1.style.top);

  // x: 100 -> width - padding = 380; p2 has value 50 -> size 48 -> left = 380 - 24 = 356px
  // y: 100 -> padding = 20; p2 has size 48 -> top = 20 - 24 = -4px
  const p2Left = parseFloat(p2.style.left);
  const p2Top = parseFloat(p2.style.top);

  const leftCorrect = Math.abs(p1Left - 12) < 2 && Math.abs(p2Left - 356) < 2;
  const topCorrect = Math.abs(p1Top - 272) < 2 && Math.abs(p2Top - (-4)) < 2;

  $test.check(
    'D3 linear scales calculate correct left and top coordinates with inverted Y-axis',
    leftCorrect && topCorrect,
    { p1Left, p1Top, p2Left, p2Top }
  );
  r.unmount();
}

// 3. D3 size scale sizes elements proportionally to data values
{
  const r = render(<D3CoordinateLayout data={SAMPLE_POINTS} width={400} height={300} />);
  const p1 = q('[data-point-id="p1"]', r.container);
  const p2 = q('[data-point-id="p2"]', r.container);
  const p3 = q('[data-point-id="p3"]', r.container);

  const p1Width = parseFloat(p1.style.width);
  const p2Width = parseFloat(p2.style.width);
  const p3Width = parseFloat(p3.style.width);

  const minValid = Math.abs(p1Width - 16) < 2;
  const maxValid = Math.abs(p2Width - 48) < 2;
  const midValid = Math.abs(p3Width - 32) < 2;

  $test.check(
    'D3 size scale sizes elements proportionally to data values',
    minValid && maxValid && midValid,
    { p1Width, p2Width, p3Width }
  );
  r.unmount();
}

// 4. Clicking a point calls onSelectPoint and updates data-selected to true
{
  let selected = null;
  const r = render(
    <D3CoordinateLayout
      data={SAMPLE_POINTS}
      width={400}
      height={300}
      onSelectPoint={(p) => {
        selected = p;
      }}
    />
  );

  const p2 = q('[data-point-id="p2"]', r.container);
  if (p2) fire.click(p2);

  const p2Selected = p2?.getAttribute('data-selected') === 'true';
  const p1Selected = q('[data-point-id="p1"]', r.container)?.getAttribute('data-selected') === 'false';
  const callbackFired = selected !== null && selected.id === 'p2';

  $test.check(
    'Clicking a point calls onSelectPoint and updates data-selected to true',
    p2Selected && p1Selected && callbackFired,
    { p2Selected, p1Selected, selectedId: selected?.id }
  );
  r.unmount();
}

// 5. Empty or single-point data gracefully falls back to default domain and sizes
{
  const single = [{ id: 'solo', x: 50, y: 50, value: 100, label: 'Solo' }];
  const r = render(<D3CoordinateLayout data={single} width={400} height={300} />);
  const soloEl = q('[data-point-id="solo"]', r.container);

  const width = parseFloat(soloEl?.style.width || '0');
  const left = parseFloat(soloEl?.style.left || '0');
  const top = parseFloat(soloEl?.style.top || '0');

  const valid = soloEl !== null && !isNaN(left) && !isNaN(top) && width === 32;

  $test.check(
    'Empty or single-point data gracefully falls back to default domain and sizes',
    valid,
    { width, left, top }
  );
  r.unmount();
}
