const { render, fire, q, qa, wait } = $dom;
const ITEMS = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
const setup = (items = ITEMS) => render(<VirtualList items={items} itemHeight={20} height={100} overscan={2} />);
const texts = (c) => qa('[role="listitem"]', c).map((el) => el.textContent);
const scrollTo = async (c, top) => {
  const list = q('[role="list"]', c);
  Object.defineProperty(list, 'scrollTop', { value: top, configurable: true });
  fire.event(list, new Event('scroll'));
  await wait(30); // scroll updates are continuous priority: let React render them
};
{
  const r = setup();
  const t = texts(r.container);
  $test.check('Renders only the visible window plus overscan', t.length === 7 && t[0] === 'Item 0' && t[6] === 'Item 6', { count: t.length, first: t[0], last: t[t.length - 1] });
  r.unmount();
}
{
  const r = setup();
  $test.check('The scroll area has the full virtual height', qa('div', r.container).some((d) => d.style.height === '20000px'), 'no 20000px inner element');
  r.unmount();
}
{
  const r = setup();
  await scrollTo(r.container, 2000);
  const t = texts(r.container);
  $test.check('Scrolling moves the rendered window', t.includes('Item 100') && !t.includes('Item 0') && t[0] === 'Item 98' && t.length === 9, { first: t[0], count: t.length });
  r.unmount();
}
{
  const r = setup();
  await scrollTo(r.container, 2000);
  const row = qa('[role="listitem"]', r.container).find((el) => el.textContent === 'Item 100');
  $test.check('Items are absolutely positioned at index * itemHeight', row && row.style.position === 'absolute' && row.style.top === '2000px' && row.style.height === '20px', row && row.getAttribute('style'));
  r.unmount();
}
{
  const r = setup();
  await scrollTo(r.container, 19900);
  const t = texts(r.container);
  $test.check('The window is clamped at the end of the list', t[t.length - 1] === 'Item 999' && t.length <= 10, { last: t[t.length - 1], count: t.length });
  r.unmount();
}
{
  const r = setup(['a', 'b', 'c']);
  $test.check('Short lists render everything', texts(r.container).join() === 'a,b,c', texts(r.container));
  r.unmount();
}
