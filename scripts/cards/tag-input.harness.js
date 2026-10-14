const { render, fire, q, qa } = $dom;
const tagsOf = (c) => qa('li', c).map((li) => li.firstChild.textContent).join();
// Controlled wrapper: keeps `value` in sync so typing flows like in a real page.
function Host({ initial = [], max, log }) {
  const [value, setValue] = useState(initial);
  return <TagInput value={value} max={max} onChange={(next) => { log && log.push(next); setValue(next); }} />;
}
const type = (c, text, key = 'Enter') => {
  const input = q('input', c);
  fire.change(input, text);
  fire.keyDown(input, key);
};
{
  const r = render(<Host initial={['react', 'css']} />);
  const removeLabels = qa('button', r.container).map((b) => b.getAttribute('aria-label')).join();
  $test.check('Renders the tags in a labelled list with a Remove button each', q('ul', r.container).getAttribute('aria-label') === 'Tags' && tagsOf(r.container) === 'react,css' && removeLabels === 'Remove react,Remove css' && q('input', r.container).getAttribute('aria-label') === 'Add tag', { removeLabels });
  r.unmount();
}
{
  const r = render(<Host />);
  type(r.container, '  vue  ');
  $test.check('Enter adds the trimmed text as a tag and clears the input', tagsOf(r.container) === 'vue' && q('input', r.container).value === '', { tags: tagsOf(r.container) });
  r.unmount();
}
{
  const r = render(<Host />);
  type(r.container, 'svelte', ',');
  const event = fire.keyDown(q('input', r.container), ',');
  $test.check('A comma also adds the tag, and the key default is prevented', tagsOf(r.container) === 'svelte' && event.defaultPrevented === true, { tags: tagsOf(r.container) });
  r.unmount();
}
{
  const r = render(<Host initial={['React']} />);
  type(r.container, 'react');
  type(r.container, '   ');
  const kept = tagsOf(r.container) === 'React' && q('input', r.container).value === '';
  $test.check('Duplicates (case-insensitive) and empty text are ignored', kept, { tags: tagsOf(r.container) });
  r.unmount();
}
{
  const r = render(<Host initial={['a', 'b']} />);
  fire.keyDown(q('input', r.container), 'Backspace');
  const afterOne = tagsOf(r.container);
  fire.change(q('input', r.container), 'x');
  fire.keyDown(q('input', r.container), 'Backspace');
  $test.check('Backspace in an empty input removes the last tag (not while typing)', afterOne === 'a' && tagsOf(r.container) === 'a', { afterOne, now: tagsOf(r.container) });
  r.unmount();
}
{
  const r = render(<Host initial={['a', 'b']} />);
  fire.click(qa('button', r.container).find((b) => b.getAttribute('aria-label') === 'Remove a'));
  $test.check('The Remove button removes that tag', tagsOf(r.container) === 'b', tagsOf(r.container));
  r.unmount();
}
{
  const log = [];
  const r = render(<Host initial={['a']} max={2} log={log} />);
  type(r.container, 'b');
  type(r.container, 'c');
  $test.check('No more tags are added once max is reached', tagsOf(r.container) === 'a,b' && log.length === 1, { tags: tagsOf(r.container), calls: log.length });
  r.unmount();
}
