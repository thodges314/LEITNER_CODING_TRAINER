class Heap<T> {
  items: T[];
  compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = (a: any, b: any) => (a as any) - (b as any)) {
    this.items = [];
    this.compare = compare;
  }
  size(): number {
    return this.items.length;
  }
  peek(): T | undefined {
    return this.items[0];
  }
  push(value: T): void {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(a[i], a[parent]) >= 0) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop(): T | undefined {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.compare(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.compare(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

class MedianFinder {
  low: Heap<number>;
  high: Heap<number>;

  constructor() {
    this.low = new Heap<number>((a, b) => b - a);
    this.high = new Heap<number>();
  }
  addNum(num: number): void {
    this.low.push(num);
    this.high.push(this.low.pop()!);
    if (this.high.size() > this.low.size()) this.low.push(this.high.pop()!);
  }
  findMedian(): number | undefined {
    if (!this.low.size()) return undefined;
    if (this.low.size() > this.high.size()) return this.low.peek();
    return (this.low.peek()! + this.high.peek()!) / 2;
  }
}

function leastInterval(tasks: string[], n: number): number {
  const counts: Record<string, number> = {};
  for (const t of tasks) counts[t] = (counts[t] || 0) + 1;
  const max = Math.max(0, ...Object.values(counts));
  const withMax = Object.values(counts).filter((c) => c === max).length;
  return Math.max(tasks.length, (max - 1) * (n + 1) + withMax);
}
