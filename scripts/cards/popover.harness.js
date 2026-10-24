const { render, fire, q } = $dom;

const getTrigger = (c) => q('button[data-action="trigger"]', c);
const getDialog = (c) => q('div[role="dialog"]', c);
const getCloseBtn = (c) => q('button[data-action="close"]', c);

{
  const r = render(
    <Popover
      trigger={<span>Open Menu</span>}
      content={<p>Popover Body</p>}
      title="Popover Header"
    />
  );
  const trigger = getTrigger(r.container);
  const hasAria = trigger !== null && trigger.getAttribute('aria-haspopup') === 'dialog' && trigger.getAttribute('aria-expanded') === 'false';
  const initialClosed = getDialog(r.container) === null;

  $test.check(
    'Initial render shows trigger button with aria-haspopup and popover hidden',
    hasAria && initialClosed,
    { hasAria, initialClosed }
  );
  r.unmount();
}

{
  const r = render(
    <Popover
      trigger={<span>Toggle</span>}
      content={<div data-body="true">Details here</div>}
      title="Information"
    />
  );
  const trigger = getTrigger(r.container);
  fire.click(trigger);

  const dialog = getDialog(r.container);
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  const hasTitle = dialog !== null && q('[data-title]', dialog)?.textContent === 'Information';
  const defaultPlacement = dialog?.getAttribute('data-placement') === 'bottom';
  const hasBody = dialog !== null && q('[data-body]', dialog) !== null;

  $test.check(
    'Clicking trigger opens dialog with default bottom placement, title, and body',
    dialog !== null && expanded && hasTitle && defaultPlacement && hasBody,
    { expanded, hasTitle, defaultPlacement, hasBody }
  );
  r.unmount();
}

{
  const toggles = [];
  const r = render(
    <Popover
      placement="top"
      trigger={<span>Top Popover</span>}
      content={<p>Top Content</p>}
      onToggle={(state) => toggles.push(state)}
    />
  );
  fire.click(getTrigger(r.container));
  const dialog = getDialog(r.container);
  const placementTop = dialog?.getAttribute('data-placement') === 'top';

  const closeBtn = getCloseBtn(r.container);
  fire.click(closeBtn);
  const closedAfterBtn = getDialog(r.container) === null;

  $test.check(
    'Custom placement top is applied and close button dismisses dialog',
    placementTop && closedAfterBtn && toggles.length === 2 && toggles[0] === true && toggles[1] === false,
    { placementTop, closedAfterBtn, toggles }
  );
  r.unmount();
}

{
  const toggles = [];
  const r = render(
    <Popover
      trigger={<span>Esc Test</span>}
      content={<p>Press Esc</p>}
      onToggle={(state) => toggles.push(state)}
    />
  );
  fire.click(getTrigger(r.container));
  const wasOpen = getDialog(r.container) !== null;

  fire.keyDown(document.body, 'Escape');
  const closedAfterEsc = getDialog(r.container) === null;

  $test.check(
    'Pressing Escape closes open popover and notifies onToggle',
    wasOpen && closedAfterEsc && toggles[toggles.length - 1] === false,
    { wasOpen, closedAfterEsc, toggles }
  );
  r.unmount();
}

{
  const r = render(
    <div>
      <Popover trigger={<span>Outside Click</span>} content={<p>Outside Content</p>} />
      <div data-testid="outside-target">Outside Element</div>
    </div>
  );
  fire.click(getTrigger(r.container));
  const wasOpen = getDialog(r.container) !== null;

  const outside = q('[data-testid="outside-target"]', r.container);
  fire.event(outside, new MouseEvent('mousedown', { bubbles: true }));
  const closedAfterOutside = getDialog(r.container) === null;

  $test.check(
    'A mousedown outside popover container dismisses the popover',
    wasOpen && closedAfterOutside,
    { wasOpen, closedAfterOutside }
  );
  r.unmount();
}

