await (async () => {
  const { render, fire, q, qa } = $dom;
  const NavComp = typeof NavigationBar === 'function' ? NavigationBar : (typeof solution === 'object' && solution?.NavigationBar);

  if (!NavComp) {
    $test.check('Renders navigation container and all item links with hrefs', false, { error: 'NavigationBar is not defined' });
    $test.check('Applies aria-current="page" and active class to currentPath link', false, { error: 'NavigationBar is not defined' });
    $test.check('Leaves non-active links without aria-current attribute', false, { error: 'NavigationBar is not defined' });
    $test.check('Prevents default browser reload and triggers onNavigate callback', false, { error: 'NavigationBar is not defined' });
    return;
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
  ];

  // Case 1: Renders navigation container and all item links with hrefs
  const { container: c1, unmount: u1 } = render(
    React.createElement(NavComp, { items: navItems, currentPath: '/dashboard' })
  );
  const navEl = q('[data-testid="nav-bar"]', c1);
  const links1 = qa('[data-testid="nav-link"]', c1);
  const hasHrefs = links1.length === 3 &&
    links1[0].getAttribute('href') === '/' &&
    links1[1].getAttribute('href') === '/dashboard' &&
    links1[2].getAttribute('href') === '/settings';
  $test.check(
    'Renders navigation container and all item links with hrefs',
    navEl !== null && hasHrefs,
    { hasNav: Boolean(navEl), linksCount: links1.length }
  );
  u1();

  // Case 2: Applies aria-current="page" and active class to currentPath link
  const { container: c2, unmount: u2 } = render(
    React.createElement(NavComp, { items: navItems, currentPath: '/dashboard' })
  );
  const links2 = qa('[data-testid="nav-link"]', c2);
  const activeLink = links2[1];
  const isAriaPage = activeLink?.getAttribute('aria-current') === 'page';
  const hasActiveClass = Boolean(activeLink?.classList.contains('active'));
  $test.check(
    'Applies aria-current="page" and active class to currentPath link',
    isAriaPage && hasActiveClass,
    { ariaCurrent: activeLink?.getAttribute('aria-current'), className: activeLink?.className }
  );
  u2();

  // Case 3: Leaves non-active links without aria-current attribute
  const { container: c3, unmount: u3 } = render(
    React.createElement(NavComp, { items: navItems, currentPath: '/dashboard' })
  );
  const links3 = qa('[data-testid="nav-link"]', c3);
  const homeLink = links3[0];
  const settingsLink = links3[2];
  const inactiveNoAria = !homeLink?.hasAttribute('aria-current') && !settingsLink?.hasAttribute('aria-current');
  const inactiveNoActiveClass = !homeLink?.classList.contains('active') && !settingsLink?.classList.contains('active');
  $test.check(
    'Leaves non-active links without aria-current attribute',
    inactiveNoAria && inactiveNoActiveClass,
    { homeAria: homeLink?.getAttribute('aria-current'), settingsAria: settingsLink?.getAttribute('aria-current') }
  );
  u3();

  // Case 4: Prevents default browser reload and triggers onNavigate callback
  const navigations = [''];
  navigations.length = 0;
  const handleNav = function () {
    navigations.push(String(arguments[0]));
  };

  const { container: c4, unmount: u4 } = render(
    React.createElement(NavComp, {
      items: navItems,
      currentPath: '/',
      onNavigate: handleNav,
    })
  );
  const links4 = qa('[data-testid="nav-link"]', c4);
  const targetLink = links4[2];
  if (targetLink) fire.click(targetLink);
  const navigatedCorrectly = navigations.length === 1 && navigations[0] === '/settings';
  $test.check(
    'Prevents default browser reload and triggers onNavigate callback',
    navigatedCorrectly,
    { navigations }
  );
  u4();
})();
