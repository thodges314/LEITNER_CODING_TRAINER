class MinHeap {
  h: number[];

  constructor() {
    this.h = [];
  }

  size(): number {
    return this.h.length;
  }

  peek(): number | undefined {
    return this.h[0];
  }

  push(x: number): void {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (h[parent] <= h[i]) break;
      [h[parent], h[i]] = [h[i], h[parent]];
      i = parent;
    }
  }

  pop(): number | undefined {
    const h = this.h;
    if (!h.length) return undefined;
    const top = h[0];
    const last = h.pop()!;
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let small = i;
        if (l < h.length && h[l] < h[small]) small = l;
        if (r < h.length && h[r] < h[small]) small = r;
        if (small === i) break;
        [h[small], h[i]] = [h[i], h[small]];
        i = small;
      }
    }
    return top;
  }
}

function kSmallest(nums: number[], k: number): number[] {
  const heap = new MinHeap();
  for (const n of nums) heap.push(n);
  const out: number[] = [];
  while (out.length < k && heap.size()) {
    const val = heap.pop();
    if (val !== undefined) out.push(val);
  }
  return out;
}
