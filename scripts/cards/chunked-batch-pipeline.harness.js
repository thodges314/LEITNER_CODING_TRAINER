await (async () => {
  const fn = typeof chunkedBatchPipeline === 'function' ? chunkedBatchPipeline : solution;

  // Case 1: Bounded concurrency and ordering
  let activeWorkers = 0;
  let maxActiveObserved = 0;
  const items1 = [1, 2, 3, 4, 5, 6, 7];
  const res1 = await fn(items1, {
    batchSize: 4,
    concurrency: 2,
    processItem: async (n) => {
      activeWorkers++;
      maxActiveObserved = Math.max(maxActiveObserved, activeWorkers);
      await new Promise((r) => setTimeout(r, 10));
      activeWorkers--;
      return n * 10;
    },
  });

  $test.check(
    'Processes all items preserving index and respecting concurrency limit',
    res1.successfulCount === 7 &&
      res1.failureCount === 0 &&
      maxActiveObserved <= 2 &&
      JSON.stringify(res1.results) === JSON.stringify([10, 20, 30, 40, 50, 60, 70]),
    { res1, maxActiveObserved }
  );

  // Case 2: Error handling with dead-letter onError callback
  const errorItems = [];
  const res2 = await fn([10, -5, 20, -1, 30], {
    batchSize: 5,
    concurrency: 3,
    processItem: async (n) => {
      if (n < 0) throw new Error(`Negative value: ${n}`);
      return n / 2;
    },
    onError: (item, err, idx) => {
      errorItems.push({ item, idx, msg: err.message });
    },
  });

  $test.check(
    'Failed items record null in results and invoke onError without failing the pipeline',
    res2.successfulCount === 3 &&
      res2.failureCount === 2 &&
      JSON.stringify(res2.results) === JSON.stringify([5, null, 10, null, 15]) &&
      errorItems.length === 2 &&
      errorItems[0].item === -5 &&
      errorItems[1].item === -1,
    { res2, errorItems }
  );

  // Case 3: Sequential batch execution: Batch 2 does not start until Batch 1 completes
  const batchStartedAt = [];
  let batch1Done = false;
  let batch2StartedPrematurely = false;
  await fn(['a', 'b', 'c', 'd'], {
    batchSize: 2,
    concurrency: 2,
    processItem: async (item, idx) => {
      if (idx >= 2 && !batch1Done) {
        batch2StartedPrematurely = true;
      }
      await new Promise((r) => setTimeout(r, 20));
      if (idx === 1) batch1Done = true;
      return item;
    },
  });

  $test.check(
    'Sequential batching waits for each batch to completely finish before starting next batch',
    !batch2StartedPrematurely,
    { batch2StartedPrematurely }
  );

  // Case 4: Empty items array
  const res4 = await fn([], {
    batchSize: 10,
    concurrency: 2,
    processItem: async (x) => x,
  });

  $test.check(
    'Empty input returns zero counts and empty results array',
    res4.successfulCount === 0 &&
      res4.failureCount === 0 &&
      Array.isArray(res4.results) &&
      res4.results.length === 0,
    { res4 }
  );
})();
