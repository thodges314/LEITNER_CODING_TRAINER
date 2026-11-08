await (async () => {
  const fn = typeof promiseTimeout === 'function' ? promiseTimeout : (typeof globalThis !== 'undefined' ? globalThis.promiseTimeout : undefined);

  const case1 = 'Resolves with the promise value when fulfilled before timeout';
  const case2 = 'Rejects with the original error when promise rejects before timeout';
  const case3 = 'Rejects with default Error("Operation timed out") when duration exceeds timeout';
  const case4 = 'Rejects with custom error message when specified upon timeout';

  if (typeof fn !== 'function') {
    $test.check(case1, false, { error: 'promiseTimeout is not defined' });
    $test.check(case2, false, { error: 'promiseTimeout is not defined' });
    $test.check(case3, false, { error: 'promiseTimeout is not defined' });
    $test.check(case4, false, { error: 'promiseTimeout is not defined' });
    return;
  }

  // Case 1: Fast resolve before timeout
  try {
    const quickPromise = new Promise((resolve) => setTimeout(() => resolve('success-val'), 10));
    const result1 = await fn(quickPromise, 80);
    $test.check(case1, result1 === 'success-val', { result: result1 });
  } catch (err) {
    $test.check(case1, false, { error: err && err.message });
  }

  // Case 2: Fast reject before timeout
  try {
    const failPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Network failure')), 10));
    failPromise.catch(() => {});
    let caught2 = null;
    try {
      await fn(failPromise, 80);
    } catch (err) {
      caught2 = err;
    }
    const pass2 = caught2 instanceof Error && caught2.message === 'Network failure';
    $test.check(case2, Boolean(pass2), { message: caught2 && caught2.message });
  } catch (err) {
    $test.check(case2, false, { error: err && err.message });
  }

  // Case 3: Slow promise exceeds timeout with default error message
  try {
    const slowPromise = new Promise((resolve) => setTimeout(() => resolve('too-late'), 100));
    slowPromise.catch(() => {});
    let caught3 = null;
    try {
      await fn(slowPromise, 20);
    } catch (err) {
      caught3 = err;
    }
    const pass3 = caught3 instanceof Error && caught3.message === 'Operation timed out';
    $test.check(case3, Boolean(pass3), { message: caught3 && caught3.message });
  } catch (err) {
    $test.check(case3, false, { error: err && err.message });
  }

  // Case 4: Slow promise exceeds timeout with custom error message
  try {
    const slowPromise2 = new Promise((resolve) => setTimeout(() => resolve('too-late'), 100));
    slowPromise2.catch(() => {});
    let caught4 = null;
    try {
      await fn(slowPromise2, 20, 'Gateway request timed out');
    } catch (err) {
      caught4 = err;
    }
    const pass4 = caught4 instanceof Error && caught4.message === 'Gateway request timed out';
    $test.check(case4, Boolean(pass4), { message: caught4 && caught4.message });
  } catch (err) {
    $test.check(case4, false, { error: err && err.message });
  }
})();
