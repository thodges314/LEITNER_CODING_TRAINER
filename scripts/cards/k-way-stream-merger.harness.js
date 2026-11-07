await (async () => {
  const fn = typeof mergeKAsyncStreams === 'function' ? mergeKAsyncStreams : solution;

  // Helper to create async generator from array
  async function* toAsyncStream(arr) {
    for (const item of arr) {
      await new Promise((r) => setTimeout(r, 2));
      yield item;
    }
  }

  // Case 1: Merging 3 sorted number streams of varying lengths
  const s1 = toAsyncStream([1, 4, 7, 10]);
  const s2 = toAsyncStream([2, 5, 8]);
  const s3 = toAsyncStream([3, 6, 9, 11, 12]);

  const merged1 = [];
  for await (const val of fn([s1, s2, s3])) {
    merged1.push(val);
  }

  $test.check(
    'Merges K sorted async streams into a single ascending sequence',
    merged1.length === 12 &&
      JSON.stringify(merged1) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    { merged1 }
  );

  // Case 2: Custom comparator (e.g. timestamped objects in descending order)
  const o1 = toAsyncStream([{ t: 100, msg: 'a' }, { t: 50, msg: 'b' }]);
  const o2 = toAsyncStream([{ t: 90, msg: 'c' }, { t: 40, msg: 'd' }]);

  const merged2 = [];
  for await (const val of fn([o1, o2], (a, b) => b.t - a.t)) {
    merged2.push(val.msg);
  }

  $test.check(
    'Applies custom comparator for complex object streams',
    merged2.length === 4 && JSON.stringify(merged2) === JSON.stringify(['a', 'c', 'b', 'd']),
    { merged2 }
  );

  // Case 3: Handles empty streams alongside populated streams
  const e1 = toAsyncStream([]);
  const e2 = toAsyncStream([5, 10]);
  const e3 = toAsyncStream([]);

  const merged3 = [];
  for await (const val of fn([e1, e2, e3])) {
    merged3.push(val);
  }

  $test.check(
    'Handles empty streams alongside populated streams without errors',
    merged3.length === 2 && merged3[0] === 5 && merged3[1] === 10,
    { merged3 }
  );

  // Case 4: Completely empty input list of streams
  const merged4 = [];
  for await (const val of fn([])) {
    merged4.push(val);
  }

  $test.check(
    'Empty stream array yields no values and completes immediately',
    merged4.length === 0,
    { merged4 }
  );
})();

