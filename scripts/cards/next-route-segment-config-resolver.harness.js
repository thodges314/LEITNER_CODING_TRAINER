await (async () => {
  const fn = typeof resolveRouteSegmentConfig === 'function'
    ? resolveRouteSegmentConfig
    : (typeof solution === 'object' && typeof solution?.resolveRouteSegmentConfig === 'function' ? solution.resolveRouteSegmentConfig : null);

  const case1 = 'Resolves default static configuration for clean route segments';
  const case2 = 'Calculates lowest positive revalidate interval for ISR routes across layout and page';
  const case3 = 'Resolves dynamic route when any segment declares force-dynamic or revalidate = 0';
  const case4 = 'Detects conflicting segment configurations combining force-static with dynamic behaviors';

  if (!fn) {
    $test.check(case1, false, { error: 'resolveRouteSegmentConfig is not defined' });
    $test.check(case2, false, { error: 'resolveRouteSegmentConfig is not defined' });
    $test.check(case3, false, { error: 'resolveRouteSegmentConfig is not defined' });
    $test.check(case4, false, { error: 'resolveRouteSegmentConfig is not defined' });
    return;
  }

  // 1. Clean default static route
  {
    const segments = [
      { segmentPath: 'app/layout.tsx' },
      { segmentPath: 'app/about/page.tsx' },
    ];
    const res = fn(segments);
    const passed = res &&
      res.effectiveDynamic === 'auto' &&
      res.effectiveRevalidate === false &&
      res.effectiveFetchCache === 'auto' &&
      res.routeMode === 'static' &&
      res.hasConflict === false &&
      res.conflictReason === undefined;

    $test.check(case1, Boolean(passed), { res });
  }

  // 2. Lowest positive revalidate interval for ISR
  {
    const segments = [
      { segmentPath: 'app/layout.tsx', revalidate: 3600 },
      { segmentPath: 'app/blog/layout.tsx', revalidate: 300 },
      { segmentPath: 'app/blog/[slug]/page.tsx', revalidate: 60 },
    ];
    const res = fn(segments);
    const passed = res &&
      res.effectiveRevalidate === 60 &&
      res.routeMode === 'isr' &&
      res.hasConflict === false;

    $test.check(case2, Boolean(passed), { res });
  }

  // 3. Dynamic route with force-dynamic and revalidate = 0
  {
    const segments1 = [
      { segmentPath: 'app/layout.tsx' },
      { segmentPath: 'app/dashboard/page.tsx', dynamic: 'force-dynamic' },
    ];
    const res1 = fn(segments1);

    const segments2 = [
      { segmentPath: 'app/layout.tsx', revalidate: 300 },
      { segmentPath: 'app/live-feed/page.tsx', revalidate: 0 },
    ];
    const res2 = fn(segments2);

    const passed = res1?.routeMode === 'dynamic' &&
      res1?.effectiveDynamic === 'force-dynamic' &&
      res2?.routeMode === 'dynamic' &&
      res2?.effectiveRevalidate === 0;

    $test.check(case3, Boolean(passed), { res1, res2 });
  }

  // 4. Conflict detection: force-static paired with dynamic / no-store
  {
    const conflictSegments1 = [
      { segmentPath: 'app/layout.tsx', dynamic: 'force-static' },
      { segmentPath: 'app/checkout/page.tsx', dynamic: 'force-dynamic' },
    ];
    const res1 = fn(conflictSegments1);

    const conflictSegments2 = [
      { segmentPath: 'app/layout.tsx', dynamic: 'force-static' },
      { segmentPath: 'app/status/page.tsx', revalidate: 0 },
    ];
    const res2 = fn(conflictSegments2);

    const passed = res1?.hasConflict === true &&
      typeof res1?.conflictReason === 'string' &&
      res1.conflictReason.length > 0 &&
      res2?.hasConflict === true &&
      typeof res2?.conflictReason === 'string' &&
      res2.conflictReason.length > 0;

    $test.check(case4, Boolean(passed), { res1, res2 });
  }
})();

