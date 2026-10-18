const { render, q, qa, act, wait } = $dom;
// Text that is actually on screen: React hides suspended content with display:none.
const visibleText = (el) => {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) out += node.textContent;
    else if (node.nodeType === 1 && node.style.display !== 'none') out += visibleText(node);
  }
  return out;
};
const mountAsync = async (ui) => {
  let r;
  await act(async () => { r = render(ui); });
  return {
    container: r.container,
    rerender: async (next) => { await act(async () => { r.rerender(next); }); },
    unmount: async () => { await act(async () => { r.unmount(); }); },
  };
};
const click = async (el) => {
  await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
};
// Poll until the condition holds (React retries suspended renders on its own schedule).
const waitFor = async (cond, ms = 2000) => {
  const end = Date.now() + ms;
  while (!cond() && Date.now() < end) {
    await act(async () => { await new Promise((res) => setTimeout(res, 15)); });
  }
  return cond();
};
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const setup = async () => {
  const cache = new Map();
  const entry = (tab) => {
    if (!cache.has(tab)) cache.set(tab, deferred());
    return cache.get(tab);
  };
  const load = (tab) => entry(tab).promise;
  const r = await mountAsync(<TabbedViewer load={load} />);
  const tab = (label) => qa('[role="tab"]', r.container).find((b) => b.textContent === label);
  const panel = () => q('[role="tabpanel"]', r.container);
  const finish = async (id, text) => {
    await act(async () => { entry(id).resolve(text); });
    await waitFor(() => visibleText(panel()) === text);
  };
  return { r, finish, tab, panel };
};
{
  const { r, finish, panel } = await setup();
  const first = visibleText(panel());
  await finish('home', 'Welcome home');
  $test.check('The first load shows the fallback, then the home content', first === 'Loading…' && visibleText(panel()) === 'Welcome home', [first, visibleText(panel())]);
  await r.unmount();
}
{
  const { r, finish, tab, panel } = await setup();
  await finish('home', 'Welcome home');
  await click(tab('Posts'));
  await wait(20);
  $test.check('Switching tabs keeps the old panel on screen (no fallback) while the new one loads', visibleText(panel()) === 'Welcome home', visibleText(panel()));
  await r.unmount();
}
{
  const { r, finish, tab, panel } = await setup();
  await finish('home', 'Welcome home');
  const before = panel().getAttribute('aria-busy');
  await click(tab('Posts'));
  await wait(20);
  const during = panel().getAttribute('aria-busy');
  await finish('posts', 'Latest posts');
  const after = panel().getAttribute('aria-busy');
  $test.check('The tab panel is aria-busy="true" while the transition is pending and "false" otherwise', before === 'false' && during === 'true' && after === 'false', { before, during, after });
  await r.unmount();
}
{
  const { r, finish, tab, panel } = await setup();
  await finish('home', 'Welcome home');
  await click(tab('Posts'));
  await wait(20);
  const selectedWhilePending = tab('Home').getAttribute('aria-selected') + ',' + tab('Posts').getAttribute('aria-selected');
  await finish('posts', 'Latest posts');
  const selectedAfter = tab('Home').getAttribute('aria-selected') + ',' + tab('Posts').getAttribute('aria-selected');
  $test.check('When the new content arrives the panel and the selected tab switch together', selectedWhilePending === 'true,false' && visibleText(panel()) === 'Latest posts' && selectedAfter === 'false,true', { selectedWhilePending, selectedAfter, text: visibleText(panel()) });
  await r.unmount();
}
{
  const { r, finish, tab, panel } = await setup();
  await finish('home', 'Welcome home');
  await click(tab('Posts'));
  await wait(20);
  await finish('posts', 'Latest posts');
  await click(tab('Home'));
  await wait(20);
  $test.check('Going back to an already loaded tab shows its content straight away', visibleText(panel()) === 'Welcome home' && tab('Home').getAttribute('aria-selected') === 'true', visibleText(panel()));
  await r.unmount();
}
