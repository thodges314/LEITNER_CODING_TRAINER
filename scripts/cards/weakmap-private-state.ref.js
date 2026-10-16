const counterState = new WeakMap();
const stackState = new WeakMap();

class Counter {
  constructor(start = 0) {
    counterState.set(this, { start, count: start });
  }
  increment() {
    counterState.get(this).count++;
    return this;
  }
  decrement() {
    counterState.get(this).count--;
    return this;
  }
  reset() {
    const state = counterState.get(this);
    state.count = state.start;
    return this;
  }
  get value() {
    return counterState.get(this).count;
  }
}

class Stack {
  constructor() {
    stackState.set(this, []);
  }
  push(x) {
    stackState.get(this).push(x);
  }
  pop() {
    return stackState.get(this).pop();
  }
  peek() {
    const items = stackState.get(this);
    return items[items.length - 1];
  }
  get size() {
    return stackState.get(this).length;
  }
}
