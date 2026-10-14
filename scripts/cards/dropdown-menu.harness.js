const { render, fire, q, qa } = $dom;
const ITEMS = [
  { id: 'edit', label: 'Edit' },
  { id: 'copy', label: 'Copy' },
  { id: 'del', label: 'Delete', disabled: true },
  { id: 'share', label: 'Share' },
];
const setup = (onSelect = () => {}) => render(<div><DropdownMenu label="Actions" items={ITEMS} onSelect={onSelect} /><button id="outside">outside</button></div>);
const trigger = (c) => qa('button', c).find((b) => b.textContent === 'Actions');
const items = (c) => qa('[role="menuitem"]', c);
const focused = () => document.activeElement && document.activeElement.textContent;
const key = (k) => fire.keyDown(document.activeElement, k);
{
  const r = setup();
  const t = trigger(r.container);
  $test.check('Closed by default: the trigger has aria-haspopup and aria-expanded=false', q('[role="menu"]', r.container) === null && t.getAttribute('aria-haspopup') === 'menu' && t.getAttribute('aria-expanded') === 'false', t.outerHTML);
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  $test.check('Clicking the trigger opens the menu (aria-expanded=true, four items)', trigger(r.container).getAttribute('aria-expanded') === 'true' && q('[role="menu"]', r.container) !== null && items(r.container).length === 4, items(r.container).length);
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  $test.check('Opening focuses the first enabled item', focused() === 'Edit', focused());
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  const seen = [focused()];
  key('ArrowDown'); seen.push(focused());
  key('ArrowDown'); seen.push(focused());
  key('ArrowDown'); seen.push(focused());
  key('ArrowUp'); seen.push(focused());
  $test.check('ArrowDown/ArrowUp move between enabled items, skip disabled ones and wrap', seen.join() === 'Edit,Copy,Share,Edit,Share', seen);
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  key('End');
  const last = focused();
  key('Home');
  $test.check('Home and End jump to the first and last enabled items', last === 'Share' && focused() === 'Edit', { last, first: focused() });
  r.unmount();
}
{
  const picked = [];
  const r = setup((id) => picked.push(id));
  fire.click(trigger(r.container));
  fire.click(items(r.container)[1]);
  $test.check('Clicking an item calls onSelect, closes the menu and refocuses the trigger', picked.join() === 'copy' && q('[role="menu"]', r.container) === null && document.activeElement === trigger(r.container), { picked, active: focused() });
  r.unmount();
}
{
  const picked = [];
  const r = setup((id) => picked.push(id));
  fire.click(trigger(r.container));
  key('ArrowDown');
  key('Enter');
  $test.check('Enter on a focused item selects it', picked.join() === 'copy' && q('[role="menu"]', r.container) === null, picked);
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  key('Escape');
  $test.check('Escape closes the menu and refocuses the trigger', q('[role="menu"]', r.container) === null && document.activeElement === trigger(r.container), focused());
  r.unmount();
}
{
  const r = setup();
  fire.click(trigger(r.container));
  fire.event(q('#outside', r.container), new MouseEvent('mousedown', { bubbles: true }));
  $test.check('A mousedown outside closes the menu', q('[role="menu"]', r.container) === null, r.container.innerHTML);
  r.unmount();
}
{
  const picked = [];
  const r = setup((id) => picked.push(id));
  fire.click(trigger(r.container));
  fire.click(items(r.container)[2]);
  $test.check('Disabled items cannot be selected (the menu stays open)', picked.length === 0 && q('[role="menu"]', r.container) !== null && items(r.container)[2].getAttribute('aria-disabled') === 'true', picked);
  r.unmount();
}
