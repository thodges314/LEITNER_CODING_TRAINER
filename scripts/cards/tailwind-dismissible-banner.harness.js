const { render, fire, act } = $dom;

{
  const r = render(<DismissibleBanner title="Info Note" message="System is operational." />);
  const alertEl = r.container.querySelector('[role="alert"]');
  const hasSky = alertEl && alertEl.classList.contains('bg-sky-50') && alertEl.classList.contains('border-sky-200');
  const hasTitle = alertEl && alertEl.textContent.includes('Info Note');
  const hasMsg = alertEl && alertEl.textContent.includes('System is operational.');
  const btn = alertEl && alertEl.querySelector('button[aria-label="Dismiss"]');

  $test.check(
    "Default info variant renders with role='alert' and sky color classes",
    Boolean(alertEl && hasSky && hasTitle && hasMsg && btn),
    { hasAlert: Boolean(alertEl), hasSky, hasTitle, hasMsg, hasBtn: Boolean(btn) }
  );
  r.unmount();
}

{
  const r = render(<DismissibleBanner variant="success" title="Saved" message="All changes saved." />);
  const alertEl = r.container.querySelector('[role="alert"]');
  const hasEmerald = alertEl && alertEl.classList.contains('bg-emerald-50') && alertEl.classList.contains('border-emerald-200');

  $test.check(
    'Success variant applies emerald color classes',
    Boolean(alertEl && hasEmerald),
    { hasAlert: Boolean(alertEl), hasEmerald }
  );
  r.unmount();
}

{
  const rWarn = render(<DismissibleBanner variant="warning" title="Warning" message="Check disk space." />);
  const elWarn = rWarn.container.querySelector('[role="alert"]');
  const hasAmber = elWarn && elWarn.classList.contains('bg-amber-50') && elWarn.classList.contains('border-amber-200');
  rWarn.unmount();

  const rErr = render(<DismissibleBanner variant="error" title="Error" message="Connection failed." />);
  const elErr = rErr.container.querySelector('[role="alert"]');
  const hasRose = elErr && elErr.classList.contains('bg-rose-50') && elErr.classList.contains('border-rose-200');
  rErr.unmount();

  $test.check(
    'Warning and error variants apply matching amber and rose classes',
    Boolean(hasAmber && hasRose),
    { hasAmber, hasRose }
  );
}

{
  let dismissed = false;
  const r = render(
    <DismissibleBanner
      title="Alert"
      message="Dismiss me"
      onDismiss={() => { dismissed = true; }}
    />
  );

  const btn = r.container.querySelector('button[aria-label="Dismiss"]');
  act(() => {
    fire.click(btn);
  });

  const remaining = r.container.querySelector('[role="alert"]');
  $test.check(
    'Clicking dismiss button hides banner and invokes onDismiss',
    dismissed && remaining === null,
    { dismissed, remaining: Boolean(remaining) }
  );
  r.unmount();
}
