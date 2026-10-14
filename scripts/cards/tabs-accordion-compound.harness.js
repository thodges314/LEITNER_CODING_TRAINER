const { render, fire, q, qa } = $dom;
const make = (props) => (
  <Tabs defaultValue="one" {...props}>
    <TabList>
      <Tab value="one">One</Tab>
      <Tab value="two">Two</Tab>
      <Tab value="three">Three</Tab>
    </TabList>
    <TabPanel value="one">Panel one</TabPanel>
    <TabPanel value="two">Panel two</TabPanel>
    <TabPanel value="three">Panel three</TabPanel>
  </Tabs>
);
{
  const { container } = render(make({}));
  const panelTexts = () => qa('[role="tabpanel"]', container).map((p) => p.textContent);
  $test.check('defaultValue shows only its panel', panelTexts().join() === 'Panel one', panelTexts());
  const tabs = qa('[role="tab"]', container);
  fire.click(tabs[1]);
  $test.check(
    'Clicking a tab switches the panel',
    panelTexts().join() === 'Panel two' && tabs[1].getAttribute('aria-selected') === 'true' && tabs[0].getAttribute('aria-selected') === 'false',
    panelTexts()
  );
  const panel = q('[role="tabpanel"]', container);
  $test.check(
    'Tabs and panels are wired with ARIA',
    q('[role="tablist"]', container) !== null && panel.id !== '' && tabs[1].getAttribute('aria-controls') === panel.id && panel.getAttribute('aria-labelledby') === tabs[1].id,
    { panelId: panel.id }
  );
  fire.focus(tabs[0]);
  fire.keyDown(tabs[0], 'ArrowRight');
  const toSecond = document.activeElement === tabs[1];
  fire.keyDown(tabs[1], 'ArrowRight');
  fire.keyDown(tabs[2], 'ArrowRight');
  $test.check('Arrow keys move focus between tabs (wrapping)', toSecond && document.activeElement === tabs[0]);
}
{
  const calls = [];
  const onChange = (v) => calls.push(v);
  const r = render(make({ defaultValue: undefined, value: 'one', onChange }));
  const tabs = qa('[role="tab"]', r.container);
  fire.click(tabs[1]);
  const stayed = qa('[role="tabpanel"]', r.container).map((p) => p.textContent).join();
  r.rerender(make({ defaultValue: undefined, value: 'two', onChange }));
  const moved = qa('[role="tabpanel"]', r.container).map((p) => p.textContent).join();
  $test.check('Controlled mode calls onChange and waits for the value prop', calls.join() === 'two' && stayed === 'Panel one' && moved === 'Panel two', { calls, stayed, moved });
}
