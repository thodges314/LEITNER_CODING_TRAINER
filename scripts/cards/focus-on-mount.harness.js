const { render, q, act } = $dom;
{
  const r = render(<FocusInput label="Name" placeholder="Ada" />);
  const input = q('input', r.container);
  $test.check('Renders a labelled input with the placeholder', input !== null && input.placeholder === 'Ada' && r.container.querySelector('label').textContent === 'Name', r.container.innerHTML);
  $test.check('The input is focused after mount', document.activeElement === input, document.activeElement && document.activeElement.tagName);
  r.unmount();
}
{
  const r = render(<FocusInput label="Name" placeholder="Ada" />);
  const other = document.createElement('button');
  document.body.appendChild(other);
  act(() => other.focus());
  r.rerender(<FocusInput label="Name" placeholder="Grace" />);
  const kept = document.activeElement === other;
  other.remove();
  $test.check('Re-rendering does not steal focus again', kept, document.activeElement && document.activeElement.tagName);
  r.unmount();
}
{
  const first = render(<FocusInput label="Name" placeholder="Ada" />);
  first.unmount();
  const second = render(<FocusInput label="Name" placeholder="Ada" />);
  $test.check('Focuses the input again when the component is mounted anew', document.activeElement === q('input', second.container), document.activeElement && document.activeElement.tagName);
  second.unmount();
}
