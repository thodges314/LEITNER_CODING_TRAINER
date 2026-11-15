const { render, fire, q } = $dom;

{
  const r = render(<RenderCounter />);
  const btn = q('button', r.container);
  const span = q('span', r.container);
  $test.check(
    'Initial render shows Count 0 and Renders: 1',
    btn?.textContent === 'Clicks: 0' && span?.textContent === 'Renders: 1',
    { btn: btn?.textContent, span: span?.textContent }
  );
  r.unmount();
}

{
  const r = render(<RenderCounter label="Taps" />);
  const btn = q('button', r.container);
  fire.click(btn);
  fire.click(btn);
  const span = q('span', r.container);
  $test.check(
    'Clicking increments count and render count together',
    btn?.textContent === 'Taps: 2' && span?.textContent === 'Renders: 3',
    { btn: btn?.textContent, span: span?.textContent }
  );
  r.unmount();
}

{
  const r = render(<RenderCounter label="A" />);
  fire.click(q('button', r.container));
  r.rerender(<RenderCounter label="B" />);
  const btn = q('button', r.container);
  const span = q('span', r.container);
  $test.check(
    'Parent rerender increments Renders while preserving count',
    btn?.textContent === 'B: 1' && span?.textContent === 'Renders: 3',
    { btn: btn?.textContent, span: span?.textContent }
  );
  r.unmount();
}

{
  const r = render(<RenderCounter />);
  const btn = q('button', r.container);
  $test.check(
    'Button uses type="button"',
    btn?.getAttribute('type') === 'button',
    btn?.outerHTML
  );
  r.unmount();
}

