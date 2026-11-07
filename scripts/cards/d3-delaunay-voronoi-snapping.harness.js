const SAMPLE_POINTS = [
  { x: 50, y: 60, id: 'p0', label: 'Alpha' },
  { x: 200, y: 80, id: 'p1', label: 'Beta' },
  { x: 350, y: 120, id: 'p2', label: 'Gamma' },
  { x: 140, y: 220, id: 'p3', label: 'Delta' },
];

// 1. Appends SVG canvas with dimensions and layer groups
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderVoronoiSnapping(container, SAMPLE_POINTS, { width: 480, height: 320 });
  const svg = container.querySelector('svg');
  const pointsLayer = container.querySelector('g.points-layer');
  const cellsLayer = container.querySelector('g.cells-layer');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '480' &&
    svg.getAttribute('height') === '320' &&
    pointsLayer !== null &&
    cellsLayer !== null &&
    instance.svg === svg;

  $test.check(
    'Appends SVG canvas with dimensions and layer groups',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Generates clipped Voronoi cell paths and point markers for each datum
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderVoronoiSnapping(container, SAMPLE_POINTS, {
    width: 400,
    height: 300,
    pointRadius: 5,
    pointColor: 'teal',
  });

  const circles = Array.from(container.querySelectorAll('circle.voronoi-point'));
  const cells = Array.from(container.querySelectorAll('path.voronoi-cell'));

  const allCellsHavePaths = cells.every((c) => {
    const d = c.getAttribute('d') || '';
    return d.startsWith('M') && d.endsWith('Z');
  });

  const passed =
    circles.length === 4 &&
    cells.length === 4 &&
    allCellsHavePaths &&
    circles[0].getAttribute('cx') === '50' &&
    circles[0].getAttribute('cy') === '60' &&
    circles[0].getAttribute('r') === '5' &&
    circles[0].getAttribute('fill') === 'teal' &&
    cells[0].getAttribute('fill') === 'transparent' &&
    cells[0].getAttribute('stroke') === 'gray';

  $test.check(
    'Generates clipped Voronoi cell paths and point markers for each datum',
    passed,
    { circleCount: circles.length, cellCount: cells.length, allCellsHavePaths }
  );

  instance.destroy();
  container.remove();
}

// 3. Finds closest point index across 2D plane via Delaunay triangulation
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderVoronoiSnapping(container, SAMPLE_POINTS, { width: 450, height: 300 });

  const idx0 = instance.findClosestIndex(45, 55);
  const idx1 = instance.findClosestIndex(205, 75);
  const idx2 = instance.findClosestIndex(360, 115);
  const idx3 = instance.findClosestIndex(135, 225);

  const passed = idx0 === 0 && idx1 === 1 && idx2 === 2 && idx3 === 3;

  $test.check(
    'Finds closest point index across 2D plane via Delaunay triangulation',
    passed,
    { idx0, idx1, idx2, idx3 }
  );

  instance.destroy();
  container.remove();
}

// 4. Clicking a Voronoi cell activates point and invokes onSelectPoint callback
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedPoint = null;
  let selectedIdx = null;

  const instance = renderVoronoiSnapping(container, SAMPLE_POINTS, {
    pointRadius: 4,
    pointColor: 'steelblue',
    activeColor: 'orange',
    onSelectPoint: (pt, i) => {
      selectedPoint = pt;
      selectedIdx = i;
    },
  });

  const cells = container.querySelectorAll('path.voronoi-cell');
  const circles = container.querySelectorAll('circle.voronoi-point');

  cells[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const firstClickPassed =
    selectedPoint !== null &&
    selectedPoint.label === 'Gamma' &&
    selectedIdx === 2 &&
    circles[2].getAttribute('fill') === 'orange' &&
    circles[2].getAttribute('r') === '7' &&
    circles[0].getAttribute('fill') === 'steelblue' &&
    circles[0].getAttribute('r') === '4';

  cells[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));

  const secondClickPassed =
    selectedPoint !== null &&
    selectedPoint.label === 'Beta' &&
    selectedIdx === 1 &&
    circles[1].getAttribute('fill') === 'orange' &&
    circles[1].getAttribute('r') === '7' &&
    circles[2].getAttribute('fill') === 'steelblue' &&
    circles[2].getAttribute('r') === '4';

  const passed = firstClickPassed && secondClickPassed;

  $test.check(
    'Clicking a Voronoi cell activates point and invokes onSelectPoint callback',
    passed,
    { selectedPoint, selectedIdx, firstClickPassed, secondClickPassed }
  );

  instance.destroy();
  container.remove();
}

// 5. Handles empty points and showCells option gracefully and cleans up on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const hiddenCellsInstance = renderVoronoiSnapping(container, SAMPLE_POINTS, {
    showCells: false,
  });
  const firstCellStroke = container.querySelector('path.voronoi-cell')?.getAttribute('stroke');
  hiddenCellsInstance.destroy();
  const cleanedAfterDestroy = container.innerHTML === '';

  const emptyInstance = renderVoronoiSnapping(container, []);
  const emptyClosest = emptyInstance.findClosestIndex(100, 100);
  const emptyCellsCount = container.querySelectorAll('path.voronoi-cell').length;
  emptyInstance.destroy();

  const passed =
    firstCellStroke === 'none' &&
    cleanedAfterDestroy &&
    emptyClosest === -1 &&
    emptyCellsCount === 0;

  $test.check(
    'Handles empty points and showCells option gracefully and cleans up on destroy',
    passed,
    { firstCellStroke, cleanedAfterDestroy, emptyClosest, emptyCellsCount }
  );

  container.remove();
}
