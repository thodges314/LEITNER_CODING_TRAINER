await (async () => {
  const fn = typeof promiseWaterfall === 'function'
    ? promiseWaterfall
    : (typeof solution === 'function' ? solution : solution?.promiseWaterfall);

  if (typeof fn !== 'function') {
    $test.check('Chains synchronous and asynchronous transformations in sequence', false, { error: 'promiseWaterfall is not defined as a function' });
    $test.check('Resolves immediately with initialValue when stages array is empty', false, { error: 'promiseWaterfall is not defined as a function' });
    $test.check('Short-circuits immediately on stage rejection without invoking subsequent stages', false, { error: 'promiseWaterfall is not defined as a function' });
    $test.check('Preserves strict serial ordering across stages with variable async delays', false, { error: 'promiseWaterfall is not defined as a function' });
    return;
  }

  // Case 1: Chains synchronous and asynchronous transformations in sequence
  try {
    const stages = [
      (x) => x + 10,
      async (x) => new Promise((resolve) => setTimeout(() => resolve(x * 2), 20)),
      (x) => `Total: ${x}`,
    ];
    const result = await fn(stages, 5);
    $test.check(
      'Chains synchronous and asynchronous transformations in sequence',
      result === 'Total: 30',
      { expected: 'Total: 30', actual: result }
    );
  } catch (err) {
    $test.check('Chains synchronous and asynchronous transformations in sequence', false, { error: err?.message || String(err) });
  }

  // Case 2: Resolves immediately with initialValue when stages array is empty
  try {
    const emptyResult = await fn([], { initialized: true });
    $test.check(
      'Resolves immediately with initialValue when stages array is empty',
      Boolean(emptyResult && emptyResult.initialized === true),
      emptyResult
    );
  } catch (err) {
    $test.check('Resolves immediately with initialValue when stages array is empty', false, { error: err?.message || String(err) });
  }

  // Case 3: Short-circuits immediately on stage rejection without invoking subsequent stages
  try {
    const trace = [];
    const errorStages = [
      (x) => {
        trace.push('stage1');
        return x + 1;
      },
      () => {
        trace.push('stage2-fail');
        throw new Error('Pipeline failed at step 2');
      },
      (x) => {
        trace.push('stage3-should-not-run');
        return x * 10;
      },
    ];

    let caughtError = null;
    try {
      await fn(errorStages, 0);
    } catch (err) {
      caughtError = err;
    }

    const shortCircuited =
      caughtError !== null &&
      caughtError.message === 'Pipeline failed at step 2' &&
      trace.length === 2 &&
      trace.includes('stage1') &&
      trace.includes('stage2-fail') &&
      !trace.includes('stage3-should-not-run');

    $test.check(
      'Short-circuits immediately on stage rejection without invoking subsequent stages',
      shortCircuited,
      { trace, error: caughtError?.message }
    );
  } catch (err) {
    $test.check('Short-circuits immediately on stage rejection without invoking subsequent stages', false, { error: err?.message || String(err) });
  }

  // Case 4: Preserves strict serial ordering across stages with variable async delays
  try {
    const executionOrder = [];
    const delayStages = [
      (val) => new Promise((resolve) => {
        setTimeout(() => {
          executionOrder.push('step1');
          resolve(val + '-1');
        }, 30);
      }),
      (val) => new Promise((resolve) => {
        setTimeout(() => {
          executionOrder.push('step2');
          resolve(val + '-2');
        }, 10);
      }),
      (val) => new Promise((resolve) => {
        setTimeout(() => {
          executionOrder.push('step3');
          resolve(val + '-3');
        }, 20);
      }),
    ];

    const finalVal = await fn(delayStages, 'start');
    const correctlyOrdered =
      finalVal === 'start-1-2-3' &&
      executionOrder.join(',') === 'step1,step2,step3';

    $test.check(
      'Preserves strict serial ordering across stages with variable async delays',
      correctlyOrdered,
      { finalVal, executionOrder }
    );
  } catch (err) {
    $test.check('Preserves strict serial ordering across stages with variable async delays', false, { error: err?.message || String(err) });
  }
})();

