const { render, q, qa } = $dom;
const COLUMNS = [{ key: 'name', label: 'Name' }, { key: 'age', label: 'Age' }];
const cells = (c, sel) => qa(sel, c).map((x) => x.textContent).join();
{
  const r = render(<SimpleTable columns={COLUMNS} rows={[{ name: 'Ada', age: 36 }]} />);
  $test.check('Renders one header cell per column label', cells(r.container, 'thead th') === 'Name,Age', cells(r.container, 'thead th'));
  r.unmount();
}
{
  const r = render(<SimpleTable columns={COLUMNS} rows={[{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }]} />);
  $test.check('Renders one row per item with cells in column order', qa('tbody tr', r.container).length === 2 && cells(r.container, 'tbody td') === 'Ada,36,Grace,45', cells(r.container, 'tbody td'));
  r.unmount();
}
{
  const r = render(<SimpleTable columns={COLUMNS} rows={[{ name: 'Ada' }, { age: null, name: 'Bob' }]} />);
  $test.check('Missing, undefined and null values render as empty cells', cells(r.container, 'tbody td') === 'Ada,,Bob,', cells(r.container, 'tbody td'));
  r.unmount();
}
{
  const r = render(<SimpleTable columns={COLUMNS} rows={[]} />);
  const td = q('tbody td', r.container);
  $test.check('An empty table shows a single "No rows" cell spanning all columns', qa('tbody tr', r.container).length === 1 && td.textContent === 'No rows' && td.colSpan === 2, td && td.outerHTML);
  r.unmount();
}
