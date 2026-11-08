await (async () => {
  const { render, q } = $dom;

  const Comp = typeof UserProfileContainer === 'function'
    ? UserProfileContainer
    : (typeof solution === 'function' ? solution : (typeof solution === 'object' && solution?.UserProfileContainer));

  const case1 = 'Awaits fetchUser(userId) and renders <UserBadge> inside user-profile-boundary';
  const case2 = 'Retains Date object on createdAt across the RSC boundary';
  const case3 = 'Never exposes passwordHash or apiSecret in UserBadge props';
  const case4 = 'Invokes notFound() when fetchUser returns null';

  if (typeof Comp !== 'function') {
    $test.check(case1, false, { error: 'UserProfileContainer is not defined' });
    $test.check(case2, false, { error: 'UserProfileContainer is not defined' });
    $test.check(case3, false, { error: 'UserProfileContainer is not defined' });
    $test.check(case4, false, { error: 'UserProfileContainer is not defined' });
    return;
  }

  const d1 = new Date('2026-03-01T10:00:00.000Z');
  let fetchUserArg: string | null = null;
  const mockUser = {
    id: 'user-77',
    name: 'Sarah Connor',
    email: 'sarah@resistance.org',
    role: 'commander',
    passwordHash: '$2b$12$superSecretHashValue99',
    apiSecret: 'mock_server_secret_key_abc123',
    createdAt: d1,
  };

  // Case 1: Awaits fetchUser and renders boundary container and UserBadge
  const element1 = await Comp({
    userId: 'user-77',
    fetchUser: async (id: string) => {
      fetchUserArg = id;
      return mockUser;
    },
  });

  const { container: c1 } = render(element1);
  const boundaryEl = q('[data-testid="user-profile-boundary"]', c1);
  const badgeEl = q('[data-testid="user-badge"]', c1);

  $test.check(
    case1,
    fetchUserArg === 'user-77' &&
      boundaryEl !== null &&
      badgeEl !== null &&
      badgeEl.textContent === 'Sarah Connor',
    { fetchUserArg, hasBoundary: !!boundaryEl, hasBadge: !!badgeEl }
  );

  // Case 2: Inspect props passed to UserBadge to verify Date instance retention
  // In element1, boundaryEl is a div whose child is UserBadge
  let userBadgeProps: any = null;
  if (element1 && element1.props && element1.props.children) {
    const child = element1.props.children;
    userBadgeProps = child.props?.user;
  }

  $test.check(
    case2,
    userBadgeProps !== null &&
      userBadgeProps.createdAt instanceof Date &&
      userBadgeProps.createdAt.getTime() === d1.getTime() &&
      userBadgeProps.id === 'user-77' &&
      userBadgeProps.role === 'commander',
    { isDate: userBadgeProps?.createdAt instanceof Date, userBadgeProps }
  );

  // Case 3: Verify passwordHash and apiSecret are stripped completely
  const hasPasswordHash = userBadgeProps ? 'passwordHash' in userBadgeProps : false;
  const hasApiSecret = userBadgeProps ? 'apiSecret' in userBadgeProps : false;

  $test.check(
    case3,
    userBadgeProps !== null &&
      !hasPasswordHash &&
      !hasApiSecret &&
      userBadgeProps.passwordHash === undefined &&
      userBadgeProps.apiSecret === undefined,
    { hasPasswordHash, hasApiSecret }
  );

  // Case 4: When fetchUser returns null, invokes notFound()
  let caughtNotFound = false;
  try {
    await Comp({
      userId: 'user-unknown',
      fetchUser: async () => null,
    });
  } catch (err: any) {
    if (err && (err.name === 'NextNotFoundError' || String(err).includes('NextNotFoundError') || String(err).includes('NEXT_NOT_FOUND'))) {
      caughtNotFound = true;
    }
  }

  $test.check(
    case4,
    caughtNotFound === true,
    { caughtNotFound }
  );
})();
