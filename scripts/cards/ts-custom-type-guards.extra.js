const sample: unknown = { a: 1 };
$test.check(
  'Compile time: isRecord narrows unknown inside the guard only',
  (() => {
    if (isRecord(sample)) {
      const a: unknown = sample.a;
      return a === 1;
    }
    return false;
  })()
);
// @ts-expect-error — `sample` is still unknown outside the guard
void sample.a;
