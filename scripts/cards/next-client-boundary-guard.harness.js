await (async () => {
  const fn = typeof validateClientBoundaryProps === 'function'
    ? validateClientBoundaryProps
    : (typeof solution === 'function' ? solution : solution?.validateClientBoundaryProps);

  // Case 1: Valid primitive and Date props
  const validProps = {
    title: 'Modern Next.js',
    views: 1250,
    isPublished: true,
    publishedAt: new Date('2026-01-15T12:00:00.000Z'),
    tags: ['react', 'nextjs'],
    author: {
      id: 'usr_42',
      name: 'Taylor',
    },
  };
  const r1 = fn(validProps);
  $test.check(
    'Valid props pass and Dates are sanitized to ISO strings',
    r1.valid === true &&
      r1.errors.length === 0 &&
      r1.sanitizedProps?.publishedAt === '2026-01-15T12:00:00.000Z' &&
      r1.sanitizedProps?.title === 'Modern Next.js',
    { valid: r1.valid, sanitized: r1.sanitizedProps }
  );

  // Case 2: Function rejected
  const fnProps = {
    onClick: () => {},
    label: 'Submit',
  };
  const r2 = fn(fnProps);
  let fnErr = null;
  for (const err of r2.errors) {
    if (err.type === 'function') {
      fnErr = err;
      break;
    }
  }
  $test.check(
    'Function prop is rejected with clear error path',
    r2.valid === false && fnErr !== null && fnErr.path === 'onClick',
    { valid: r2.valid, errors: r2.errors }
  );

  // Case 3: Custom class instance rejected
  class CustomModel {
    name = 'secret';
  }
  const classProps = {
    user: new CustomModel(),
  };
  const r3 = fn(classProps);
  let classErr = null;
  for (const err of r3.errors) {
    if (err.type === 'class_instance') {
      classErr = err;
      break;
    }
  }
  $test.check(
    'Non-plain class instance is rejected with class name',
    r3.valid === false &&
      classErr !== null &&
      classErr.path === 'user' &&
      classErr.message.includes('CustomModel'),
    { valid: r3.valid, errors: r3.errors }
  );

  // Case 4: Circular reference in nested array/object detected
  const circularObj = { name: 'root', self: null as unknown };
  circularObj.self = circularObj;
  const circularProps = {
    node: circularObj,
  };
  const r4 = fn(circularProps);
  let circErr = null;
  for (const err of r4.errors) {
    if (err.type === 'circular_reference') {
      circErr = err;
      break;
    }
  }
  $test.check(
    'Circular reference is detected and reported with path',
    r4.valid === false && circErr !== null && circErr.path === 'node.self',
    { valid: r4.valid, errors: r4.errors }
  );
})();
