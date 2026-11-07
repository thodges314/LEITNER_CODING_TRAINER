// 1. Configures transition with specified duration and default ease
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  svg.appendChild(rect);

  const sel = d3.select(svg).selectAll('rect');
  const t = transitionBars(sel, { duration: 450 });

  const passed =
    typeof t?.duration === 'function' &&
    t.duration() === 450 &&
    typeof t.ease() === 'function';

  $test.check(
    'Configures transition with specified duration and default ease',
    passed,
    { duration: t?.duration ? t.duration() : null }
  );

  svg.remove();
}

// 2. Applies custom easing function
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  svg.appendChild(rect);

  const sel = d3.select(svg).selectAll('rect');
  const customEase = d3.easeBounce;
  const t = transitionBars(sel, { ease: customEase });

  const passed = t.ease() === customEase;

  $test.check(
    'Applies custom easing function',
    passed,
    { sameEase: t.ease() === customEase }
  );

  svg.remove();
}

// 3. Staggers delay across elements by index
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  for (let i = 0; i < 3; i++) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    svg.appendChild(r);
  }

  const sel = d3.select(svg).selectAll('rect');
  const t = transitionBars(sel, { staggerMs: 60 });

  const delays = [];
  t.each(function () {
    const trans = Object.values(this.__transition || {})[0];
    if (trans) delays.push(trans.delay);
  });

  const passed =
    delays.length === 3 &&
    delays[0] === 0 &&
    delays[1] === 60 &&
    delays[2] === 120;

  $test.check(
    'Staggers delay across elements by index',
    passed,
    { delays }
  );

  svg.remove();
}

// 4. Interpolates width and fill attributes
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  for (let i = 0; i < 3; i++) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    svg.appendChild(r);
  }

  const sel = d3.select(svg).selectAll('rect');
  const t = transitionBars(sel, {
    targetWidths: [80, 160, 240],
    fillColor: 'seagreen',
  });

  let hasWidthTween = false;
  let hasFillTween = false;
  t.each(function () {
    const trans = Object.values(this.__transition || {})[0];
    if (trans && Array.isArray(trans.tween)) {
      const names = trans.tween.map((tw) => tw.name);
      if (names.includes('attr.width')) hasWidthTween = true;
      if (names.includes('attr.fill')) hasFillTween = true;
    }
  });

  const passed = hasWidthTween && hasFillTween;

  $test.check(
    'Interpolates width and fill attributes',
    passed,
    { hasWidthTween, hasFillTween }
  );

  svg.remove();
}

// 5. Returns the created D3 transition instance
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  svg.appendChild(rect);

  const sel = d3.select(svg).selectAll('rect');
  const result = transitionBars(sel);

  const passed =
    result !== null &&
    typeof result === 'object' &&
    typeof result.duration === 'function' &&
    typeof result.ease === 'function' &&
    typeof result.delay === 'function' &&
    typeof result.attr === 'function';

  $test.check(
    'Returns the created D3 transition instance',
    passed,
    { isTransition: passed }
  );

  svg.remove();
}

