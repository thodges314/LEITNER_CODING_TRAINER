const { render, fire } = $dom;

// 1. Renders button element with primary variant and md size by default
{
  const r = render(<Button>Save Changes</Button>);
  const btn = r.container.querySelector('button');

  const hasBase =
    btn !== null &&
    (btn.getAttribute('type') === 'button' || !btn.getAttribute('type')) &&
    btn.textContent.includes('Save Changes') &&
    btn.classList.contains('inline-flex') &&
    btn.classList.contains('font-medium');

  const hasPrimary =
    btn !== null &&
    btn.classList.contains('bg-indigo-600') &&
    btn.classList.contains('text-white');

  const hasMdSize =
    btn !== null &&
    btn.classList.contains('px-4') &&
    btn.classList.contains('text-sm');

  const passed = Boolean(btn && hasBase && hasPrimary && hasMdSize);

  $test.check(
    'Renders button element with primary variant and md size by default',
    passed,
    { hasBtn: Boolean(btn), hasBase, hasPrimary, hasMdSize }
  );

  r.unmount();
}

// 2. Applies secondary, destructive, and outline variant styling classes
{
  const rSec = render(<Button variant="secondary">Secondary</Button>);
  const btnSec = rSec.container.querySelector('button');
  const hasSecondary =
    btnSec !== null &&
    btnSec.classList.contains('bg-slate-800') &&
    btnSec.classList.contains('text-slate-100');
  rSec.unmount();

  const rDest = render(<Button variant="destructive">Delete</Button>);
  const btnDest = rDest.container.querySelector('button');
  const hasDestructive =
    btnDest !== null &&
    btnDest.classList.contains('bg-rose-600') &&
    btnDest.classList.contains('text-white');
  rDest.unmount();

  const rOut = render(<Button variant="outline">Cancel</Button>);
  const btnOut = rOut.container.querySelector('button');
  const hasOutline =
    btnOut !== null &&
    btnOut.classList.contains('border') &&
    btnOut.classList.contains('border-slate-700');
  rOut.unmount();

  const passed = Boolean(hasSecondary && hasDestructive && hasOutline);

  $test.check(
    'Applies secondary, destructive, and outline variant styling classes',
    passed,
    { hasSecondary, hasDestructive, hasOutline }
  );
}

// 3. Applies sm and lg size padding and typography classes
{
  const rSm = render(<Button size="sm">Small</Button>);
  const btnSm = rSm.container.querySelector('button');
  const hasSm =
    btnSm !== null &&
    btnSm.classList.contains('text-xs') &&
    btnSm.classList.contains('px-2.5');
  rSm.unmount();

  const rLg = render(<Button size="lg">Large</Button>);
  const btnLg = rLg.container.querySelector('button');
  const hasLg =
    btnLg !== null &&
    btnLg.classList.contains('text-base') &&
    btnLg.classList.contains('px-5');
  rLg.unmount();

  const passed = Boolean(hasSm && hasLg);

  $test.check(
    'Applies sm and lg size padding and typography classes',
    passed,
    { hasSm, hasLg }
  );
}

// 4. Disables button and applies disabled styling classes when disabled=true
{
  let clicked = false;
  const r = render(
    <Button disabled={true} onClick={() => { clicked = true; }}>
      Disabled Action
    </Button>
  );
  const btn = r.container.querySelector('button');

  const isDisabledAttr = btn !== null && btn.disabled === true;
  const hasDisabledClasses =
    btn !== null &&
    (btn.classList.contains('disabled:opacity-50') || btn.classList.contains('cursor-not-allowed'));

  if (btn) fire.click(btn);

  const passed = Boolean(btn && isDisabledAttr && hasDisabledClasses && !clicked);

  $test.check(
    'Disables button and applies disabled styling classes when disabled=true',
    passed,
    { isDisabledAttr, hasDisabledClasses, notClicked: !clicked }
  );

  r.unmount();
}

// 5. Renders animated SVG spinner and sets aria-busy when loading=true
{
  const r = render(<Button loading={true}>Submitting</Button>);
  const btn = r.container.querySelector('button');

  const isAriaBusy = btn !== null && btn.getAttribute('aria-busy') === 'true';
  const isDisabled = btn !== null && btn.disabled === true;
  const svg = btn?.querySelector('svg');
  const hasSpinner =
    svg !== null &&
    svg.getAttribute('class')?.includes('animate-spin');

  const passed = Boolean(btn && isAriaBusy && isDisabled && hasSpinner);

  $test.check(
    'Renders animated SVG spinner and sets aria-busy when loading=true',
    passed,
    { isAriaBusy, isDisabled, hasSpinner: Boolean(hasSpinner) }
  );

  r.unmount();
}

// 6. Forwards extra HTML attributes and responds to click events when active
{
  let clicked = false;
  const r = render(
    <Button
      data-testid="submit-btn"
      aria-label="Confirm Action"
      onClick={() => { clicked = true; }}
    >
      Confirm
    </Button>
  );
  const btn = r.container.querySelector('button[data-testid="submit-btn"]');

  const hasAriaLabel = btn !== null && btn.getAttribute('aria-label') === 'Confirm Action';
  if (btn) fire.click(btn);

  const passed = Boolean(btn && hasAriaLabel && clicked);

  $test.check(
    'Forwards extra HTML attributes and responds to click events when active',
    passed,
    { hasBtn: Boolean(btn), hasAriaLabel, clicked }
  );

  r.unmount();
}

