const { render, fire, act } = $dom;

const sampleItems = [
  { id: 'item-1', title: 'What is Tailwind CSS?', content: 'A utility-first CSS framework.' },
  { id: 'item-2', title: 'How does JIT mode work?', content: 'It compiles styles on demand as you author classes.' },
  { id: 'item-3', title: 'Can I nest components?', content: 'Yes, React components compose naturally.', disabled: true },
];

// 1. Renders accordion container with semantic structure and base classes
{
  const r = render(<Accordion items={sampleItems} />);
  const container = r.container.firstChild;
  const hasBaseClasses =
    container.classList.contains('divide-y') &&
    container.classList.contains('rounded-xl') &&
    container.classList.contains('border');

  const buttons = r.container.querySelectorAll('button[aria-controls]');
  const hasThreeButtons = buttons.length === 3;

  $test.check(
    'Renders accordion container with semantic structure and base classes',
    Boolean(hasBaseClasses && hasThreeButtons),
    { hasBaseClasses, buttonCount: buttons.length }
  );
  r.unmount();
}

// 2. Honors defaultExpandedIds and binds aria-expanded / aria-controls / role="region"
{
  const r = render(<Accordion items={sampleItems} defaultExpandedIds={['item-2']} />);
  const btn2 = r.container.querySelector('#accordion-header-item-2');
  const panel2 = r.container.querySelector('#accordion-panel-item-2');

  const isBtnExpanded = btn2?.getAttribute('aria-expanded') === 'true';
  const hasPanel = panel2 !== null && panel2.getAttribute('role') === 'region';
  const isPanelVisible = panel2 && !panel2.hasAttribute('hidden');
  const chevronRotated = btn2?.querySelector('svg')?.classList.contains('rotate-180');

  const btn1 = r.container.querySelector('#accordion-header-item-1');
  const panel1 = r.container.querySelector('#accordion-panel-item-1');
  const isBtn1Closed = btn1?.getAttribute('aria-expanded') === 'false';
  const isPanel1Hidden = panel1?.hasAttribute('hidden') === true;

  $test.check(
    'Honors defaultExpandedIds and binds aria-expanded / aria-controls / role="region"',
    Boolean(isBtnExpanded && hasPanel && isPanelVisible && chevronRotated && isBtn1Closed && isPanel1Hidden),
    { isBtnExpanded, isPanelVisible, chevronRotated, isBtn1Closed, isPanel1Hidden }
  );
  r.unmount();
}

// 3. Toggles item on click and closes other item when allowMultiple is false
{
  const r = render(<Accordion items={sampleItems} defaultExpandedIds={['item-1']} allowMultiple={false} />);
  const btn1 = r.container.querySelector('#accordion-header-item-1');
  const btn2 = r.container.querySelector('#accordion-header-item-2');

  act(() => {
    fire.click(btn2);
  });

  const isBtn2Open = btn2?.getAttribute('aria-expanded') === 'true';
  const isBtn1Closed = btn1?.getAttribute('aria-expanded') === 'false';

  act(() => {
    fire.click(btn2);
  });

  const isBtn2ClosedAfterToggle = btn2?.getAttribute('aria-expanded') === 'false';

  $test.check(
    'Toggles item on click and closes other item when allowMultiple is false',
    Boolean(isBtn2Open && isBtn1Closed && isBtn2ClosedAfterToggle),
    { isBtn2Open, isBtn1Closed, isBtn2ClosedAfterToggle }
  );
  r.unmount();
}

// 4. Supports allowMultiple=true with multiple items open simultaneously
{
  const r = render(<Accordion items={sampleItems} allowMultiple={true} />);
  const btn1 = r.container.querySelector('#accordion-header-item-1');
  const btn2 = r.container.querySelector('#accordion-header-item-2');

  act(() => {
    fire.click(btn1);
  });
  act(() => {
    fire.click(btn2);
  });

  const isBtn1Open = btn1?.getAttribute('aria-expanded') === 'true';
  const isBtn2Open = btn2?.getAttribute('aria-expanded') === 'true';

  $test.check(
    'Supports allowMultiple=true with multiple items open simultaneously',
    Boolean(isBtn1Open && isBtn2Open),
    { isBtn1Open, isBtn2Open }
  );
  r.unmount();
}

// 5. Prevents interaction when item is disabled
{
  const r = render(<Accordion items={sampleItems} />);
  const btn3 = r.container.querySelector('#accordion-header-item-3');
  const panel3 = r.container.querySelector('#accordion-panel-item-3');

  const isDisabled = btn3?.hasAttribute('disabled') && btn3?.classList.contains('cursor-not-allowed');

  act(() => {
    fire.click(btn3);
  });

  const stayedClosed = btn3?.getAttribute('aria-expanded') === 'false' && panel3?.hasAttribute('hidden');

  $test.check(
    'Prevents interaction when item is disabled',
    Boolean(isDisabled && stayedClosed),
    { isDisabled, stayedClosed }
  );
  r.unmount();
}

