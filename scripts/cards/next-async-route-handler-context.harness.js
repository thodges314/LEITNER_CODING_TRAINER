await (async () => {
  const getFn = typeof GET === 'function' ? GET : solution;

  if (typeof membersStore !== 'undefined' && membersStore?.clear) {
    membersStore.clear();
    membersStore.set('org_acme::mem_1', {
      id: 'mem_1',
      orgId: 'org_acme',
      role: 'owner',
      email: 'alex@acme.com',
    });
  }

  // Case 1: Awaits context.params Promise and returns 200 with member data
  const req1 = new Request('http://localhost:3000/api/orgs/org_acme/members/mem_1');
  const res1 = await getFn(req1, {
    params: Promise.resolve({ orgId: 'org_acme', memberId: 'mem_1' }),
  });
  const data1 = await res1.json();
  $test.check(
    'Awaits context.params Promise and returns 200 with member data',
    res1.status === 200 &&
      data1?.id === 'mem_1' &&
      data1?.orgId === 'org_acme' &&
      data1?.role === 'owner',
    { status: res1.status, data: data1 }
  );

  // Case 2: Returns 404 with error when member record does not exist
  const req2 = new Request('http://localhost:3000/api/orgs/org_acme/members/mem_unknown');
  const res2 = await getFn(req2, {
    params: Promise.resolve({ orgId: 'org_acme', memberId: 'mem_unknown' }),
  });
  const data2 = await res2.json();
  $test.check(
    'Returns 404 with error when member record does not exist',
    res2.status === 404 && data2?.error === 'Member not found',
    { status: res2.status, data: data2 }
  );

  // Case 3: Returns 400 when route params are empty or invalid
  const req3 = new Request('http://localhost:3000/api/orgs//members/');
  const res3 = await getFn(req3, {
    params: Promise.resolve({ orgId: '', memberId: '   ' }),
  });
  const data3 = await res3.json();
  $test.check(
    'Returns 400 when route parameters are empty strings',
    res3.status === 400 && data3?.error === 'Invalid route parameters',
    { status: res3.status, data: data3 }
  );

  // Case 4: Handles rejected context.params Promise gracefully with 400
  const req4 = new Request('http://localhost:3000/api/orgs/err/members/err');
  const res4 = await getFn(req4, {
    params: Promise.reject(new Error('Param resolution failed')),
  });
  const data4 = await res4.json();
  $test.check(
    'Returns 400 when context.params Promise rejects',
    res4.status === 400 && data4?.error === 'Invalid route parameters',
    { status: res4.status, data: data4 }
  );
})();

