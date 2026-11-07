const SAMPLE_TREE = {
  name: 'Bundle',
  children: [
    {
      name: 'Core',
      children: [
        { name: 'Engine', value: 120 },
        { name: 'Parser', value: 300 },
      ],
    },
    {
      name: 'UI',
      children: [
        { name: 'Charts', value: 200 },
        { name: 'Icons', value: 80 },
      ],
    },
  ],
};

// 1. Appends SVG container with dimensions
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderTreemap(container, SAMPLE_TREE, { width: 520, height: 340 });
  const svg = container.querySelector('svg');

  const passed =
    svg !== null &&
    svg.getAttribute('width') === '520' &&
    svg.getAttribute('height') === '340' &&
    instance.svg === svg;

  $test.check(
    'Appends SVG container with dimensions',
    passed,
    { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') }
  );

  instance.destroy();
  container.remove();
}

// 2. Computes squarified treemap layout sorted descending by value
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderTreemap(container, SAMPLE_TREE, {
    width: 400,
    height: 200,
    paddingInner: 0,
    paddingOuter: 0,
    round: false,
  });

  const leaves = instance.getLeaves();
  const totalArea = leaves.reduce((acc, l) => acc + l.width * l.height, 0);

  // Parser (300) should be sorted before Engine (120), and Charts (200) before Icons (80)
  const parser = leaves.find((l) => l.name === 'Parser');
  const icons = leaves.find((l) => l.name === 'Icons');

  const passed =
    leaves.length === 4 &&
    Math.abs(totalArea - 400 * 200) < 1 &&
    parser !== undefined &&
    icons !== undefined &&
    parser.value === 300 &&
    icons.value === 80 &&
    parser.width * parser.height > icons.width * icons.height &&
    leaves.every((l) => l.x0 >= 0 && l.y0 >= 0 && l.x1 <= 400 && l.y1 <= 200 && l.depth === 2);

  $test.check(
    'Computes squarified treemap layout sorted descending by value',
    passed,
    { leafCount: leaves.length, totalArea }
  );

  instance.destroy();
  container.remove();
}

// 3. Renders treemap cell groups, proportional rects, and text labels
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderTreemap(container, SAMPLE_TREE, {
    width: 480,
    height: 320,
  });

  const cells = Array.from(container.querySelectorAll('g.treemap-cell'));
  const rects = Array.from(container.querySelectorAll('rect.treemap-rect'));
  const labels = Array.from(container.querySelectorAll('text.treemap-label'));
  const getFill = (el) => (el?.getAttribute('fill') || el?.style?.fill || '');

  const passed =
    cells.length === 4 &&
    rects.length === 4 &&
    labels.length === 4 &&
    cells[0].getAttribute('transform')?.startsWith('translate(') === true &&
    Boolean(getFill(rects[0])) &&
    Boolean(getFill(rects[1])) &&
    Number(rects[0].getAttribute('width')) > 0 &&
    Number(rects[0].getAttribute('height')) > 0 &&
    labels.map((el) => el.textContent).includes('Parser') &&
    labels.map((el) => el.textContent).includes('Charts');

  $test.check(
    'Renders treemap cell groups, proportional rects, and text labels',
    passed,
    { cellCount: cells.length, firstFill: rects[0]?.getAttribute('fill') }
  );

  instance.destroy();
  container.remove();
}

// 4. Respects paddingInner, paddingOuter, and round configuration options
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderTreemap(container, SAMPLE_TREE, {
    width: 400,
    height: 300,
    paddingOuter: 10,
    paddingInner: 4,
    round: true,
  });

  const leaves = instance.getLeaves();
  const minX0 = Math.min(...leaves.map((l) => l.x0));
  const minY0 = Math.min(...leaves.map((l) => l.y0));
  const maxX1 = Math.max(...leaves.map((l) => l.x1));
  const maxY1 = Math.max(...leaves.map((l) => l.y1));
  const allRounded = leaves.every(
    (l) =>
      Number.isInteger(l.x0) &&
      Number.isInteger(l.y0) &&
      Number.isInteger(l.x1) &&
      Number.isInteger(l.y1)
  );

  const passed =
    minX0 >= 10 &&
    minY0 >= 10 &&
    maxX1 <= 390 &&
    maxY1 <= 290 &&
    allRounded;

  $test.check(
    'Respects paddingInner, paddingOuter, and round configuration options',
    passed,
    { minX0, minY0, maxX1, maxY1, allRounded }
  );

  instance.destroy();
  container.remove();
}

// 5. Clicking a treemap cell invokes onSelectCell with cell metric and index
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  let selectedCell = null;
  let selectedIndex = null;

  const instance = renderTreemap(container, SAMPLE_TREE, {
    onSelectCell: (cell, i) => {
      selectedCell = cell;
      selectedIndex = i;
    },
  });

  const cells = container.querySelectorAll('g.treemap-cell');
  if (cells[1]) {
    cells[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  const leaves = instance.getLeaves();
  const passed =
    selectedCell !== null &&
    selectedIndex === 1 &&
    selectedCell.name === leaves[1].name &&
    selectedCell.value === leaves[1].value;

  $test.check(
    'Clicking a treemap cell invokes onSelectCell with cell metric and index',
    passed,
    { selectedCell, selectedIndex }
  );

  instance.destroy();
  container.remove();
}

// 6. Handles empty or zero-value hierarchy gracefully and cleans up on destroy
{
  const container = document.createElement('div');
  document.body.appendChild(container);

  const instance = renderTreemap(container, SAMPLE_TREE);
  instance.destroy();
  const cleaned = container.innerHTML === '';

  const zeroInstance = renderTreemap(container, {
    name: 'EmptyRoot',
    children: [{ name: 'ZeroLeaf', value: 0 }],
  });
  const zeroLeaves = zeroInstance.getLeaves();
  const zeroCells = container.querySelectorAll('g.treemap-cell').length;
  zeroInstance.destroy();

  const passed = cleaned && zeroLeaves.length === 0 && zeroCells === 0;

  $test.check(
    'Handles empty or zero-value hierarchy gracefully and cleans up on destroy',
    passed,
    { cleaned, zeroLeafCount: zeroLeaves.length, zeroCells }
  );

  container.remove();
}

