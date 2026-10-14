const { render, fire, qa } = $dom;
const ITEMS = [
  { id: 'a', title: 'First', content: 'Alpha text' },
  { id: 'b', title: 'Second', content: 'Beta text' },
  { id: 'c', title: 'Third', content: 'Gamma text' },
];
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const panels = (c) => qa('[role="region"]', c).map((p) => p.textContent).join();
{
  const r = render(<Accordion items={ITEMS} />);
  const expanded = qa('button', r.container).map((b) => b.getAttribute('aria-expanded')).join();
  $test.check('All panels start closed', panels(r.container) === '' && expanded === 'false,false,false' && qa('h3', r.container).length === 3, { expanded });
  r.unmount();
}
{
  const r = render(<Accordion items={ITEMS} />);
  fire.click(btn(r.container, 'Second'));
  $test.check('Clicking a title opens its panel (aria-expanded=true)', panels(r.container) === 'Beta text' && btn(r.container, 'Second').getAttribute('aria-expanded') === 'true', panels(r.container));
  r.unmount();
}
{
  const r = render(<Accordion items={ITEMS} />);
  fire.click(btn(r.container, 'First'));
  fire.click(btn(r.container, 'Third'));
  $test.check('Opening another panel closes the first by default', panels(r.container) === 'Gamma text' && btn(r.container, 'First').getAttribute('aria-expanded') === 'false', panels(r.container));
  r.unmount();
}
{
  const r = render(<Accordion items={ITEMS} />);
  fire.click(btn(r.container, 'First'));
  fire.click(btn(r.container, 'First'));
  $test.check('Clicking an open title closes it', panels(r.container) === '', panels(r.container));
  r.unmount();
}
{
  const r = render(<Accordion items={ITEMS} allowMultiple />);
  fire.click(btn(r.container, 'First'));
  fire.click(btn(r.container, 'Third'));
  $test.check('allowMultiple keeps several panels open', panels(r.container) === 'Alpha text,Gamma text', panels(r.container));
  r.unmount();
}
{
  const r = render(<Accordion items={ITEMS} />);
  fire.click(btn(r.container, 'Second'));
  const button = btn(r.container, 'Second');
  const panel = qa('[role="region"]', r.container)[0];
  $test.check('Buttons are wired to their panels with aria-controls and aria-labelledby', button.getAttribute('aria-controls') === panel.id && panel.getAttribute('aria-labelledby') === button.id && panel.id !== '', { controls: button.getAttribute('aria-controls'), panelId: panel.id });
  r.unmount();
}
