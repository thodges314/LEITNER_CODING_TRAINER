await (async () => {
  function collect(iterable, limit = 1000) {
    const out = [];
    for (const v of iterable) {
      if (out.length >= limit) throw new Error(`Iterator exceeded ${limit} items`);
      out.push(v);
    }
    return out;
  }

  await $test.run(
    'Range yields start up to (not including) end',
    () => collect(new Range(0, 5)),
    () => [0, 1, 2, 3, 4]
  );

  await $test.run(
    'Range with a step',
    () => collect(new Range(1, 10, 3)),
    () => [1, 4, 7]
  );

  await $test.run(
    'Range with a negative step counts down',
    () => collect(new Range(5, 0, -2)),
    () => [5, 3, 1]
  );

  await $test.run(
    'Empty range',
    () => [...collect(new Range(3, 3)), ...collect(new Range(5, 1))],
    () => []
  );

  await $test.run(
    'A Range can be iterated more than once',
    () => {
      const r = new Range(0, 3);
      return [collect(r), collect(r)];
    },
    () => [
      [0, 1, 2],
      [0, 1, 2],
    ]
  );

  await $test.run(
    'Works with for...of',
    () => {
      let sum = 0;
      let steps = 0;
      for (const x of new Range(1, 5)) {
        if (++steps > 1000) throw new Error('Iterator exceeded 1000 items');
        sum += x;
      }
      return sum;
    },
    () => 10
  );

  await $test.rejects(
    'A step of 0 throws a RangeError mentioning step',
    () => new Range(0, 5, 0),
    'RangeError.*step'
  );

  await $test.run(
    'take returns the first n values',
    () => take(new Range(0, 100), 3),
    () => [0, 1, 2]
  );

  await $test.run(
    'take stops early on short iterables',
    () => take([1, 2], 5),
    () => [1, 2]
  );

  await $test.run(
    'take works on an infinite generator',
    () => {
      function* nat() {
        let i = 0;
        while (true) yield i++;
      }
      return take(nat(), 4);
    },
    () => [0, 1, 2, 3]
  );

  await $test.run(
    'take with n = 0',
    () => take([1, 2, 3], 0),
    () => []
  );
})();

