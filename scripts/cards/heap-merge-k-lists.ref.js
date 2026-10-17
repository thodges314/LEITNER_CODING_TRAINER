class Heap {
  constructor(compare = (a, b) => a - b) {
    this.items = [];
    this.compare = compare;
  }
  size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(value) {
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
  pop() {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop();
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

function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val - b.val);
  for (const node of lists) if (node) heap.push(node);
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.size()) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}

function mergeKSortedArrays(arrays) {
  const heap = new Heap((a, b) => a.val - b.val);
  arrays.forEach((arr, row) => {
    if (arr.length) heap.push({ val: arr[0], row, col: 0 });
  });
  const out = [];
  while (heap.size()) {
    const { val, row, col } = heap.pop();
    out.push(val);
    if (col + 1 < arrays[row].length) heap.push({ val: arrays[row][col + 1], row, col: col + 1 });
  }
  return out;
}

function kClosest(points, k) {
  const heap = new Heap((a, b) => b.d - a.d || b.i - a.i);
  points.forEach((p, i) => {
    heap.push({ d: p[0] * p[0] + p[1] * p[1], i, p });
    if (heap.size() > k) heap.pop();
  });
  const kept = [];
  while (heap.size()) kept.push(heap.pop());
  return kept.sort((a, b) => a.d - b.d || a.i - b.i).map((item) => item.p);
}
