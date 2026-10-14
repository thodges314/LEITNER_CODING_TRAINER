const { render, fire, q, qa } = $dom;
const stars = (c) => qa('[role="radio"]', c);
const filled = (c) => stars(c).filter((s) => s.getAttribute('data-filled') === 'true').length;
{
  const r = render(<StarRating value={2} />);
  const radios = stars(r.container);
  $test.check(
    'Renders a labelled radiogroup with max stars (default 5)',
    q('[role="radiogroup"]', r.container) !== null && radios.length === 5 && radios[0].getAttribute('aria-label') === '1 star' && radios[1].getAttribute('aria-label') === '2 stars',
    radios.length
  );
  r.rerender(<StarRating value={2} max={8} />);
  $test.check('The max prop changes the number of stars', stars(r.container).length === 8, stars(r.container).length);
  r.unmount();
}
{
  const r = render(<StarRating value={3} />);
  const checked = stars(r.container).map((s) => s.getAttribute('aria-checked')).join();
  $test.check('The selected star is aria-checked and stars up to the value are filled', checked === 'false,false,true,false,false' && filled(r.container) === 3, { checked, filled: filled(r.container) });
  r.unmount();
}
{
  const calls = [];
  const r = render(<StarRating value={2} onChange={(n) => calls.push(n)} />);
  fire.click(stars(r.container)[3]);
  $test.check('Clicking a star calls onChange with its number', calls.join() === '4', calls);
  r.unmount();
}
{
  const calls = [];
  const r = render(<StarRating value={2} onChange={(n) => calls.push(n)} />);
  fire.click(stars(r.container)[1]);
  $test.check('Clicking the current rating clears it (onChange(0))', calls.join() === '0', calls);
  r.unmount();
}
{
  const r = render(<StarRating value={1} />);
  const group = q('[role="radiogroup"]', r.container);
  fire.event(stars(r.container)[3], new MouseEvent('mouseover', { bubbles: true }));
  const during = filled(r.container);
  fire.event(group, new MouseEvent('mouseout', { bubbles: true }));
  $test.check('Hovering previews a rating and leaving the group restores it', during === 4 && filled(r.container) === 1, { during, after: filled(r.container) });
  r.unmount();
}
{
  const calls = [];
  const r = render(<StarRating value={5} onChange={(n) => calls.push(n)} />);
  const first = stars(r.container)[0];
  fire.keyDown(first, 'ArrowRight');
  fire.keyDown(first, 'ArrowLeft');
  r.rerender(<StarRating value={1} onChange={(n) => calls.push(n)} />);
  fire.keyDown(stars(r.container)[0], 'ArrowLeft');
  fire.keyDown(stars(r.container)[0], 'ArrowUp');
  $test.check('Arrow keys change the rating within 1..max', calls.join() === '5,4,1,2', calls);
  r.unmount();
}
{
  const r = render(<StarRating value={3} />);
  const tabs = stars(r.container).map((s) => s.tabIndex).join();
  r.rerender(<StarRating value={0} />);
  const tabsZero = stars(r.container).map((s) => s.tabIndex).join();
  $test.check('Only one star is in the tab order (roving tabindex)', tabs === '-1,-1,0,-1,-1' && tabsZero === '0,-1,-1,-1,-1', { tabs, tabsZero });
  r.unmount();
}
