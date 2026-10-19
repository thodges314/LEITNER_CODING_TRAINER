const { render, q } = $dom;
const bar = (c) => q('[role="progressbar"]', c);
const fill = (c) => q('[data-fill]', c);
const text = (c) => (q('span', c) ? q('span', c).textContent.trim() : '');
{
  const r = render(<ProgressBar value={50} />);
  const b = bar(r.container);
  $test.check(
    '50 of 100 exposes the ARIA values, a 50% fill and the text "50%"',
    b.getAttribute('aria-valuenow') === '50' && b.getAttribute('aria-valuemin') === '0' && b.getAttribute('aria-valuemax') === '100' && fill(r.container).style.width === '50%' && text(r.container) === '50%',
    { now: b.getAttribute('aria-valuenow'), width: fill(r.container).style.width, text: text(r.container) }
  );
  r.unmount();
}
{
  const r = render(<ProgressBar value={3} max={4} />);
  const b = bar(r.container);
  $test.check('A custom max is honoured: 3 of 4 is 75%', b.getAttribute('aria-valuemax') === '4' && b.getAttribute('aria-valuenow') === '3' && fill(r.container).style.width === '75%' && text(r.container) === '75%', { width: fill(r.container).style.width, text: text(r.container) });
  r.unmount();
}
{
  const low = render(<ProgressBar value={-10} />);
  const lowOk = bar(low.container).getAttribute('aria-valuenow') === '0' && fill(low.container).style.width === '0%' && text(low.container) === '0%';
  low.unmount();
  const high = render(<ProgressBar value={150} />);
  const highOk = bar(high.container).getAttribute('aria-valuenow') === '100' && fill(high.container).style.width === '100%' && text(high.container) === '100%';
  high.unmount();
  $test.check('Values are clamped into [0, max]: -10 -> 0%, 150 -> 100%', lowOk && highOk, { lowOk, highOk });
}
{
  const r = render(<ProgressBar value={1} max={3} />);
  const width = parseFloat(fill(r.container).style.width);
  $test.check('The fill width is exact while the text is rounded: 1 of 3 -> width ~33.33%, text "33%"', Math.abs(width - 33.3333) < 0.01 && text(r.container) === '33%', { width, text: text(r.container) });
  r.unmount();
}
{
  const a = render(<ProgressBar value={10} />);
  const defaultLabel = bar(a.container).getAttribute('aria-label');
  a.unmount();
  const b = render(<ProgressBar value={10} label="Upload" />);
  const custom = bar(b.container).getAttribute('aria-label');
  b.unmount();
  $test.check('aria-label defaults to "Progress" and can be overridden', defaultLabel === 'Progress' && custom === 'Upload', { defaultLabel, custom });
}
{
  const r = render(<ProgressBar />);
  const b = bar(r.container);
  $test.check('No value means indeterminate: no aria-valuenow, data-indeterminate="true", no percentage text', !b.hasAttribute('aria-valuenow') && b.getAttribute('data-indeterminate') === 'true' && text(r.container) === '', { attrs: b.getAttributeNames(), text: text(r.container) });
  r.unmount();
}
{
  const r = render(<ProgressBar />);
  const f = fill(r.container);
  $test.check(
    'Indeterminate: the data-fill element is still rendered, but without any inline style (no width)',
    f !== null && f.style.width === '' && !f.hasAttribute('style') && q('span', r.container) === null,
    { fill: f ? f.outerHTML : null }
  );
  r.unmount();
}
{
  const r = render(<ProgressBar value={50} />);
  r.rerender(<ProgressBar value={80} />);
  $test.check('Re-rendering with a new value updates the fill and the text', fill(r.container).style.width === '80%' && text(r.container) === '80%', { width: fill(r.container).style.width });
  r.unmount();
}
