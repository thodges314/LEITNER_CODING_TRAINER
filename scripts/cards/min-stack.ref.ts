class MinStack {
  items: number[];
  mins: number[];

  constructor() {
    this.items = [];
    this.mins = [];
  }

  push(x: number): void {
    this.items.push(x);
    const min = this.mins.length ? Math.min(x, this.mins[this.mins.length - 1]) : x;
    this.mins.push(min);
  }

  pop(): number | undefined {
    this.mins.pop();
    return this.items.pop();
  }

  top(): number | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  getMin(): number | undefined {
    return this.mins[this.mins.length - 1];
  }
}

class QueueFromStacks<T = any> {
  inbox: T[];
  outbox: T[];

  constructor() {
    this.inbox = [];
    this.outbox = [];
  }

  _shift(): void {
    if (!this.outbox.length) {
      while (this.inbox.length) {
        this.outbox.push(this.inbox.pop()!);
      }
    }
  }

  enqueue(x: T): void {
    this.inbox.push(x);
  }

  dequeue(): T | undefined {
    this._shift();
    return this.outbox.pop();
  }

  peek(): T | undefined {
    this._shift();
    return this.outbox[this.outbox.length - 1];
  }

  size(): number {
    return this.inbox.length + this.outbox.length;
  }
}
