const { render, fire, act } = $dom;

const sampleAvatars = [
  { name: 'Alice Walker', status: 'online' },
  { name: 'Bob Dylan', status: 'busy' },
  { name: 'Charlie', status: 'away' },
  { name: 'Diana Prince', status: 'offline' },
  { name: 'Evan Wright' },
  { name: 'Fiona Apple' },
];

// 1. Renders individual Avatar with initials, base classes, and status dot
{
  const r = render(<Avatar name="Alice Walker" status="online" size="md" />);
  const avatar = r.container.querySelector('span');
  const hasBaseClasses =
    avatar.classList.contains('rounded-full') &&
    avatar.classList.contains('ring-2') &&
    avatar.classList.contains('bg-slate-800');
  const hasInitials = avatar.textContent.includes('AW');

  const dot = avatar.querySelector('span[aria-label="online"]');
  const hasDot = dot !== null && dot.classList.contains('bg-emerald-500');

  $test.check(
    'Renders individual Avatar with initials, base classes, and status dot',
    Boolean(hasBaseClasses && hasInitials && hasDot),
    { hasBaseClasses, hasInitials, hasDot: Boolean(hasDot) }
  );
  r.unmount();
}

// 2. Renders Avatar image when src provided with fallback on error
{
  const r = render(<Avatar name="Sarah Connor" src="https://example.com/avatar.jpg" />);
  const img = r.container.querySelector('img');
  const hasImg = img !== null && img.getAttribute('src') === 'https://example.com/avatar.jpg';

  // Trigger onError on image
  if (img) {
    act(() => {
      fire.event(img, new Event('error'));
    });
  }

  const fallbackSpan = r.container.querySelector('span > span');
  const hasFallbackInitials = fallbackSpan !== null && fallbackSpan.textContent.includes('SC');

  $test.check(
    'Renders Avatar image when src provided with fallback on error',
    Boolean(hasImg && hasFallbackInitials),
    { hasImg, hasFallbackInitials }
  );
  r.unmount();
}

// 3. Renders AvatarGroup container with semantic group role and -space-x-2 overlap
{
  const r = render(<AvatarGroup avatars={sampleAvatars.slice(0, 3)} max={4} />);
  const group = r.container.querySelector('[role="group"]');
  const hasGroup = group !== null && group.getAttribute('aria-label') === 'Team avatars';
  const hasOverlap = group !== null && group.classList.contains('-space-x-2');
  const avatarCount = group?.querySelectorAll(':scope > span').length;

  $test.check(
    'Renders AvatarGroup container with semantic group role and -space-x-2 overlap',
    Boolean(hasGroup && hasOverlap && avatarCount === 3),
    { hasGroup, hasOverlap, avatarCount }
  );
  r.unmount();
}

// 4. Truncates at max and displays +N overflow counter pill with aria-label
{
  const r = render(<AvatarGroup avatars={sampleAvatars} max={3} size="md" />);
  const group = r.container.querySelector('[role="group"]');
  const children = group?.children || [];
  const hasFourElements = children.length === 4; // 3 avatars + 1 overflow pill

  const overflowPill = Array.from(children).find((el) => el.textContent.includes('+3'));
  const hasOverflowPill = overflowPill !== null;
  const hasAriaLabel = overflowPill?.getAttribute('aria-label') === '3 more team members';
  const hasOverflowClasses = overflowPill?.classList.contains('rounded-full') && overflowPill?.classList.contains('bg-slate-800');

  $test.check(
    'Truncates at max and displays +N overflow counter pill with aria-label',
    Boolean(hasFourElements && hasOverflowPill && hasAriaLabel && hasOverflowClasses),
    { hasFourElements, hasOverflowPill, hasAriaLabel, hasOverflowClasses }
  );
  r.unmount();
}

// 5. Applies size variants sm and lg correctly across avatars and overflow pill
{
  const rSm = render(<AvatarGroup avatars={sampleAvatars} max={2} size="sm" />);
  const smPill = rSm.container.querySelector('[role="group"] > span:last-child');
  const hasSm = smPill?.classList.contains('h-8') && smPill?.classList.contains('w-8');
  rSm.unmount();

  const rLg = render(<AvatarGroup avatars={sampleAvatars} max={2} size="lg" />);
  const lgPill = rLg.container.querySelector('[role="group"] > span:last-child');
  const hasLg = lgPill?.classList.contains('h-12') && lgPill?.classList.contains('w-12');
  rLg.unmount();

  $test.check(
    'Applies size variants sm and lg correctly across avatars and overflow pill',
    Boolean(hasSm && hasLg),
    { hasSm, hasLg }
  );
}
