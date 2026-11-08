await (async () => {
  // Case 1: Registers parameterized test cases from 2D array with formatted titles
  {
    const registered = [];
    const testEach = createTestEach((title, fn) => {
      registered.push({ title, fn });
    });

    const executionLog = [];
    testEach([
      [1, 2, 3],
      [4, 5, 9],
      [10, 20, 30]
    ])('%i + %i = %d', (a, b, expected) => {
      executionLog.push(a + b === expected);
    });

    const titles = registered.map(r => r.title);
    for (const r of registered) {
      r.fn();
    }

    $test.check(
      'Registers parameterized test cases from 2D array with formatted titles',
      $test.equal(titles, ['1 + 2 = 3', '4 + 5 = 9', '10 + 20 = 30']) &&
      $test.equal(executionLog, [true, true, true]),
      { titles, executionLog }
    );
  }

  // Case 2: Interpolates object properties using $placeholder syntax
  {
    const registered = [];
    const testEach = createTestEach((title, fn) => {
      registered.push({ title, fn });
    });

    const received = [];
    testEach([
      { role: 'admin', level: 1 },
      { role: 'guest', level: 0 }
    ])('User $role has authorization level $level', (row) => {
      received.push(row.role);
    });

    const titles = registered.map(r => r.title);
    for (const r of registered) {
      r.fn();
    }

    $test.check(
      'Interpolates object properties using $placeholder syntax',
      $test.equal(titles, ['User admin has authorization level 1', 'User guest has authorization level 0']) &&
      $test.equal(received, ['admin', 'guest']),
      { titles, received }
    );
  }

  // Case 3: Handles 1D array of single-argument values and %s placeholders
  {
    const registered = [];
    const testEach = createTestEach((title, fn) => {
      registered.push({ title, fn });
    });

    const values = [];
    testEach(['alpha', 'beta', 'gamma'])('stage %s is valid', (val) => {
      values.push(val);
    });

    const titles = registered.map(r => r.title);
    for (const r of registered) {
      r.fn();
    }

    $test.check(
      'Handles 1D array of single-argument values and %s placeholders',
      $test.equal(titles, ['stage alpha is valid', 'stage beta is valid', 'stage gamma is valid']) &&
      $test.equal(values, ['alpha', 'beta', 'gamma']),
      { titles, values }
    );
  }

  // Case 4: Supports asynchronous test execution functions
  {
    const registered = [];
    const testEach = createTestEach((title, fn) => {
      registered.push({ title, fn });
    });

    let asyncDone = false;
    testEach([[100]])('delays by %d ms', async (ms) => {
      await new Promise(r => setTimeout(r, 10));
      asyncDone = true;
    });

    const promise = registered[0]?.fn();
    const isPromise = promise && typeof promise.then === 'function';
    await promise;

    $test.check(
      'Supports asynchronous test execution functions',
      isPromise && asyncDone,
      { isPromise, asyncDone }
    );
  }

  // Case 5: Safely ignores empty or non-array tables without registering tests
  {
    const registered = [];
    const testEach = createTestEach((title, fn) => {
      registered.push({ title, fn });
    });

    testEach([])('should not register', () => {});
    testEach(null)('should not register', () => {});

    $test.check(
      'Safely ignores empty or non-array tables without registering tests',
      registered.length === 0,
      registered.length
    );
  }
})();

