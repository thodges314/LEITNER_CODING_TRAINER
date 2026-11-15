const { render, fire, q, qa } = $dom;
const TABS = [
  { id: 'overview', label: 'Overview', content: 'Overview content' },
  { id: 'api', label: 'API', content: 'API reference' },
  { id: 'examples', label: 'Examples', content: 'Usage examples' },
];

{
  const r = render(<Tabs tabs={TABS} />);
  const tablist = q('[role="tablist"]', r.container);
  const buttons = qa('[role="tab"]', r.container);
  const panel = q('[role="tabpanel"]', r.container);
  $test.check(
    'Renders tablist, tab buttons, and first panel active by default',
    !!tablist &&
      buttons.length === 3 &&
      buttons[0].getAttribute('aria-selected') === 'true' &&
      buttons[1].getAttribute('aria-selected') === 'false' &&
      panel?.textContent === 'Overview content',
    { buttons: buttons.map((b) => b.getAttribute('aria-selected')), panel: panel?.textContent }
  );
  r.unmount();
}

{
  const r = render(<Tabs tabs={TABS} defaultIndex={1} />);
  const buttons = qa('[role="tab"]', r.container);
  const panel = q('[role="tabpanel"]', r.container);
  $test.check(
    'Respects defaultIndex on initial render',
    buttons[1].getAttribute('aria-selected') === 'true' &&
      buttons[0].getAttribute('aria-selected') === 'false' &&
      panel?.textContent === 'API reference',
    { selected: buttons.map((b) => b.getAttribute('aria-selected')), panel: panel?.textContent }
  );
  r.unmount();
}

{
  const r = render(<Tabs tabs={TABS} />);
  const buttons = qa('[role="tab"]', r.container);
  fire.click(buttons[2]);
  const panel = q('[role="tabpanel"]', r.container);
  $test.check(
    'Clicking a tab switches aria-selected and the visible tabpanel content',
    buttons[2].getAttribute('aria-selected') === 'true' &&
      buttons[0].getAttribute('aria-selected') === 'false' &&
      panel?.textContent === 'Usage examples',
    { selected: buttons.map((b) => b.getAttribute('aria-selected')), panel: panel?.textContent }
  );
  r.unmount();
}

{
  const r = render(<Tabs tabs={[]} />);
  $test.check(
    'Empty tabs array renders no tabs and no tabpanel',
    qa('[role="tab"]', r.container).length === 0 && !q('[role="tabpanel"]', r.container),
    r.container.innerHTML
  );
  r.unmount();
}

