const { render, fire, wait, q, qa, act } = $dom;
{
  const calls = [];
  const selected = [];
  const { container } = render(
    <Typeahead
      delay={90}
      onSelect={(v) => selected.push(v)}
      fetchSuggestions={async (text) => {
        calls.push(text);
        return ['react', 'read', 'real'];
      }}
    />
  );
  const input = q('input', container);
  fire.change(input, 'r');
  fire.change(input, 're');
  fire.change(input, 'rea');
  await wait(300);
  $test.check('Debounces input into a single fetch', calls.length === 1 && calls[0] === 'rea', calls);
  const options = qa('[role="option"]', container);
  $test.check(
    'Renders suggestions with combobox ARIA roles',
    input.getAttribute('role') === 'combobox' && input.getAttribute('aria-expanded') === 'true' && q('[role="listbox"]', container) !== null && options.length === 3,
    options.length
  );
  fire.keyDown(input, 'ArrowDown');
  fire.keyDown(input, 'ArrowDown');
  const flags = qa('[role="option"]', container).map((o) => o.getAttribute('aria-selected'));
  $test.check('ArrowDown moves the active option', flags.join() === 'false,true,false', flags);
  fire.keyDown(input, 'Enter');
  $test.check('Enter selects the active option', selected.length === 1 && selected[0] === 'read' && q('[role="listbox"]', container) === null, selected);
  fire.change(input, 'real');
  await wait(300);
  fire.keyDown(input, 'Escape');
  $test.check('Escape closes the list', q('[role="listbox"]', container) === null && input.getAttribute('aria-expanded') === 'false');
}
{
  const pending = {};
  const { container } = render(
    <Typeahead delay={60} onSelect={() => {}} fetchSuggestions={(text) => new Promise((resolve) => { pending[text] = resolve; })} />
  );
  const input = q('input', container);
  fire.change(input, 're');
  await wait(180);
  fire.change(input, 'rea');
  await wait(180);
  await act(async () => { pending['rea'](['real']); });
  await act(async () => { pending['re'](['stale']); });
  const texts = qa('[role="option"]', container).map((o) => o.textContent);
  $test.check('Ignores out-of-order responses', texts.join() === 'real', texts);
}
