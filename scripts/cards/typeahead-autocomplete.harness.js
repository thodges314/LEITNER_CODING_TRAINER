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
{
  // helpers for the keyboard / ARIA checks below
  const make = (extra = {}) => {
    const selected = [];
    const { container } = render(
      <Typeahead
        delay={30}
        onSelect={(v) => selected.push(v)}
        fetchSuggestions={async () => ['react', 'read', 'real']}
        {...extra}
      />
    );
    return { container, selected, input: q('input', container) };
  };
  const flagsOf = (container) => qa('[role="option"]', container).map((o) => o.getAttribute('aria-selected')).join();
  const open = async (input) => {
    fire.change(input, 're');
    await wait(200);
  };

  {
    const { container, input } = make();
    $test.check(
      'Starts closed: aria-expanded is false and there is no listbox',
      input.getAttribute('role') === 'combobox' && input.getAttribute('aria-expanded') === 'false' && q('[role="listbox"]', container) === null
    );
  }
  {
    const { container, input } = make();
    await open(input);
    $test.check('No option is active until an arrow key is pressed', flagsOf(container) === 'false,false,false' && !input.getAttribute('aria-activedescendant'), flagsOf(container));
    fire.keyDown(input, 'ArrowDown');
    const options = qa('[role="option"]', container);
    $test.check('The first ArrowDown activates the FIRST option', flagsOf(container) === 'true,false,false', flagsOf(container));
    $test.check(
      'aria-activedescendant points at the active option',
      input.getAttribute('aria-activedescendant') === options[0].id && options[0].id !== '',
      input.getAttribute('aria-activedescendant')
    );
    fire.keyDown(input, 'ArrowDown');
    $test.check(
      'aria-activedescendant follows the active option',
      input.getAttribute('aria-activedescendant') === qa('[role="option"]', container)[1].id,
      input.getAttribute('aria-activedescendant')
    );
  }
  {
    const { container, input } = make();
    await open(input);
    for (let i = 0; i < 5; i++) fire.keyDown(input, 'ArrowDown');
    $test.check('ArrowDown stops at the last option', flagsOf(container) === 'false,false,true', flagsOf(container));
  }
  {
    const { container, input } = make();
    await open(input);
    fire.keyDown(input, 'ArrowDown');
    fire.keyDown(input, 'ArrowDown');
    fire.keyDown(input, 'ArrowDown');
    fire.keyDown(input, 'ArrowUp');
    $test.check('ArrowUp moves the active option back up', flagsOf(container) === 'false,true,false', flagsOf(container));
    fire.keyDown(input, 'ArrowUp');
    fire.keyDown(input, 'ArrowUp');
    fire.keyDown(input, 'ArrowUp');
    $test.check('ArrowUp stops at the first option', flagsOf(container) === 'true,false,false', flagsOf(container));
  }
  {
    const { container, input, selected } = make();
    await open(input);
    fire.keyDown(input, 'ArrowDown');
    fire.keyDown(input, 'Enter');
    $test.check('Enter selects the first option too', selected.length === 1 && selected[0] === 'react' && q('[role="listbox"]', container) === null, selected);
  }
  {
    const { container, input, selected } = make();
    await open(input);
    fire.keyDown(input, 'Enter');
    $test.check('Enter with no active option selects nothing and keeps the list open', selected.length === 0 && q('[role="listbox"]', container) !== null, selected);
  }
  {
    const { input, selected } = make();
    await open(input);
    fire.keyDown(input, 'ArrowDown');
    fire.keyDown(input, 'Escape');
    fire.keyDown(input, 'Enter');
    $test.check('Enter after Escape selects nothing (the list is closed)', selected.length === 0, selected);
  }
  {
    const { container, input } = make();
    await open(input);
    fire.change(input, '');
    await wait(150);
    $test.check(
      'Clearing the input closes the list',
      q('[role="listbox"]', container) === null && input.getAttribute('aria-expanded') === 'false'
    );
  }
  {
    const calls = [];
    const { input } = make({ delay: undefined, fetchSuggestions: async (t) => { calls.push(t); return ['react']; } });
    fire.change(input, 'r');
    await wait(150);
    const early = calls.length;
    await wait(450);
    $test.check('The default delay is about 300 ms (no fetch after 150 ms, one fetch after 600 ms)', early === 0 && calls.length === 1, [early, calls.length]);
  }
}
