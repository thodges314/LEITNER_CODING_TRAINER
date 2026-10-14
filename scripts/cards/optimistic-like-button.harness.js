const { render, fire, q, act } = $dom;
const deferred = () => {
  const calls = [];
  const onToggle = (value) => new Promise((resolve, reject) => calls.push({ value, resolve, reject }));
  return { calls, onToggle };
};
const label = (c) => q('button', c).textContent;
const pressed = (c) => q('button', c).getAttribute('aria-pressed');
const settle = (fn) => act(async () => { fn(); });
{
  const r = render(<LikeButton initialCount={4} onToggle={() => Promise.resolve()} />);
  $test.check('Renders "Like (count)" with aria-pressed false', label(r.container) === 'Like (4)' && pressed(r.container) === 'false', label(r.container));
  r.unmount();
}
{
  const api = deferred();
  const r = render(<LikeButton initialCount={4} onToggle={api.onToggle} />);
  fire.click(q('button', r.container));
  $test.check('Clicking updates the UI immediately, before the request finishes', label(r.container) === 'Unlike (5)' && pressed(r.container) === 'true' && api.calls.length === 1, label(r.container));
  await settle(() => api.calls[0].resolve());
  r.unmount();
}
{
  const api = deferred();
  const r = render(<LikeButton initialLiked initialCount={2} onToggle={api.onToggle} />);
  fire.click(q('button', r.container));
  $test.check('onToggle receives the new liked value and an unlike decrements the count', api.calls[0].value === false && label(r.container) === 'Like (1)', { value: api.calls[0].value, label: label(r.container) });
  await settle(() => api.calls[0].resolve());
  r.unmount();
}
{
  const api = deferred();
  const r = render(<LikeButton initialCount={4} onToggle={api.onToggle} />);
  fire.click(q('button', r.container));
  await settle(() => api.calls[0].reject(new Error('offline')));
  $test.check('A failed request rolls back the state and shows an alert', label(r.container) === 'Like (4)' && pressed(r.container) === 'false' && q('[role="alert"]', r.container) !== null && q('[role="alert"]', r.container).textContent === 'Could not update', { label: label(r.container) });
  r.unmount();
}
{
  const api = deferred();
  const r = render(<LikeButton initialCount={0} onToggle={api.onToggle} />);
  const button = q('button', r.container);
  fire.click(button);
  fire.click(button);
  fire.click(button);
  $test.check('Clicks while a request is pending are ignored', api.calls.length === 1 && label(r.container) === 'Unlike (1)', { calls: api.calls.length, label: label(r.container) });
  await settle(() => api.calls[0].resolve());
  r.unmount();
}
{
  const api = deferred();
  const r = render(<LikeButton initialCount={0} onToggle={api.onToggle} />);
  fire.click(q('button', r.container));
  await settle(() => api.calls[0].reject(new Error('x')));
  fire.click(q('button', r.container));
  const clearedOnClick = q('[role="alert"]', r.container) === null;
  await settle(() => api.calls[1].resolve());
  $test.check('The error clears on the next click and a successful request keeps the new state', clearedOnClick && label(r.container) === 'Unlike (1)' && q('[role="alert"]', r.container) === null, { label: label(r.container) });
  r.unmount();
}
