const { render, fire, q, qa } = $dom;

const SAMPLE_OPTIONS = [
  { id: 'opt-apple', label: 'Apple', value: 'apple' },
  { id: 'opt-banana', label: 'Banana', value: 'banana', disabled: true },
  { id: 'opt-cherry', label: 'Cherry', value: 'cherry' },
];

// 1. Initial render has combobox role, aria-expanded false, and listbox hidden
{
  const r = render(
    <AccessibleCombobox id="fruits" label="Choose a fruit" options={SAMPLE_OPTIONS} />
  );

  const label = q('label[for="fruits"]', r.container);
  const input = q('input#fruits', r.container);
  const isCombobox = input?.getAttribute('role') === 'combobox';
  const isAriaAuto = input?.getAttribute('aria-autocomplete') === 'list';
  const isAriaExpanded = input?.getAttribute('aria-expanded') === 'false';
  const ariaControls = input?.getAttribute('aria-controls') === 'fruits-listbox';
  const hasNoActive = !input?.getAttribute('aria-activedescendant');
  const listbox = q('#fruits-listbox', r.container);

  $test.check(
    'Initial render has combobox role, aria-expanded false, and listbox hidden',
    label?.textContent === 'Choose a fruit' &&
      isCombobox &&
      isAriaAuto &&
      isAriaExpanded &&
      ariaControls &&
      hasNoActive &&
      listbox === null,
    { labelText: label?.textContent, isCombobox, isAriaExpanded }
  );
  r.unmount();
}

// 2. Typing query filters options, opens listbox, and announces count in live status
{
  const r = render(
    <AccessibleCombobox id="fruits" label="Choose a fruit" options={SAMPLE_OPTIONS} />
  );

  const input = q('input#fruits', r.container);
  if (input) fire.change(input, 'ch');

  const listbox = q('#fruits-listbox', r.container);
  const opts = listbox ? qa('[role="option"]', listbox) : [];
  const status = q('[role="status"]', r.container);

  const passedCh =
    input?.getAttribute('aria-expanded') === 'true' &&
    opts.length === 1 &&
    opts[0].textContent === 'Cherry' &&
    status?.textContent === '1 results available';

  if (input) fire.change(input, 'xyz');
  const statusXyz = status?.textContent;
  const passedXyz = statusXyz === 'No results found';

  $test.check(
    'Typing query filters options, opens listbox, and announces count in live status',
    passedCh && passedXyz,
    { passedCh, passedXyz, statusXyz }
  );
  r.unmount();
}

// 3. ArrowDown navigates active descendant skipping disabled options
{
  const r = render(
    <AccessibleCombobox id="fruits" label="Choose a fruit" options={SAMPLE_OPTIONS} />
  );

  const input = q('input#fruits', r.container);
  if (input) fire.keyDown(input, 'ArrowDown'); // opens and highlights opt-apple

  const activeFirst = input?.getAttribute('aria-activedescendant');
  const appleOpt = q('#opt-apple', r.container);
  const appleSelected = appleOpt?.getAttribute('aria-selected') === 'true';

  if (input) fire.keyDown(input, 'ArrowDown'); // skips disabled banana, highlights opt-cherry
  const activeSecond = input?.getAttribute('aria-activedescendant');

  $test.check(
    'ArrowDown navigates active descendant skipping disabled options',
    input?.getAttribute('aria-expanded') === 'true' &&
      activeFirst === 'opt-apple' &&
      appleSelected &&
      activeSecond === 'opt-cherry',
    { activeFirst, appleSelected, activeSecond }
  );
  r.unmount();
}

// 4. Enter key selects active option, closes popup, and fires onSelect
{
  let selected = null;
  const r = render(
    <AccessibleCombobox
      id="fruits"
      label="Choose a fruit"
      options={SAMPLE_OPTIONS}
      onSelect={(opt) => {
        selected = opt;
      }}
    />
  );

  const input = q('input#fruits', r.container);
  if (input) {
    fire.keyDown(input, 'ArrowDown'); // active: Apple
    fire.keyDown(input, 'Enter');
  }

  const passed =
    selected !== null &&
    selected.id === 'opt-apple' &&
    input?.value === 'Apple' &&
    input?.getAttribute('aria-expanded') === 'false';

  $test.check(
    'Enter key selects active option, closes popup, and fires onSelect',
    passed,
    { selected, inputValue: input?.value, ariaExpanded: input?.getAttribute('aria-expanded') }
  );
  r.unmount();
}

// 5. Mouse click on enabled option selects it while disabled options are ignored
{
  let selected = null;
  const r = render(
    <AccessibleCombobox
      id="fruits"
      label="Choose a fruit"
      options={SAMPLE_OPTIONS}
      onSelect={(opt) => {
        selected = opt;
      }}
    />
  );

  const input = q('input#fruits', r.container);
  if (input) fire.keyDown(input, 'ArrowDown'); // open popup

  const banana = q('#opt-banana', r.container);
  if (banana) fire.click(banana);
  const disabledIgnored = selected === null;

  const cherry = q('#opt-cherry', r.container);
  if (cherry) fire.click(cherry);
  const cherrySelected = selected !== null && selected.id === 'opt-cherry' && input?.value === 'Cherry';

  $test.check(
    'Mouse click on enabled option selects it while disabled options are ignored',
    disabledIgnored && cherrySelected,
    { disabledIgnored, cherrySelected, selected }
  );
  r.unmount();
}
