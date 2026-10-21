class Range implements Iterable<number> {
  start: number;
  end: number;
  step: number;

  constructor(start: number, end: number, step = 1) {
    if (step === 0) throw new RangeError('step must not be 0');
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const { end, step } = this;
    return {
      next(): IteratorResult<number> {
        const inRange = step > 0 ? current < end : current > end;
        if (!inRange) return { value: undefined, done: true };
        const value = current;
        current += step;
        return { value, done: false };
      },
    };
  }
}

function take<T>(iterable: Iterable<T>, n: number): T[] {
  const out: T[] = [];
  if (n <= 0) return out;
  for (const value of iterable) {
    out.push(value);
    if (out.length >= n) break;
  }
  return out;
}
