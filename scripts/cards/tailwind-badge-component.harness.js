const { render } = $dom;

// 1. Renders neutral badge with md size and no dot by default
{
  const r = render(<Badge>Draft</Badge>);
  const el = r.container.querySelector('span');

  const hasBase =
    el !== null &&
    el.classList.contains('inline-flex') &&
    el.classList.contains('rounded-full') &&
    el.textContent.includes('Draft');

  const hasNeutral =
    el !== null &&
    el.classList.contains('text-slate-300') &&
    el.classList.contains('border-slate-500/20');

  const hasMd =
    el !== null &&
    el.classList.contains('text-sm') &&
    el.classList.contains('px-2.5');

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
    elSucc.classList.contains('text-emerald-400') &&
    elSucc.classList.contains('border-emerald-500/20');
  rSucc.unmount();

  const rWarn = render(<Badge variant="warning">Warning</Badge>);
  const elWarn = rWarn.container.querySelector('span');
  const hasWarning =
    elWarn !== null &&
    elWarn.classList.contains('text-amber-400') &&
    elWarn.classList.contains('border-amber-500/20');
  rWarn.unmount();

  const rDang = render(<Badge variant="danger">Failed</Badge>);
  const elDang = rDang.container.querySelector('span');
  const hasDanger =
    elDang !== null &&
    elDang.classList.contains('text-rose-400') &&
    elDang.classList.contains('border-rose-500/20');
  rDang.unmount();

  const rInfo = render(<Badge variant="info">Deploying</Badge>);
  const elInfo = rInfo.container.querySelector('span');
  const hasInfo =
    elInfo !== null &&
    elInfo.classList.contains('text-sky-400') &&
    elInfo.classList.contains('border-sky-500/20');
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
    el.classList.contains('text-xs') &&
    el.classList.contains('px-2');

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
    dot.classList.contains('bg-emerald-400');

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

