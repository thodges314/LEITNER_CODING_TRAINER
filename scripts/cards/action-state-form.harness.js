const { render, fire, q, qa, act, wait } = $dom;
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};
const setup = (subscribe) => {
  const r = render(<SubscribeForm subscribe={subscribe} />);
  return {
    r,
    form: () => q('form', r.container),
    input: () => q('input[name="email"]', r.container),
    button: () => q('button', r.container),
    status: () => q('[role="status"]', r.container),
  };
};
const send = async (ui, email) => {
  fire.change(ui.input(), email);
  await act(async () => { fire.submit(ui.form()); });
  await wait(10);
};
{
  const ui = setup(async () => ({ ok: true }));
  $test.check('Starts idle: no message and an enabled Subscribe button', ui.status().textContent === '' && ui.button().disabled === false && ui.button().textContent === 'Subscribe', [ui.status().textContent, ui.button().textContent]);
  ui.r.unmount();
}
{
  const calls = [];
  const ui = setup(async (e) => { calls.push(e); return { ok: true }; });
  await send(ui, '   ');
  $test.check('A blank email shows an error and never calls subscribe', ui.status().textContent === 'Enter an email' && calls.length === 0, { status: ui.status().textContent, calls });
  ui.r.unmount();
}
{
  const d = deferred();
  const ui = setup(() => d.promise);
  fire.change(ui.input(), 'ada@example.com');
  await act(async () => { fire.submit(ui.form()); });
  await wait(10);
  const during = [ui.button().disabled, ui.button().textContent];
  await act(async () => { d.resolve({ ok: true }); });
  await wait(10);
  $test.check('While the action runs the button is disabled and reads "Subscribing…"', during[0] === true && during[1] === 'Subscribing…' && ui.button().disabled === false, { during, after: ui.button().textContent });
  ui.r.unmount();
}
{
  const ui = setup(async () => ({ ok: true }));
  await send(ui, 'ada@example.com');
  $test.check('A successful subscribe shows "Subscribed <email>" and enables the button again', ui.status().textContent === 'Subscribed ada@example.com' && ui.button().disabled === false && ui.button().textContent === 'Subscribe', [ui.status().textContent, ui.button().textContent]);
  ui.r.unmount();
}
{
  const ui = setup(async () => ({ ok: false, error: 'Already subscribed' }));
  await send(ui, 'ada@example.com');
  $test.check('A failed subscribe shows the error message from the server', ui.status().textContent === 'Already subscribed', ui.status().textContent);
  ui.r.unmount();
}
{
  const calls = [];
  const ui = setup(async (e) => { calls.push(e); return { ok: true }; });
  await send(ui, '  ada@example.com  ');
  $test.check('The email is trimmed before it is sent', calls.length === 1 && calls[0] === 'ada@example.com', calls);
  ui.r.unmount();
}
