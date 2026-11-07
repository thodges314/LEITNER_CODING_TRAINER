await (async () => {
  const fn = typeof evaluateInterceptingRoute === 'function'
    ? evaluateInterceptingRoute
    : (typeof solution === 'function' ? solution : solution?.evaluateInterceptingRoute);

  const def1 = {
    routePattern: '/feed/@modal/(..)photo/[id]',
    slotName: 'modal',
    targetPattern: '/photo/[id]',
  };

  // Case 1: Soft navigation intercepts photo route inside @modal slot
  const r1 = fn(def1, {
    currentPath: '/feed',
    targetUrl: '/photo/42',
    isSoftNavigation: true,
  });
  $test.check(
    'Soft navigation intercepts target route into modal slot with params',
    r1.isIntercepted === true &&
      r1.activeSlot === 'modal' &&
      r1.renderedPattern === '/feed/@modal/(..)photo/[id]' &&
      r1.params.id === '42',
    { isIntercepted: r1.isIntercepted, params: r1.params }
  );

  // Case 2: Hard navigation (page refresh or direct URL) renders standalone target
  const r2 = fn(def1, {
    currentPath: '/feed',
    targetUrl: '/photo/42',
    isSoftNavigation: false,
  });
  $test.check(
    'Hard navigation does not intercept and renders standalone target pattern',
    r2.isIntercepted === false &&
      r2.activeSlot === undefined &&
      r2.renderedPattern === '/photo/[id]' &&
      r2.params.id === '42',
    { isIntercepted: r2.isIntercepted, renderedPattern: r2.renderedPattern }
  );

  // Case 3: Root interception (...) from deeply nested path
  const defRoot = {
    routePattern: '/dashboard/analytics/@drawer/(...)photo/[id]',
    slotName: 'drawer',
    targetPattern: '/photo/[id]',
  };
  const r3 = fn(defRoot, {
    currentPath: '/dashboard/analytics',
    targetUrl: '/photo/99',
    isSoftNavigation: true,
  });
  $test.check(
    'Root interceptor (...) triggers modal slot from nested path',
    r3.isIntercepted === true &&
      r3.activeSlot === 'drawer' &&
      r3.params.id === '99',
    { isIntercepted: r3.isIntercepted, activeSlot: r3.activeSlot }
  );

  // Case 4: Non-matching target URL returns not intercepted with empty params
  const r4 = fn(def1, {
    currentPath: '/feed',
    targetUrl: '/articles/tech-trends',
    isSoftNavigation: true,
  });
  $test.check(
    'Target URL not matching route pattern returns false with empty params',
    r4.isIntercepted === false &&
      Object.keys(r4.params).length === 0,
    { isIntercepted: r4.isIntercepted, params: r4.params }
  );
})();
