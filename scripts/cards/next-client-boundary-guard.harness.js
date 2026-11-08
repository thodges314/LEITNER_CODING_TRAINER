await (async () => {
  const fn = typeof serializeUserForClient === 'function'
    ? serializeUserForClient
    : (typeof solution === 'function' ? solution : (typeof solution === 'object' && solution?.serializeUserForClient));

  const case1 = 'Serializes valid user record converting Dates to ISO strings';
  const case2 = 'Strips sensitive passwordHash field from client output';
  const case3 = 'Returns error when createdAt or updatedAt is invalid';
  const case4 = 'Returns error when required string fields are missing or empty';

  if (typeof fn !== 'function') {
    $test.check(case1, false, { error: 'serializeUserForClient is not defined' });
    $test.check(case2, false, { error: 'serializeUserForClient is not defined' });
    $test.check(case3, false, { error: 'serializeUserForClient is not defined' });
    $test.check(case4, false, { error: 'serializeUserForClient is not defined' });
    return;
  }

  const d1 = new Date('2026-01-15T12:00:00.000Z');
  const d2 = new Date('2026-01-20T18:30:00.000Z');

  // Case 1: Valid user serialization
  const r1 = fn({
    id: 'u-101',
    name: 'Alice Developer',
    email: 'alice@example.com',
    role: 'admin',
    passwordHash: '$2a$12$e8Y4vLg5...secret',
    createdAt: d1,
    updatedAt: d2,
  });

  $test.check(
    case1,
    r1?.success === true &&
      r1?.data?.id === 'u-101' &&
      r1?.data?.name === 'Alice Developer' &&
      r1?.data?.email === 'alice@example.com' &&
      r1?.data?.role === 'admin' &&
      r1?.data?.createdAt === '2026-01-15T12:00:00.000Z' &&
      r1?.data?.updatedAt === '2026-01-20T18:30:00.000Z',
    { r1 }
  );

  // Case 2: Strips passwordHash
  const hasPasswordHash = 'passwordHash' in (r1?.data || {});
  $test.check(
    case2,
    r1?.success === true && !hasPasswordHash && (r1?.data as any)?.passwordHash === undefined,
    { hasPasswordHash }
  );

  // Case 3: Invalid date
  const r3 = fn({
    id: 'u-102',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'user',
    passwordHash: 'hash',
    createdAt: new Date('invalid date string'),
    updatedAt: d2,
  });
  $test.check(
    case3,
    r3?.success === false && r3?.error === 'Invalid date fields' && !r3?.data,
    { r3 }
  );

  // Case 4: Missing required fields
  const r4 = fn({
    id: '',
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'guest',
    passwordHash: 'hash',
    createdAt: d1,
    updatedAt: d2,
  });
  $test.check(
    case4,
    r4?.success === false && r4?.error === 'Missing required user fields' && !r4?.data,
    { r4 }
  );
})();
