interface CounterOptions {
  start?: number;
  step?: number;
}

interface Counter {
  increment(): void;
  decrement(): void;
  reset(): void;
  value(): number;
}

function createCounter({ start = 0, step = 1 }: CounterOptions = {}): Counter {
  let count = start;
  return {
    increment(): void {
      count += step;
    },
    decrement(): void {
      count -= step;
    },
    reset(): void {
      count = start;
    },
    value(): number {
      return count;
    },
  };
}

function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function makeAdders(n: number): ((x: number) => number)[] {
  const adders: ((x: number) => number)[] = [];
  for (let i = 0; i < n; i++) {
    adders.push((x: number) => x + i);
  }
  return adders;
}
