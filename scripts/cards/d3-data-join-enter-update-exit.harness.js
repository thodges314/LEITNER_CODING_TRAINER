// 1. Enters initial g.box elements with rect and centered text label
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);

  updateKeyedBars(svg, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  const groups = Array.from(svg.querySelectorAll('g.box'));

  const structureCorrect = groups.every((g, idx) => {
    const id = ['a', 'b', 'c'][idx];
    const rect = g.querySelector('rect');
    const text = g.querySelector('text');
    return (
      g.getAttribute('data-id') === id &&
      rect?.getAttribute('width') === '40' &&
      rect?.getAttribute('height') === '40' &&
      rect?.getAttribute('fill') === 'steelblue' &&
      text?.getAttribute('x') === '20' &&
      text?.getAttribute('y') === '25' &&
      text?.getAttribute('text-anchor') === 'middle' &&
      text?.getAttribute('fill') === 'white' &&
      text?.textContent === id
    );
  });

  const transformsCorrect =
    groups[0]?.getAttribute('transform') === 'translate(0, 10)' &&
    groups[1]?.getAttribute('transform') === 'translate(50, 10)' &&
    groups[2]?.getAttribute('transform') === 'translate(100, 10)';

  const passed = groups.length === 3 && structureCorrect && transformsCorrect;

  $test.check(
    'Enters initial g.box elements with rect and centered text label',
    passed,
    { count: groups.length, structureCorrect, transformsCorrect }
  );

  svg.remove();
}

// 2. Preserves DOM node identity across keyed updates
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);

  updateKeyedBars(svg, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  const nodeABefore = svg.querySelector('g.box[data-id="a"]');
  const nodeCBefore = svg.querySelector('g.box[data-id="c"]');

  updateKeyedBars(svg, [{ id: 'c' }, { id: 'a' }, { id: 'd' }]);
  const nodeAAfter = svg.querySelector('g.box[data-id="a"]');
  const nodeCAfter = svg.querySelector('g.box[data-id="c"]');

  const passed =
    nodeABefore !== null &&
    nodeCBefore !== null &&
    nodeAAfter === nodeABefore &&
    nodeCAfter === nodeCBefore;

  $test.check(
    'Preserves DOM node identity across keyed updates',
    passed,
    { sameA: nodeAAfter === nodeABefore, sameC: nodeCAfter === nodeCBefore }
  );

  svg.remove();
}

// 3. Removes exiting DOM elements when keys are omitted
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);

  updateKeyedBars(svg, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  updateKeyedBars(svg, [{ id: 'c' }, { id: 'a' }, { id: 'd' }]);

  const nodeB = svg.querySelector('g.box[data-id="b"]');
  const nodeD = svg.querySelector('g.box[data-id="d"]');

  const passed = nodeB === null && nodeD !== null;

  $test.check(
    'Removes exiting DOM elements when keys are omitted',
    passed,
    { bRemoved: nodeB === null, dEntered: nodeD !== null }
  );

  svg.remove();
}

// 4. Updates transforms to match new index order
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);

  updateKeyedBars(svg, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  updateKeyedBars(svg, [{ id: 'c' }, { id: 'a' }, { id: 'd' }]);

  const groupC = svg.querySelector('g.box[data-id="c"]');
  const groupA = svg.querySelector('g.box[data-id="a"]');
  const groupD = svg.querySelector('g.box[data-id="d"]');

  const passed =
    groupC?.getAttribute('transform') === 'translate(0, 10)' &&
    groupA?.getAttribute('transform') === 'translate(50, 10)' &&
    groupD?.getAttribute('transform') === 'translate(100, 10)';

  $test.check(
    'Updates transforms to match new index order',
    passed,
    { tC: groupC?.getAttribute('transform'), tA: groupA?.getAttribute('transform'), tD: groupD?.getAttribute('transform') }
  );

  svg.remove();
}

// 5. Handles empty or undefined data by removing all elements
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);

  updateKeyedBars(svg, [{ id: 'a' }, { id: 'b' }]);
  updateKeyedBars(svg, undefined);
  const afterUndefined = svg.querySelectorAll('g.box').length;

  updateKeyedBars(svg, [{ id: 'x' }]);
  updateKeyedBars(svg, []);
  const afterEmpty = svg.querySelectorAll('g.box').length;

  const passed = afterUndefined === 0 && afterEmpty === 0;

  $test.check(
    'Handles empty or undefined data by removing all elements',
    passed,
    { afterUndefined, afterEmpty }
  );

  svg.remove();
}
