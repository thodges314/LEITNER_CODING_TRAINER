const { render, fire, q, qa, act, wait } = $dom;
let api;
function Grab() {
  api = useToast();
  return null;
}
const mount2 = (props = {}) => render(<ToastProvider {...props}><Grab /></ToastProvider>);
const toasts = (c) => qa('[role="status"]', c).map((t) => t.firstChild.textContent);
const until = async (fn, ms = 2000) => {
  const start = Date.now();
  while (!fn() && Date.now() - start < ms) await wait(15);
  return fn();
};
{
  const r = mount2();
  const region = q('[role="region"]', r.container);
  $test.check('Renders a labelled notifications region, empty at first', region !== null && region.getAttribute('aria-label') === 'Notifications' && toasts(r.container).length === 0, r.container.innerHTML);
  r.unmount();
}
{
  const r = mount2();
  let id;
  act(() => { id = api.show('Saved!', { duration: 0 }); });
  $test.check('show adds a status toast with the message and returns an id', toasts(r.container).join() === 'Saved!' && typeof id === 'number', { toasts: toasts(r.container), id });
  r.unmount();
}
{
  const r = mount2();
  act(() => { api.show('A', { duration: 0 }); api.show('B', { duration: 0 }); });
  fire.click(qa('[aria-label="Dismiss"]', r.container)[0]);
  $test.check('The Dismiss button removes only its toast', toasts(r.container).join() === 'B', toasts(r.container));
  r.unmount();
}
{
  const r = mount2();
  let id;
  act(() => { id = api.show('A', { duration: 0 }); api.show('B', { duration: 0 }); });
  act(() => api.dismiss(id));
  $test.check('dismiss(id) removes a toast programmatically', toasts(r.container).join() === 'B', toasts(r.container));
  r.unmount();
}
{
  const r = mount2();
  act(() => { api.show('Temp', { duration: 300 }); });
  const early = toasts(r.container).join();
  const gone = await until(() => toasts(r.container).length === 0, 3000);
  $test.check('A toast disappears by itself after its duration', early === 'Temp' && gone, { early, now: toasts(r.container) });
  r.unmount();
}
{
  const r = mount2();
  act(() => { ['1', '2', '3', '4', '5'].forEach((m) => api.show(m, { duration: 0 })); });
  const three = toasts(r.container).join();
  r.unmount();
  const r2 = mount2({ limit: 2 });
  act(() => { ['1', '2', '3'].forEach((m) => api.show(m, { duration: 0 })); });
  $test.check('Only the newest `limit` toasts are kept (default 3), in creation order', three === '3,4,5' && toasts(r2.container).join() === '2,3', { three, limited: toasts(r2.container) });
  r2.unmount();
}
{
  const r = mount2();
  act(() => { api.show('Sticky', { duration: 0 }); api.show('Forever', { duration: Infinity }); });
  await wait(300);
  $test.check('A duration of 0 or Infinity keeps the toast until dismissed', toasts(r.container).join() === 'Sticky,Forever', toasts(r.container));
  r.unmount();
}
