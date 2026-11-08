await (async () => {
  const factory = typeof createTestRunner === 'function' ? createTestRunner : (typeof globalThis !== 'undefined' ? globalThis.createTestRunner : undefined);

  const case1 = 'Records passed tests and increments total and passed counts';
  const case2 = 'Catches thrown errors, increments failed count, and captures error message with suite name';
  const case3 = 'Supports multiple suites with correct suite attribution in errors';
  const case4 = 'reset() clears recorded tests and errors back to zero';

  if (typeof factory !== 'function') {
    $test.check(case1, false, { error: 'createTestRunner is not defined' });
    $test.check(case2, false, { error: 'createTestRunner is not defined' });
    $test.check(case3, false, { error: 'createTestRunner is not defined' });
    $test.check(case4, false, { error: 'createTestRunner is not defined' });
    return;
  }

  // Case 1: All passed
  const runner1 = factory();
  runner1.describe('Arithmetic', () => {
    runner1.it('adds numbers', () => {});
    runner1.it('multiplies numbers', () => {});
  });
  const r1 = runner1.getReport();
  $test.check(
    case1,
    r1.total === 2 && r1.passed === 2 && r1.failed === 0 && r1.errors.length === 0,
    r1
  );

  // Case 2: Catches errors and reports failure details
  const runner2 = factory();
  runner2.describe('Validation', () => {
    runner2.it('passes valid input', () => {});
    runner2.it('fails on null', () => {
      throw new Error('Null value prohibited');
    });
  });
  const r2 = runner2.getReport();
  $test.check(
    case2,
    r2.total === 2 &&
      r2.passed === 1 &&
      r2.failed === 1 &&
      r2.errors.length === 1 &&
      r2.errors[0].suite === 'Validation' &&
      r2.errors[0].test === 'fails on null' &&
      r2.errors[0].message === 'Null value prohibited',
    r2
  );

  // Case 3: Multiple suites with proper attribution
  const runner3 = factory();
  runner3.describe('Suite A', () => {
    runner3.it('test A1', () => {});
    runner3.it('test A2 fails', () => {
      throw new Error('Error in A');
    });
  });
  runner3.describe('Suite B', () => {
    runner3.it('test B1 fails', () => {
      throw new Error('Error in B');
    });
    runner3.it('test B2', () => {});
  });
  const r3 = runner3.getReport();
  $test.check(
    case3,
    r3.total === 4 &&
      r3.passed === 2 &&
      r3.failed === 2 &&
      r3.errors.length === 2 &&
      r3.errors[0].suite === 'Suite A' &&
      r3.errors[0].message === 'Error in A' &&
      r3.errors[1].suite === 'Suite B' &&
      r3.errors[1].message === 'Error in B',
    r3
  );

  // Case 4: reset() clears all stats and errors
  runner3.reset();
  const r4 = runner3.getReport();
  $test.check(
    case4,
    r4.total === 0 && r4.passed === 0 && r4.failed === 0 && r4.errors.length === 0,
    r4
  );
})();
