await (async () => {
  const { render, q } = $dom;

  const LayoutComp = typeof DashboardLayout === 'function' ? DashboardLayout : (typeof solution === 'object' && solution?.DashboardLayout);
  const TemplateComp = typeof DashboardTemplate === 'function' ? DashboardTemplate : (typeof solution === 'object' && solution?.DashboardTemplate);
  const RootComp = typeof DashboardRoot === 'function' ? DashboardRoot : (typeof solution === 'object' && solution?.DashboardRoot);

  const case1 = 'DashboardLayout renders children inside data-testid="dashboard-layout" with header shell';
  const case2 = 'DashboardTemplate renders children inside data-testid="dashboard-template" with template-enter class';
  const case3 = 'DashboardRoot nests DashboardTemplate with key={pathname} inside DashboardLayout';
  const case4 = 'DashboardRoot updates template key on route change while maintaining layout wrapper';

  if (!LayoutComp || !TemplateComp || !RootComp) {
    $test.check(case1, false, { error: 'DashboardLayout, DashboardTemplate, or DashboardRoot not found' });
    $test.check(case2, false, { error: 'DashboardLayout, DashboardTemplate, or DashboardRoot not found' });
    $test.check(case3, false, { error: 'DashboardLayout, DashboardTemplate, or DashboardRoot not found' });
    $test.check(case4, false, { error: 'DashboardLayout, DashboardTemplate, or DashboardRoot not found' });
    return;
  }

  // Case 1: DashboardLayout renders children with data-testid="dashboard-layout" and header shell
  const { container: c1 } = render(
    React.createElement(LayoutComp, null, React.createElement('span', null, 'Layout Content'))
  );
  const layoutEl = q('[data-testid="dashboard-layout"]', c1);
  const headerEl = q('[data-testid="dashboard-header"]', c1);
  $test.check(
    case1,
    layoutEl !== null && headerEl !== null && layoutEl.textContent.includes('Layout Content') && headerEl.textContent === 'Dashboard Shell',
    { hasLayout: !!layoutEl, headerText: headerEl?.textContent }
  );

  // Case 2: DashboardTemplate renders children with data-testid="dashboard-template"
  const { container: c2 } = render(
    React.createElement(TemplateComp, null, React.createElement('span', null, 'Template Content'))
  );
  const templateEl = q('[data-testid="dashboard-template"]', c2);
  $test.check(
    case2,
    templateEl !== null && templateEl.classList.contains('template-enter') && templateEl.textContent === 'Template Content',
    { hasTemplate: !!templateEl, hasClass: templateEl?.classList?.contains('template-enter') }
  );

  // Case 3: DashboardRoot nests Template with key inside Layout
  const rootEl1 = React.createElement(
    RootComp,
    { pathname: '/dashboard/analytics' },
    React.createElement('span', { 'data-testid': 'page-content' }, 'Analytics Page')
  );
  const { container: c3 } = render(rootEl1);
  const nestedLayout = q('[data-testid="dashboard-layout"]', c3);
  const nestedTemplate = q('[data-testid="dashboard-template"]', c3);
  const pageContent = q('[data-testid="page-content"]', c3);
  const templateInsideLayout = nestedLayout && nestedTemplate && nestedLayout.contains(nestedTemplate);

  // Check key on the element returned by DashboardRoot
  const rootResult = RootComp({ pathname: '/dashboard/analytics', children: 'Child' });
  const innerTemplate = rootResult?.props?.children;
  const hasPathnameKey = innerTemplate?.key === '/dashboard/analytics' || innerTemplate?.props?.key === '/dashboard/analytics';

  $test.check(
    case3,
    templateInsideLayout && pageContent?.textContent === 'Analytics Page' && hasPathnameKey,
    { templateInsideLayout, hasPathnameKey, key: innerTemplate?.key }
  );

  // Case 4: DashboardRoot updates template key on route change
  const rootResult2 = RootComp({ pathname: '/dashboard/settings', children: 'Settings' });
  const innerTemplate2 = rootResult2?.props?.children;
  const key2 = innerTemplate2?.key || innerTemplate2?.props?.key;
  $test.check(
    case4,
    key2 === '/dashboard/settings' && rootResult2?.type === LayoutComp,
    { key2, isLayoutType: rootResult2?.type === LayoutComp }
  );
})();
