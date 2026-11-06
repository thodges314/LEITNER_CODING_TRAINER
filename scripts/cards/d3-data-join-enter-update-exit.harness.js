const INITIAL_METRICS = [
  { id: 'cpu', label: 'CPU', value: 45 },
  { id: 'mem', label: 'Memory', value: 70 },
  { id: 'net', label: 'Network', value: 30 },
];

// 1. Mounts SVG container and enters all initial rows with data-join="enter"
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderKeyedDataJoin(container, INITIAL_METRICS, {
    width: 440,
    rowHeight: 36,
    enterColor: 'seagreen',
  });

  const svg = container.querySelector('svg');
  const rows = Array.from(container.querySelectorAll('g.join-row'));
  const stats = instance.getStats();

  const allEnter = rows.every(
    (r) =>
      r.getAttribute('data-join') === 'enter' &&
      r.querySelector('rect.join-bar')?.getAttribute('fill') === 'seagreen'
  );

  const passed =
    svg !== null &&
    svg.getAttribute('role') === 'img' &&
    svg.getAttribute('aria-label') === 'Keyed data join chart' &&
    rows.length === 3 &&
    allEnter &&
    stats.entered === 3 &&
    stats.updated === 0 &&
    stats.exited === 0 &&
    stats.total === 3;

  $test.check(
    'Mounts SVG container and enters all initial rows with data-join="enter"',
    passed,
    { stats, rowCount: rows.length }
  );

  instance.destroy();
  container.remove();
}

// 2. Preserves existing DOM node identity across keyed updates and marks data-join="update"
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderKeyedDataJoin(container, INITIAL_METRICS, {
    enterColor: 'seagreen',
    updateColor: 'steelblue',
  });

  const memNodeBefore = container.querySelector('g.join-row[data-id="mem"]');
  const cpuNodeBefore = container.querySelector('g.join-row[data-id="cpu"]');

  const nextStats = instance.update([
    { id: 'mem', label: 'Memory', value: 85 },
    { id: 'cpu', label: 'CPU', value: 50 },
    { id: 'disk', label: 'Disk', value: 60 },
  ]);

  const memNodeAfter = container.querySelector('g.join-row[data-id="mem"]');
  const cpuNodeAfter = container.querySelector('g.join-row[data-id="cpu"]');
  const diskNodeAfter = container.querySelector('g.join-row[data-id="disk"]');
  const netNodeAfter = container.querySelector('g.join-row[data-id="net"]');

  const passed =
    memNodeBefore !== null &&
    memNodeAfter === memNodeBefore &&
    cpuNodeAfter === cpuNodeBefore &&
    netNodeAfter === null &&
    memNodeAfter.getAttribute('data-join') === 'update' &&
    memNodeAfter.querySelector('rect.join-bar')?.getAttribute('fill') === 'steelblue' &&
    diskNodeAfter !== null &&
    diskNodeAfter.getAttribute('data-join') === 'enter' &&
    diskNodeAfter.querySelector('rect.join-bar')?.getAttribute('fill') === 'seagreen' &&
    nextStats.entered === 1 &&
    nextStats.updated === 2 &&
    nextStats.exited === 1 &&
    nextStats.total === 3;

  $test.check(
    'Preserves existing DOM node identity across keyed updates and marks data-join="update"',
    passed,
    {
      sameMemDomNode: memNodeAfter === memNodeBefore,
      nextStats,
    }
  );

  instance.destroy();
  container.remove();
}

// 3. Reorders DOM elements to match new data array order and updates transforms
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderKeyedDataJoin(container, INITIAL_METRICS, {
    rowHeight: 40,
  });

  instance.update([
    { id: 'net', label: 'Network', value: 90 },
    { id: 'cpu', label: 'CPU', value: 25 },
  ]);

  const rows = Array.from(container.querySelectorAll('g.join-row'));
  const idsInDomOrder = rows.map((r) => r.getAttribute('data-id'));
  const transforms = rows.map((r) => r.getAttribute('transform'));
  const labels = rows.map((r) => r.querySelector('text.join-label')?.textContent);

  const passed =
    idsInDomOrder.length === 2 &&
    idsInDomOrder[0] === 'net' &&
    idsInDomOrder[1] === 'cpu' &&
    transforms[0] === 'translate(0, 0)' &&
    transforms[1] === 'translate(0, 40)' &&
    labels[0] === 'Network: 90' &&
    labels[1] === 'CPU: 25';

  $test.check(
    'Reorders DOM elements to match new data array order and updates transforms',
    passed,
    { idsInDomOrder, transforms, labels }
  );

  instance.destroy();
  container.remove();
}

// 4. Scales bar widths proportionally and clamps values exceeding maxValue
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderKeyedDataJoin(
    container,
    [
      { id: 'low', label: 'Low', value: 25 },
      { id: 'high', label: 'High', value: 50 },
      { id: 'over', label: 'Over', value: 200 },
    ],
    { width: 340, maxValue: 100 }
  );

  // max bar width = 340 - 140 = 200
  const bars = Array.from(container.querySelectorAll('rect.join-bar'));
  const widths = bars.map((b) => Number(b.getAttribute('width')));

  const passed =
    widths.length === 3 &&
    Math.abs(widths[0] - 50) < 0.01 &&
    Math.abs(widths[1] - 100) < 0.01 &&
    Math.abs(widths[2] - 200) < 0.01;

  $test.check(
    'Scales bar widths proportionally and clamps values exceeding maxValue',
    passed,
    { widths }
  );

  instance.destroy();
  container.remove();
}

// 5. Handles empty array transitions and cleans up DOM on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderKeyedDataJoin(container, INITIAL_METRICS);
  const emptyStats = instance.update([]);
  const remainingRows = container.querySelectorAll('g.join-row').length;

  instance.destroy();
  const cleanedUp = container.innerHTML === '';

  const passed =
    emptyStats.entered === 0 &&
    emptyStats.updated === 0 &&
    emptyStats.exited === 3 &&
    emptyStats.total === 0 &&
    remainingRows === 0 &&
    cleanedUp;

  $test.check(
    'Handles empty array transitions and cleans up DOM on destroy',
    passed,
    { emptyStats, remainingRows, cleanedUp }
  );

  container.remove();
}

