const { render, fire, q, qa } = $dom;
const ITEMS = ['apple', 'banana', 'cherry'];
{
  const r = render(<Parent items={ITEMS} onListRender={() => {}} />);
  $test.check('Renders one list item per item', qa('li', r.container).map((li) => li.textContent).join() === 'apple,banana,cherry', qa('li', r.container).length);
  r.unmount();
}
{
  const r = render(<Parent items={ITEMS} onListRender={() => {}} />);
  fire.click(qa('li', r.container)[1]);
  $test.check('Clicking an item shows it as selected', q('p', r.container).textContent === 'Selected: banana', q('p', r.container).textContent);
  r.unmount();
}
{
  let renders = 0;
  const onListRender = () => renders++;
  const r = render(<Parent items={ITEMS} onListRender={onListRender} />);
  const initial = renders;
  const button = q('button', r.container);
  fire.click(button);
  fire.click(button);
  $test.check('Incrementing the counter does not re-render the memoized List', initial === 1 && renders === 1 && button.textContent === 'Count: 2', { initial, renders, label: button.textContent });
  r.unmount();
}
{
  let renders = 0;
  const onListRender = () => renders++;
  const r = render(<Parent items={ITEMS} onListRender={onListRender} />);
  fire.click(qa('li', r.container)[0]);
  fire.click(qa('li', r.container)[2]);
  $test.check('Selecting an item re-renders Parent but not the List', renders === 1 && q('p', r.container).textContent === 'Selected: cherry', { renders });
  r.unmount();
}
{
  let renders = 0;
  const onListRender = () => renders++;
  const r = render(<Parent items={ITEMS} onListRender={onListRender} />);
  r.rerender(<Parent items={['x', 'y']} onListRender={onListRender} />);
  $test.check('A new items array does re-render the List', renders === 2 && qa('li', r.container).length === 2, { renders });
  r.unmount();
}
