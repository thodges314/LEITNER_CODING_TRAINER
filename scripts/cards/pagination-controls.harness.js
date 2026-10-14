const { render, fire, q, qa } = $dom;
const items = (c) => qa('li', c).map((li) => li.textContent).join();
const nav = (c, text) => qa('nav > button', c).find((b) => b.textContent === text);
const mount3 = (props) => render(<Pagination onPageChange={() => {}} {...props} />);
{
  const r = mount3({ page: 1, totalPages: 4 });
  $test.check('Renders Previous, the numbered pages and Next in a labelled nav', q('nav', r.container).getAttribute('aria-label') === 'Pagination' && items(r.container) === '1,2,3,4' && nav(r.container, 'Previous') && nav(r.container, 'Next'), items(r.container));
  r.unmount();
}
{
  const r = mount3({ page: 3, totalPages: 5 });
  const current = qa('[aria-current]', r.container).map((b) => b.textContent).join();
  $test.check('The current page has aria-current="page" (and only it)', current === '3' && q('[aria-current]', r.container).getAttribute('aria-current') === 'page', current);
  r.unmount();
}
{
  const r = mount3({ page: 5, totalPages: 10 });
  const mid = items(r.container);
  r.rerender(<Pagination page={1} totalPages={10} onPageChange={() => {}} />);
  const start = items(r.container);
  r.rerender(<Pagination page={10} totalPages={10} onPageChange={() => {}} />);
  $test.check('Long ranges collapse with ellipses around the current page', mid === '1,…,4,5,6,…,10' && start === '1,2,…,10' && items(r.container) === '1,…,9,10', { mid, start, end: items(r.container) });
  r.unmount();
}
{
  const r = mount3({ page: 4, totalPages: 7 });
  const all = items(r.container);
  r.rerender(<Pagination page={5} totalPages={9} onPageChange={() => {}} />);
  $test.check('A single missing page is shown instead of an ellipsis', all === '1,2,3,4,5,6,7' && items(r.container) === '1,…,4,5,6,…,9', { all, other: items(r.container) });
  r.unmount();
}
{
  const r = mount3({ page: 5, totalPages: 12, siblings: 2 });
  $test.check('siblings widens the window around the current page', items(r.container) === '1,2,3,4,5,6,7,…,12', items(r.container));
  r.unmount();
}
{
  const calls = [];
  const r = mount3({ page: 3, totalPages: 6, onPageChange: (n) => calls.push(n) });
  fire.click(nav(r.container, 'Previous'));
  fire.click(nav(r.container, 'Next'));
  fire.click(qa('li button', r.container).find((b) => b.textContent === '6'));
  $test.check('Previous, Next and the page buttons call onPageChange with the target page', calls.join() === '2,4,6', calls);
  r.unmount();
}
{
  const r = mount3({ page: 1, totalPages: 4 });
  const first = nav(r.container, 'Previous').disabled && !nav(r.container, 'Next').disabled;
  r.rerender(<Pagination page={4} totalPages={4} onPageChange={() => {}} />);
  $test.check('Previous is disabled on the first page and Next on the last', first && nav(r.container, 'Next').disabled && !nav(r.container, 'Previous').disabled, 'disabled flags wrong');
  r.unmount();
}
{
  const calls = [];
  const r = mount3({ page: 5, totalPages: 10, onPageChange: (n) => calls.push(n) });
  const gap = qa('li', r.container).find((li) => li.textContent === '…');
  fire.click(gap);
  $test.check('The ellipsis is plain text, not a button', gap.querySelector('button') === null && calls.length === 0, calls);
  r.unmount();
}
