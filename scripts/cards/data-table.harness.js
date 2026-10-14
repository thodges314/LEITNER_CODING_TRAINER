const { render, fire, q, qa } = $dom;
const COLUMNS = [{ key: 'name', label: 'Name' }, { key: 'age', label: 'Age' }];
const ROWS = [
  { name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }, { name: 'Linus', age: 10 }, { name: 'Alan', age: 41 },
  { name: 'Margaret', age: 9 }, { name: 'Dennis', age: 70 }, { name: 'Barbara', age: 33 },
];
const setup = () => render(<DataTable rows={ROWS} columns={COLUMNS} pageSize={3} />);
const names = (c) => qa('tbody tr', c).map((tr) => tr.querySelector('td').textContent).join();
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
const label = (c) => q('span', c).textContent;
const sortOf = (c, i) => qa('th', c)[i].getAttribute('aria-sort');
{
  const r = setup();
  $test.check('Renders a header per column and the first page of rows', qa('th', r.container).map((th) => th.textContent).join() === 'Name,Age' && names(r.container) === 'Ada,Grace,Linus' && label(r.container) === 'Page 1 of 3', { names: names(r.container), label: label(r.container) });
  r.unmount();
}
{
  const r = setup();
  fire.click(btn(r.container, 'Name'));
  const asc = names(r.container) + '|' + sortOf(r.container, 0);
  fire.click(btn(r.container, 'Name'));
  const desc = names(r.container) + '|' + sortOf(r.container, 0);
  fire.click(btn(r.container, 'Name'));
  const none = names(r.container) + '|' + sortOf(r.container, 0);
  $test.check('Clicking a header sorts ascending, then descending, then restores the original order', asc === 'Ada,Alan,Barbara|ascending' && desc === 'Margaret,Linus,Grace|descending' && none === 'Ada,Grace,Linus|none', { asc, desc, none });
  r.unmount();
}
{
  const r = setup();
  fire.click(btn(r.container, 'Age'));
  $test.check('Numbers sort numerically (9 before 10) and other columns reset to none', names(r.container) === 'Margaret,Linus,Barbara' && sortOf(r.container, 0) === 'none' && sortOf(r.container, 1) === 'ascending', { names: names(r.container) });
  r.unmount();
}
{
  const r = setup();
  fire.change(q('input', r.container), 'ALAN');
  const byName = names(r.container);
  fire.change(q('input', r.container), '4');
  $test.check('Filter matches any column, case-insensitively', byName === 'Alan' && names(r.container) === 'Grace,Alan', { byName, byAge: names(r.container) });
  r.unmount();
}
{
  const r = setup();
  fire.change(q('input', r.container), 'zzz');
  const td = q('tbody td', r.container);
  $test.check('No matches shows "No results" and Page 1 of 1', qa('tbody tr', r.container).length === 1 && td.textContent === 'No results' && td.colSpan === 2 && label(r.container) === 'Page 1 of 1', { label: label(r.container) });
  r.unmount();
}
{
  const r = setup();
  const prevDisabled = btn(r.container, 'Previous').disabled;
  fire.click(btn(r.container, 'Next'));
  const page2 = names(r.container) + '|' + label(r.container);
  fire.click(btn(r.container, 'Next'));
  $test.check('Pagination: Next / Previous move between pages and are disabled at the ends', prevDisabled && page2 === 'Alan,Margaret,Dennis|Page 2 of 3' && names(r.container) === 'Barbara' && btn(r.container, 'Next').disabled && !btn(r.container, 'Previous').disabled, { page2, last: names(r.container) });
  r.unmount();
}
{
  const r = setup();
  fire.click(btn(r.container, 'Next'));
  fire.change(q('input', r.container), '4');
  $test.check('Filtering returns to page 1', label(r.container) === 'Page 1 of 1' && names(r.container) === 'Grace,Alan', { label: label(r.container) });
  r.unmount();
}
{
  const r = setup();
  fire.click(btn(r.container, 'Age'));
  fire.click(btn(r.container, 'Age')); // descending: 70, 45, 41 | 36, 33, 10 | 9
  fire.click(btn(r.container, 'Next'));
  $test.check('Sorting applies across all pages, not just the visible one', names(r.container) === 'Ada,Barbara,Linus', names(r.container));
  r.unmount();
}
