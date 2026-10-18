const { render, fire, q, qa } = $dom;
const ITEMS = [30, 4, 100, 12];
{
  const items = [...ITEMS];
  const r = render(<SortedList items={items} />);
  $test.check('Renders the items sorted ascending without mutating the prop', qa('li', r.container).map((li) => li.textContent).join() === '4,12,30,100' && items.join() === '30,4,100,12', { shown: qa('li', r.container).map((li) => li.textContent).join(), prop: items.join() });
  r.unmount();
}
{
  let computes = 0;
  const items = [...ITEMS];
  const r = render(<SortedList items={items} onCompute={() => computes++} />);
  const initial = computes;
  fire.click(q('button', r.container));
  fire.click(q('button', r.container));
  $test.check('Clicking the counter does not recompute the sorted list', initial === 1 && computes === 1 && q('button', r.container).textContent === 'Count: 2', { initial, computes });
  r.unmount();
}
{
  let computes = 0;
  const onCompute = () => computes++;
  const r = render(<SortedList items={[3, 1, 2]} onCompute={onCompute} />);
  r.rerender(<SortedList items={[9, 8]} onCompute={onCompute} />);
  $test.check('A new items array does recompute it', computes === 2 && qa('li', r.container).map((li) => li.textContent).join() === '8,9', { computes });
  r.unmount();
}
{
  const r = render(<SortedList items={[]} />);
  $test.check('An empty list renders no items but keeps the counter', qa('li', r.container).length === 0 && q('button', r.container).textContent === 'Count: 0', r.container.innerHTML);
  r.unmount();
}
