await (async () => {
  const fn = typeof createMicrotaskBatcher === 'function'
    ? createMicrotaskBatcher
    : (typeof solution === 'function' ? solution : solution?.createMicrotaskBatcher);

  if (typeof fn !== 'function') {
    $test.check('Coalesces multiple synchronous calls into a single batch execution', false, { error: 'createMicrotaskBatcher is not defined as a function' });
    $test.check('Executes batch on microtask queue strictly before macrotasks fire', false, { error: 'createMicrotaskBatcher is not defined as a function' });
    $test.check('Propagates batchHandler rejection to all pending promises in the batch', false, { error: 'createMicrotaskBatcher is not defined as a function' });
    $test.check('Processes subsequent independent batches across separate execution ticks', false, { error: 'createMicrotaskBatcher is not defined as a function' });
    return;
  }

  // Case 1: Coalesces multiple synchronous calls into a single batch execution
  try {
    let callCount = 0;
    const batcher = fn(async (items) => {
      callCount++;
      return items.map((x) => x * 10);
    });

    const p1 = batcher.schedule(1);
    const p2 = batcher.schedule(2);
    const p3 = batcher.schedule(3);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    const singleBatch = callCount === 1 && r1 === 10 && r2 === 20 && r3 === 30;

    $test.check(
      'Coalesces multiple synchronous calls into a single batch execution',
      singleBatch,
      { callCount, results: [r1, r2, r3] }
    );
  } catch (err) {
    $test.check('Coalesces multiple synchronous calls into a single batch execution', false, { error: err?.message || String(err) });
  }

  // Case 2: Executes batch on microtask queue strictly before macrotasks fire
  try {
    const order = [];
    const batcher = fn((items) => {
      order.push(`microtask-batch:${items.join(',')}`);
      return items;
    });

    setTimeout(() => {
      order.push('macrotask-timeout');
    }, 0);

    const p = batcher.schedule('itemA');
    await p;

    // Wait a brief moment for the macrotask to execute and verify execution precedence
    await new Promise((resolve) => setTimeout(resolve, 15));

    const microtaskRanFirst =
      order.length === 2 &&
      order[0] === 'microtask-batch:itemA' &&
      order[1] === 'macrotask-timeout';

    $test.check(
      'Executes batch on microtask queue strictly before macrotasks fire',
      microtaskRanFirst,
      { order }
    );
  } catch (err) {
    $test.check('Executes batch on microtask queue strictly before macrotasks fire', false, { error: err?.message || String(err) });
  }

  // Case 3: Propagates batchHandler rejection to all pending promises in the batch
  try {
    const batcher = fn(() => {
      throw new Error('Database batch failed');
    });

    const p1 = batcher.schedule('x');
    const p2 = batcher.schedule('y');

    let err1 = null;
    let err2 = null;

    try {
      await p1;
    } catch (e) {
      err1 = e;
    }

    try {
      await p2;
    } catch (e) {
      err2 = e;
    }

    const bothRejected =
      err1 !== null &&
      err2 !== null &&
      err1.message === 'Database batch failed' &&
      err2.message === 'Database batch failed';

    $test.check(
      'Propagates batchHandler rejection to all pending promises in the batch',
      bothRejected,
      { err1: err1?.message, err2: err2?.message }
    );
  } catch (err) {
    $test.check('Propagates batchHandler rejection to all pending promises in the batch', false, { error: err?.message || String(err) });
  }

  // Case 4: Processes subsequent independent batches across separate execution ticks
  try {
    const batches = [];
    const batcher = fn((items) => {
      batches.push([...items]);
      return items.map((x) => `processed-${x}`);
    });

    const firstRun = await Promise.all([batcher.schedule('a'), batcher.schedule('b')]);

    // Delay to allow event loop to clear before scheduling the next batch
    await new Promise((resolve) => setTimeout(resolve, 10));

    const secondRun = await Promise.all([batcher.schedule('c'), batcher.schedule('d')]);

    const independentBatches =
      batches.length === 2 &&
      batches[0].join(',') === 'a,b' &&
      batches[1].join(',') === 'c,d' &&
      firstRun.join(',') === 'processed-a,processed-b' &&
      secondRun.join(',') === 'processed-c,processed-d';

    $test.check(
      'Processes subsequent independent batches across separate execution ticks',
      independentBatches,
      { batches, firstRun, secondRun }
    );
  } catch (err) {
    $test.check('Processes subsequent independent batches across separate execution ticks', false, { error: err?.message || String(err) });
  }
})();

