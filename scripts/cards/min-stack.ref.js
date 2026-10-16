class MinStack {
  constructor() {
    this.items = [];
    this.mins = [];
  }
  push(x) {
    this.items.push(x);
    const min = this.mins.length ? Math.min(x, this.mins[this.mins.length - 1]) : x;
    this.mins.push(min);
  }
  pop() {
    this.mins.pop();
    return this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1];
  }
  size() {
    return this.items.length;
  }
  getMin() {
    return this.mins[this.mins.length - 1];
  }
}

class QueueFromStacks {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  _shift() {
    if (!this.outbox.length) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  enqueue(x) {
    this.inbox.push(x);
  }
  dequeue() {
    this._shift();
    return this.outbox.pop();
  }
  peek() {
    this._shift();
    return this.outbox[this.outbox.length - 1];
  }
  size() {
    return this.inbox.length + this.outbox.length;
  }
}
