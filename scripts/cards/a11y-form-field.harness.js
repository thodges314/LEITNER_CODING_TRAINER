const { render, fire, q } = $dom;
const field = (props) => (
  <FormField label="Email" {...props}>
    {(p) => <input {...p} />}
  </FormField>
);
{
  const calls = [];
  const r = render(<ToggleButton pressed={false} onPressedChange={(v) => calls.push(v)}>Bold</ToggleButton>);
  const button = q('button', r.container);
  const before = button.getAttribute('aria-pressed');
  fire.click(button);
  r.rerender(<ToggleButton pressed onPressedChange={(v) => calls.push(v)}>Bold</ToggleButton>);
  fire.click(q('button', r.container));
  $test.check('ToggleButton exposes aria-pressed and reports the toggled value', before === 'false' && q('button', r.container).getAttribute('aria-pressed') === 'true' && calls.join() === 'true,false', { before, calls });
  r.unmount();
}
{
  const r = render(field({}));
  const label = q('label', r.container);
  const input = q('input', r.container);
  $test.check('FormField links the label to the control', input.id !== '' && label.htmlFor === input.id && label.textContent === 'Email', { for: label.htmlFor, id: input.id });
  r.unmount();
}
{
  const r = render(field({ hint: 'We never share it', error: 'Required' }));
  const input = q('input', r.container);
  const ids = input.getAttribute('aria-describedby').split(' ');
  const texts = ids.map((id) => document.getElementById(id).textContent).join();
  $test.check('Hint and error are referenced by aria-describedby', ids.length === 2 && texts === 'We never share it,Required', { describedby: input.getAttribute('aria-describedby'), texts });
  r.unmount();
}
{
  const r = render(field({ error: 'Required' }));
  const input = q('input', r.container);
  const alert = q('[role="alert"]', r.container);
  $test.check('An error marks the control aria-invalid and is announced with role="alert"', input.getAttribute('aria-invalid') === 'true' && alert !== null && alert.textContent === 'Required' && input.getAttribute('aria-describedby') === alert.id, { invalid: input.getAttribute('aria-invalid') });
  r.unmount();
}
{
  const r = render(field({}));
  const input = q('input', r.container);
  $test.check('Without hint or error there is no aria-describedby or aria-invalid', !input.hasAttribute('aria-describedby') && !input.hasAttribute('aria-invalid') && q('[role="alert"]', r.container) === null, input.outerHTML);
  r.unmount();
}
