const { render, fire, q, qa } = $dom;
const ITEMS = ['Apple', 'Banana', 'Cherry', 'apricot', 'Blueberry'];
const lis = (c) => qa('li', c).map((li) => li.textContent).join();
const status = (c) => q('[role="status"]', c).textContent;
{
  const r = render(<FilterList items={ITEMS} />);
  $test.check('Shows every item and the count before typing', lis(r.container) === 'Apple,Banana,Cherry,apricot,Blueberry' && status(r.container) === '5 results', { items: lis(r.container), status: status(r.container) });
  r.unmount();
}
{
  const r = render(<FilterList items={ITEMS} />);
  fire.change(q('input', r.container), 'AP');
  $test.check('Filters case-insensitively as you type', lis(r.container) === 'Apple,apricot' && status(r.container) === '2 results', { items: lis(r.container), status: status(r.container) });
  r.unmount();
}
{
  const r = render(<FilterList items={ITEMS} />);
  fire.change(q('input', r.container), '  blue ');
  $test.check('Whitespace around the query is ignored', lis(r.container) === 'Blueberry', lis(r.container));
  r.unmount();
}
{
  const r = render(<FilterList items={ITEMS} />);
  fire.change(q('input', r.container), 'zzz');
  $test.check('Shows "No matches" when nothing matches', lis(r.container) === '' && status(r.container) === 'No matches', { items: lis(r.container), status: status(r.container) });
  r.unmount();
}
{
  const r = render(<FilterList items={ITEMS} />);
  fire.change(q('input', r.container), 'cher');
  const one = status(r.container);
  fire.change(q('input', r.container), '');
  $test.check('Uses the singular "1 result" and an empty query shows everything again', one === '1 result' && status(r.container) === '5 results', { one, after: status(r.container) });
  r.unmount();
}
