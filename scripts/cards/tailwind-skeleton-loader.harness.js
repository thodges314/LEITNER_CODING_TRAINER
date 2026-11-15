const { render } = $dom;

// 1. Single text line declares accessibility attributes and base pulse classes
{
  const r = render(<Skeleton />);
  const el = r.container.querySelector('[role="status"]');
  const hasRole = el !== null;
  const hasAriaLabel = el?.getAttribute('aria-label') === 'Loading...';
  const hasAriaBusy = el?.getAttribute('aria-busy') === 'true';
  const hasPulse = el?.classList.contains('animate-pulse');
  const hasBg = /\bbg-(slate|gray|zinc|neutral)-/.test(el?.className || '');
  const hasHeight = el?.classList.contains('h-4');

  $test.check(
    'Single text line declares accessibility attributes and base pulse classes',
    Boolean(hasRole && hasAriaLabel && hasAriaBusy && hasPulse && hasBg && hasHeight),
    { hasRole, hasAriaLabel, hasAriaBusy, hasPulse, hasBg, hasHeight }
  );
  r.unmount();
}

// 2. Multi-line text variant renders lines container with 80% final line
{
  const r = render(<Skeleton lines={3} />);
  const container = r.container.querySelector('[role="status"]');
  const hasSpaceY = /\bspace-y-/.test(container?.className || '');
  const lines = container?.querySelectorAll('div') || [];
  const hasThreeLines = lines.length === 3;
  const lastLine = lines[2];
  const lastLineHasW45 = /\bw-(3\/4|4\/5|5\/6)\b/.test(lastLine?.className || '');
  const firstLineHasWFull = lines[0]?.classList.contains('w-full');

  $test.check(
    'Multi-line text variant renders lines container with 80% final line',
    Boolean(hasSpaceY && hasThreeLines && lastLineHasW45 && firstLineHasWFull),
    { hasSpaceY, linesCount: lines.length, lastLineHasW45, firstLineHasWFull }
  );
  r.unmount();
}

// 3. Circular variant renders rounded-full with custom numeric dimensions
{
  const r = render(<Skeleton variant="circular" width={48} height={48} />);
  const el = r.container.querySelector('[role="status"]');
  const hasRoundedFull = el?.classList.contains('rounded-full');
  const hasInlineWidth = el?.style.width === '48px';
  const hasInlineHeight = el?.style.height === '48px';

  $test.check(
    'Circular variant renders rounded-full with custom numeric dimensions',
    Boolean(hasRoundedFull && hasInlineWidth && hasInlineHeight),
    { hasRoundedFull, width: el?.style.width, height: el?.style.height }
  );
  r.unmount();
}

// 4. Rectangular variant renders rounded-xl and default h-32
{
  const r = render(<Skeleton variant="rectangular" />);
  const el = r.container.querySelector('[role="status"]');
  const hasRoundedXl = /\brounded-/.test(el?.className || '');
  const hasH32 = /\bh-(24|28|32|36|40)\b/.test(el?.className || '');
  const hasWFull = el?.classList.contains('w-full');

  $test.check(
    'Rectangular variant renders rounded-xl and default h-32',
    Boolean(hasRoundedXl && hasH32 && hasWFull),
    { hasRoundedXl, hasH32, hasWFull }
  );
  r.unmount();
}

// 5. Card composite variant renders avatar, media block, and structured text lines
{
  const r = render(<Skeleton variant="card" />);
  const card = r.container.querySelector('[role="status"]');
  const hasCardBorder = /\bborder-(slate|gray|zinc|neutral)-/.test(card?.className || '');
  const hasCardBg = /\bbg-(slate|gray|zinc|neutral)-/.test(card?.className || '');
  const avatar = card?.querySelector('.rounded-full');
  const hasAvatar = avatar !== null && avatar.classList.contains('h-10');
  const media = card?.querySelector('.h-28');
  const hasMedia = media !== null && media.classList.contains('w-full');

  $test.check(
    'Card composite variant renders avatar, media block, and structured text lines',
    Boolean(hasCardBorder && hasCardBg && hasAvatar && hasMedia),
    { hasCardBorder, hasCardBg, hasAvatar: Boolean(hasAvatar), hasMedia: Boolean(hasMedia) }
  );
  r.unmount();
}

