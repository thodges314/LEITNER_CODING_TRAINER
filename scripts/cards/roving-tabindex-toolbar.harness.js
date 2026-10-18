const { render, fire, q, qa } = $dom;
const ITEMS = [{ id: 'b', label: 'Bold' }, { id: 'i', label: 'Italic' }, { id: 'u', label: 'Underline' }, { id: 'l', label: 'Link' }];
const setup = () => render(<Toolbar label="Text formatting" items={ITEMS} />);
const buttons = (r) => qa('button', r.container);
const stops = (r) => buttons(r).map((b) => b.tabIndex).join();
const focused = () => (document.activeElement ? document.activeElement.textContent : null);
const key = (k) => fire.keyDown(document.activeElement, k);
{
  const r = setup();
  const t = q('[role="toolbar"]', r.container);
  $test.check('The container is a toolbar with an accessible label', !!t && t.getAttribute('aria-label') === 'Text formatting' && buttons(r).length === 4, t && t.outerHTML);
  r.unmount();
}
{
  const r = setup();
  $test.check('Only the active button is in the tab order: tabIndex 0 for the first by default, -1 for the others', stops(r) === '0,-1,-1,-1', stops(r));
  r.unmount();
}
{
  const r = setup();
  fire.focus(buttons(r)[0]);
  key('ArrowRight');
  const afterRight = [focused(), stops(r)];
  key('ArrowRight');
  key('ArrowLeft');
  const afterLeft = [focused(), stops(r)];
  $test.check('ArrowRight and ArrowLeft move focus and the tab stop to the next and previous button', afterRight.join('|') === 'Italic|-1,0,-1,-1' && afterLeft.join('|') === 'Italic|-1,0,-1,-1', { afterRight, afterLeft });
  r.unmount();
}
{
  const r = setup();
  fire.focus(buttons(r)[0]);
  key('ArrowLeft');
  const wrappedBack = [focused(), stops(r)];
  key('ArrowRight');
  const wrappedForward = [focused(), stops(r)];
  $test.check('Arrow keys wrap around at both ends', wrappedBack.join('|') === 'Link|-1,-1,-1,0' && wrappedForward.join('|') === 'Bold|0,-1,-1,-1', { wrappedBack, wrappedForward });
  r.unmount();
}
{
  const r = setup();
  fire.focus(buttons(r)[1]);
  key('End');
  const end = [focused(), stops(r)];
  key('Home');
  const home = [focused(), stops(r)];
  $test.check('Home and End jump to the first and last button', end.join('|') === 'Link|-1,-1,-1,0' && home.join('|') === 'Bold|0,-1,-1,-1', { end, home });
  r.unmount();
}
{
  const r = setup();
  fire.click(buttons(r)[2]);
  const afterClick = stops(r);
  fire.focus(buttons(r)[3]);
  const afterFocus = stops(r);
  $test.check('Clicking or focusing a button makes it the tab stop', afterClick === '-1,-1,0,-1' && afterFocus === '-1,-1,-1,0', { afterClick, afterFocus });
  r.unmount();
}
