const { render, fire, q } = $dom;
{
  const r = render(<FancyInput placeholder="Your name" type="search" />);
  const input = q('input', r.container);
  $test.check('Other props reach the input', input !== null && input.placeholder === 'Your name' && input.type === 'search', input && input.outerHTML);
  r.unmount();
}
{
  const ref = React.createRef();
  const r = render(<FancyInput ref={ref} />);
  $dom.act(() => ref.current.focus());
  $test.check('ref.current.focus() focuses the input', document.activeElement === q('input', r.container), document.activeElement && document.activeElement.tagName);
  r.unmount();
}
{
  const ref = React.createRef();
  const r = render(<FancyInput ref={ref} />);
  fire.change(q('input', r.container), 'hello');
  $test.check('ref.current.getValue() returns the typed text', ref.current.getValue() === 'hello', ref.current.getValue());
  r.unmount();
}
{
  const ref = React.createRef();
  const r = render(<FancyInput ref={ref} />);
  const input = q('input', r.container);
  fire.change(input, 'hello');
  $dom.act(() => ref.current.clear());
  $test.check('ref.current.clear() empties the input and focuses it', input.value === '' && document.activeElement === input, { value: input.value });
  r.unmount();
}
{
  const ref = React.createRef();
  const r = render(<FancyInput ref={ref} />);
  const keys = Object.keys(ref.current).sort().join();
  $test.check('The ref exposes only focus, clear and getValue (not the DOM node)', keys === 'clear,focus,getValue' && !(ref.current instanceof HTMLElement), keys);
  r.unmount();
}
