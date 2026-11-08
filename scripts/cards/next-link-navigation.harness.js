await (async () => {
  const { render, q, qa } = $dom;
  const NavComp = typeof Navbar === 'function' ? Navbar : (typeof solution === 'function' ? solution : (typeof solution === 'object' && solution?.Navbar));

  const case1 = 'Renders navigation bar with list of routes using Next.js Link';
  const case2 = 'Inspects active route via usePathname() and sets aria-current="page"';
  const case3 = 'Updates active styling when pathname changes';
  const case4 = 'Sets inactive styling without aria-current on unselected routes';

  if (!NavComp) {
    $test.check(case1, false, { error: 'Navbar component is not defined' });
    $test.check(case2, false, { error: 'Navbar component is not defined' });
    $test.check(case3, false, { error: 'Navbar component is not defined' });
    $test.check(case4, false, { error: 'Navbar component is not defined' });
    return;
  }

  const items = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
    { href: '/profile', label: 'Profile' },
  ];

  // Case 1: Renders navigation bar with list of routes using Next.js Link
  setMockPathname('/dashboard');
  const { container: c1, unmount: u1 } = render(React.createElement(NavComp, { items }));
  const nav1 = q('nav[aria-label="Main Navigation"]', c1);
  const links1 = qa('a', c1);
  const hasLinks = links1.length === 3 &&
    links1[0]?.getAttribute('href') === '/dashboard' &&
    links1[1]?.getAttribute('href') === '/settings' &&
    links1[2]?.getAttribute('href') === '/profile';
  $test.check(case1, Boolean(nav1) && hasLinks, { foundNav: Boolean(nav1), linksCount: links1.length });
  u1();

  // Case 2: Inspects active route via usePathname() and sets aria-current="page"
  setMockPathname('/settings');
  const { container: c2, unmount: u2 } = render(React.createElement(NavComp, { items }));
  const links2 = qa('a', c2);
  const settingsLink = links2[1];
  const isAriaPage = settingsLink?.getAttribute('aria-current') === 'page';
  const hasActiveCls = settingsLink?.className?.includes('text-blue-600') || settingsLink?.className?.includes('font-bold');
  $test.check(case2, isAriaPage && Boolean(hasActiveCls), {
    ariaCurrent: settingsLink?.getAttribute('aria-current'),
    className: settingsLink?.className,
  });
  u2();

  // Case 3: Updates active styling when pathname changes
  setMockPathname('/profile');
  const { container: c3, unmount: u3 } = render(React.createElement(NavComp, { items }));
  const links3 = qa('a', c3);
  const profileLink = links3[2];
  const dashboardLink3 = links3[0];
  const profileAriaPage = profileLink?.getAttribute('aria-current') === 'page';
  const dashNoAria = dashboardLink3?.getAttribute('aria-current') === null;
  $test.check(case3, profileAriaPage && dashNoAria, {
    profileAria: profileLink?.getAttribute('aria-current'),
    dashAria: dashboardLink3?.getAttribute('aria-current'),
  });
  u3();

  // Case 4: Sets inactive styling without aria-current on unselected routes
  setMockPathname('/dashboard');
  const { container: c4, unmount: u4 } = render(React.createElement(NavComp, { items }));
  const links4 = qa('a', c4);
  const inactiveLink = links4[1];
  const noAriaCurrent = inactiveLink?.getAttribute('aria-current') === null;
  const hasInactiveCls = inactiveLink?.className?.includes('text-gray-600');
  $test.check(case4, noAriaCurrent && Boolean(hasInactiveCls), {
    ariaCurrent: inactiveLink?.getAttribute('aria-current'),
    className: inactiveLink?.className,
  });
  u4();
})();
