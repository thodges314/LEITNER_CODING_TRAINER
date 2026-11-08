await (async () => {
  const fn = typeof createMicroBatcher === 'function' ? createMicroBatcher : solution;

  // Case 1: Count threshold immediately flushes when reaching maxBatchSize
  const batches1 = [];
  const batcher1 = fn({
    maxBatchSize: 3,
    maxWaitMs: 500,
    flushHandler: (batch) => {
      batches1.push([...batch]);
    },
  });

  const p1 = batcher1.add('a');
  const p2 = batcher1.add('b');
  $test.check('Buffering 2 items does not flush yet (size === 2)', batcher1.size() === 2 && batches1.length === 0, { size: batcher1.size() });
  const p3 = batcher1.add('c');
  await Promise.all([p1, p2, p3]);

  $test.check(
    'Reaching maxBatchSize 3 immediately flushes batch and clears buffer',
    batches1.length === 1 && batches1[0].join('') === 'abc' && batcher1.size() === 0,
    { batches: batches1, size: batcher1.size() }
  );

  // Case 2: Time window flushes after maxWaitMs expires
  const batches2 = [];
  const batcher2 = fn({
    maxBatchSize: 5,
    maxWaitMs: 30,
    flushHandler: (batch) => {
      batches2.push([...batch]);
    },
  });

  const p4 = batcher2.add('x');
  const p5 = batcher2.add('y');
  await new Promise((r) => setTimeout(r, 60));
  await Promise.all([p4, p5]);

  $test.check(
    'Fewer items than maxBatchSize flush when maxWaitMs window expires',
    batches2.length === 1 && batches2[0].join('') === 'xy' && batcher2.size() === 0,
    { batches: batches2 }
  );

  // Case 3: Manual flush flushes immediately
  const batches3 = [];
  const batcher3 = fn({
    maxBatchSize: 10,
    maxWaitMs: 1000,
    flushHandler: (batch) => {
      batches3.push([...batch]);
    },
  });

  batcher3.add(1);
  batcher3.add(2);
  await batcher3.flush();
  $test.check(
    'Manual flush() drains buffer immediately before time window expires',
    batches3.length === 1 && batches3[0].length === 2 && batcher3.size() === 0,
    { batches: batches3 }
  );

  // Case 4: Error in flushHandler rejects promises for all items in that batch
  const batcher4 = fn({
    maxBatchSize: 2,
    maxWaitMs: 500,
    flushHandler: async () => {
      throw new Error('Database sink connection failed');
    },
  });

  let errCount = 0;
  const p6 = batcher4.add('err1').catch(() => { errCount++; });
  const p7 = batcher4.add('err2').catch(() => { errCount++; });
  await Promise.all([p6, p7]);

  $test.check(
    'flushHandler error rejects all item promises in the failing batch',
    errCount === 2,
    { errCount }
  );
})();

