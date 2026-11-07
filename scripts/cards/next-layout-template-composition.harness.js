await (async () => {
  const { render, q } = $dom;

  const LayoutComp = typeof DashboardLayout === 'function' ? DashboardLayout : (typeof solution === 'object' && solution?.DashboardLayout);
  const TemplateComp = typeof DashboardTemplate === 'function' ? DashboardTemplate : (typeof solution === 'object' && solution?.DashboardTemplate);
  const coordinatorFactory = typeof createRemountCoordinator === 'function' ? createRemountCoordinator : (typeof solution === 'object' && solution?.createRemountCoordinator);

  // Case 1: DashboardLayout renders children with data-testid="dashboard-layout"
  const { container: c1 } = render(
    React.createElement(LayoutComp, null, React.createElement('span', null, 'Layout Content'))
  );
  const layoutEl = q('[data-testid="dashboard-layout"]', c1);
  $test.check(
    'DashboardLayout renders children inside data-testid="dashboard-layout"',
    layoutEl !== null && layoutEl.textContent === 'Layout Content',
    { text: layoutEl?.textContent }
  );

  // Case 2: DashboardTemplate renders children with data-testid="dashboard-template"
  const { container: c2 } = render(
    React.createElement(TemplateComp, null, React.createElement('span', null, 'Template Content'))
  );
  const templateEl = q('[data-testid="dashboard-template"]', c2);
  $test.check(
    'DashboardTemplate renders children inside data-testid="dashboard-template"',
    templateEl !== null && templateEl.textContent === 'Template Content',
    { text: templateEl?.textContent }
  );

  const coordinator = coordinatorFactory();

  // Case 3: Coordinator preserves layout on sibling navigation (/dashboard/analytics to /dashboard/settings)
  const remountSibling = coordinator.shouldRemountLayout('/dashboard/analytics', '/dashboard/settings');
  const remountAcross = coordinator.shouldRemountLayout('/dashboard/analytics', '/login');
  $test.check(
    'shouldRemountLayout preserves layout across sibling routes and remounts across roots',
    remountSibling === false && remountAcross === true,
    { remountSibling, remountAcross }
  );

  // Case 4: Coordinator enforces template remount on any path transition with unique keys
  const remountTemplateNav = coordinator.shouldRemountTemplate('/dashboard/analytics', '/dashboard/settings');
  const remountTemplateSame = coordinator.shouldRemountTemplate('/dashboard/analytics', '/dashboard/analytics');
  const key1 = coordinator.getTemplateKey('/dashboard/settings', 1);
  const key2 = coordinator.getTemplateKey('/dashboard/settings', 2);
  $test.check(
    'shouldRemountTemplate triggers on navigation and produces distinct template keys',
    remountTemplateNav === true &&
      remountTemplateSame === false &&
      key1 === 'template-/dashboard/settings-1' &&
      key2 === 'template-/dashboard/settings-2',
    { remountTemplateNav, key1, key2 }
  );
})();

