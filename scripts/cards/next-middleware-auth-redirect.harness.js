await (async () => {
  const fn = typeof middleware === 'function' ? middleware : solution;

  // Case 1: Unauthenticated /dashboard redirects to /login?next=/dashboard
  const req1 = new NextRequest('http://localhost:3000/dashboard');
  const res1 = fn(req1);
  const loc1 = res1.headers.get('location') || '';
  $test.check(
    'Unauthenticated /dashboard redirects to /login?next=/dashboard',
    res1.status === 307 && loc1.includes('/login') && loc1.includes('next=%2Fdashboard'),
    { status: res1.status, location: loc1 }
  );

  // Case 2: Unauthenticated /dashboard/analytics redirects to /login?next=/dashboard/analytics
  const req2 = new NextRequest('http://localhost:3000/dashboard/analytics');
  const res2 = fn(req2);
  const loc2 = res2.headers.get('location') || '';
  $test.check(
    'Unauthenticated /dashboard/analytics redirects to /login with encoded pathname',
    res2.status === 307 && loc2.includes('/login') && loc2.includes('next=%2Fdashboard%2Fanalytics'),
    { status: res2.status, location: loc2 }
  );

  // Case 3: Authenticated /dashboard/settings returns NextResponse.next()
  const req3 = new NextRequest('http://localhost:3000/dashboard/settings', {
    headers: { cookie: 'auth_token=jwt_valid_session_token' },
  });
  const res3 = fn(req3);
  $test.check(
    'Authenticated /dashboard/settings allows request with NextResponse.next()',
    Boolean(res3._isNext) || res3.status === 200,
    { status: res3.status, isNext: res3._isNext }
  );

  // Case 4: Public route /about passes through without auth cookie
  const req4 = new NextRequest('http://localhost:3000/about');
  const res4 = fn(req4);
  $test.check(
    'Public route /about passes through with NextResponse.next() without auth cookie',
    Boolean(res4._isNext) || res4.status === 200,
    { status: res4.status, isNext: res4._isNext }
  );
})();
