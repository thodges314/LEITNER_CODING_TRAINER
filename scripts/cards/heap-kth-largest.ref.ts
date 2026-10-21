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

function findKthLargest(nums: number[], k: number): number {
  const heap = new Heap<number>((a, b) => a - b);
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek()!;
}

class KthLargest {
  k: number;
  heap: Heap<number>;

  constructor(k: number, nums: number[]) {
    this.k = k;
    this.heap = new Heap<number>((a, b) => a - b);
    for (const n of nums) this.add(n);
  }

  add(val: number): number {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek()!;
  }
}

function lastStoneWeight(stones: number[]): number {
  const heap = new Heap<number>((a, b) => b - a);
  for (const s of stones) heap.push(s);
  while (heap.size() > 1) {
    const a = heap.pop()!;
    const b = heap.pop()!;
    if (a !== b) heap.push(a - b);
  }
  return heap.size() ? heap.peek()! : 0;
}
