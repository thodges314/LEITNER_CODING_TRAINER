interface CounterState {
  start: number;
  count: number;
}

const counterState = new WeakMap<Counter, CounterState>();
const stackState = new WeakMap<Stack<any>, any[]>();

class Counter {
  constructor(start = 0) {
    counterState.set(this, { start, count: start });
  }

  increment(): this {
    counterState.get(this)!.count++;
    return this;
  }

  decrement(): this {
    counterState.get(this)!.count--;
    return this;
  }

  reset(): this {
    const state = counterState.get(this)!;
    state.count = state.start;
    return this;
  }

  get value(): number {
    return counterState.get(this)!.count;
  }
}

class Stack<T = unknown> {
  constructor() {
    stackState.set(this, []);
  }

  push(x: T): void {
    stackState.get(this)!.push(x);
  }

  pop(): T | undefined {
    return stackState.get(this)!.pop();
  }

  peek(): T | undefined {
    const items = stackState.get(this)!;
    return items[items.length - 1];
  }

  get size(): number {
    return stackState.get(this)!.length;
  }
}
