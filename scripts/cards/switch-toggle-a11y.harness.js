const { render, fire, q, qa } = $dom;
const setup = (props = {}) => {
  const calls = [];
  const r = render(<Switch checked={false} onChange={(v) => calls.push(v)} {...props}>Wi-Fi</Switch>);
  return { r, calls, el: q('[role="switch"]', r.container) };
};
{
  const { r, el } = setup();
  $test.check('Renders a <button type="button"> with role="switch" and the label as its content', !!el && el.tagName === 'BUTTON' && el.getAttribute('type') === 'button' && el.textContent === 'Wi-Fi', el && el.outerHTML);
  r.unmount();
}
{
  const off = setup({ checked: false });
  const on = setup({ checked: true });
  $test.check('aria-checked mirrors the checked prop as the strings "true" and "false"', off.el.getAttribute('aria-checked') === 'false' && on.el.getAttribute('aria-checked') === 'true', [off.el.getAttribute('aria-checked'), on.el.getAttribute('aria-checked')]);
  off.r.unmount();
  on.r.unmount();
}
{
  const off = setup({ checked: false });
  const on = setup({ checked: true });
  fire.click(off.el);
  fire.click(on.el);
  $test.check('Clicking calls onChange with the opposite value', off.calls.join() === 'true' && on.calls.join() === 'false', { off: off.calls, on: on.calls });
  off.r.unmount();
  on.r.unmount();
}
{
  const { r, el, calls } = setup({ disabled: true });
  fire.click(el);
  $test.check('A disabled switch is disabled and ignores clicks', el.disabled === true && calls.length === 0, { disabled: el.disabled, calls });
  r.unmount();
}
