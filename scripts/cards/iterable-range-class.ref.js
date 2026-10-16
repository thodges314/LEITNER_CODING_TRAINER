class Range {
  constructor(start, end, step = 1) {
    if (step === 0) throw new RangeError('step must not be 0');
    this.start = start;
    this.end = end;
    this.step = step;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;
    return {
      next() {
        const inRange = step > 0 ? current < end : current > end;
        if (!inRange) return { value: undefined, done: true };
        const value = current;
        current += step;
        return { value, done: false };
      },
    };
  }
}

function take(iterable, n) {
  const out = [];
  if (n <= 0) return out;
  for (const value of iterable) {
    out.push(value);
    if (out.length >= n) break;
  }
  return out;
}
