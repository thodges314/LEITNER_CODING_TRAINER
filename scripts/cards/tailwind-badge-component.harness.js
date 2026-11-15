const { render } = $dom;

// 1. Renders neutral badge with md size and no dot by default
{
  const r = render(<Badge>Draft</Badge>);
  const el = r.container.querySelector('span');

  const cls = el?.className || '';
  const hasBase =
    el !== null &&
    cls.includes('inline-flex') &&
    cls.includes('rounded-full') &&
    /\bborder\b/.test(cls) &&
    el.textContent.includes('Draft');

  const hasNeutral =
    el !== null &&
    /\btext-(slate|gray|zinc|neutral)-/.test(cls) &&
    /\bborder-(slate|gray|zinc|neutral)-/.test(cls);

  const hasMd =
    el !== null &&
    /\btext-sm\b/.test(cls) &&
    /\bpx-/.test(cls);

  const dot = el?.querySelector('span[aria-hidden="true"]');

  const passed = Boolean(el && hasBase && hasNeutral && hasMd && !dot);

  $test.check(
    'Renders neutral badge with md size and no dot by default',
    passed,
    { hasEl: Boolean(el), hasBase, hasNeutral, hasMd, hasNoDot: !dot }
  );
  r.unmount();
}

// 2. Applies success, warning, danger, and info variant color tokens
{
  const rSucc = render(<Badge variant="success">Online</Badge>);
  const elSucc = rSucc.container.querySelector('span');
  const hasSuccess =
    elSucc !== null &&
    /\btext-(emerald|green)-/.test(elSucc.className) &&
    /\bborder-(emerald|green)-/.test(elSucc.className);
  rSucc.unmount();

  const rWarn = render(<Badge variant="warning">Warning</Badge>);
  const elWarn = rWarn.container.querySelector('span');
  const hasWarning =
    elWarn !== null &&
    /\btext-(amber|yellow)-/.test(elWarn.className) &&
    /\bborder-(amber|yellow)-/.test(elWarn.className);
  rWarn.unmount();

  const rDang = render(<Badge variant="danger">Failed</Badge>);
  const elDang = rDang.container.querySelector('span');
  const hasDanger =
    elDang !== null &&
    /\btext-(rose|red)-/.test(elDang.className) &&
    /\bborder-(rose|red)-/.test(elDang.className);
  rDang.unmount();

  const rInfo = render(<Badge variant="info">Deploying</Badge>);
  const elInfo = rInfo.container.querySelector('span');
  const hasInfo =
    elInfo !== null &&
    /\btext-(sky|blue)-/.test(elInfo.className) &&
    /\bborder-(sky|blue)-/.test(elInfo.className);
  rInfo.unmount();

  const passed = Boolean(hasSuccess && hasWarning && hasDanger && hasInfo);

  $test.check(
    'Applies success, warning, danger, and info variant color tokens',
    passed,
    { hasSuccess, hasWarning, hasDanger, hasInfo }
  );
}

// 3. Applies sm size padding and typography classes
{
  const r = render(<Badge size="sm">Small</Badge>);
  const el = r.container.querySelector('span');

  const hasSm =
    el !== null &&
    /\btext-xs\b/.test(el.className) &&
    /\bpx-/.test(el.className);

  $test.check(
    'Applies sm size padding and typography classes',
    Boolean(el && hasSm),
    { hasEl: Boolean(el), hasSm }
  );
  r.unmount();
}

// 4. Renders decorative dot indicator with matching variant color when dot=true
{
  const r = render(
    <Badge variant="success" dot={true}>
      Active
    </Badge>
  );
  const el = r.container.querySelector('span');
  const dot = el?.querySelector('span[aria-hidden="true"]');

  const hasDotClasses =
    dot !== null &&
    dot.classList.contains('rounded-full') &&
    /\bbg-(emerald|green)-/.test(dot.className);

  const passed = Boolean(el && dot && hasDotClasses);

  $test.check(
    'Renders decorative dot indicator with matching variant color when dot=true',
    passed,
    { hasEl: Boolean(el), hasDot: Boolean(dot), hasDotClasses }
  );
  r.unmount();
}

// 5. Forwards extra HTML attributes to the outer container
{
  const r = render(
    <Badge data-testid="status-pill" aria-label="System status">
      Live
    </Badge>
  );
  const el = r.container.querySelector('span[data-testid="status-pill"]');
  const hasAria = el !== null && el.getAttribute('aria-label') === 'System status';

  $test.check(
    'Forwards extra HTML attributes to the outer container',
    Boolean(el && hasAria),
    { hasEl: Boolean(el), hasAria }
  );
  r.unmount();
}

