class MinHeap {
  constructor(cmp) {
    this.cmp = cmp;
    this.data = [];
  }

  size() {
    return this.data.length;
  }

  push(node) {
    this.data.push(node);
    this.siftUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  siftUp(index) {
    let curr = index;
    while (curr > 0) {
      const parent = (curr - 1) >> 1;
      if (this.cmp(this.data[curr].value, this.data[parent].value) < 0) {
        const tmp = this.data[curr];
        this.data[curr] = this.data[parent];
        this.data[parent] = tmp;
        curr = parent;
      } else {
        break;
      }
    }
  }

  siftDown(index) {
    let curr = index;
    const len = this.data.length;
    while ((curr << 1) + 1 < len) {
      let smallest = (curr << 1) + 1;
      const right = smallest + 1;
      if (right < len && this.cmp(this.data[right].value, this.data[smallest].value) < 0) {
        smallest = right;
      }
      if (this.cmp(this.data[smallest].value, this.data[curr].value) < 0) {
        const tmp = this.data[curr];
        this.data[curr] = this.data[smallest];
        this.data[smallest] = tmp;
        curr = smallest;
      } else {
        break;
      }
    }
  }
}

async function* mergeKAsyncStreams(streams, compareFn) {
  const cmp = compareFn || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const heap = new MinHeap(cmp);

  const initialPromises = streams.map(async (stream) => {
    const iterator = stream[Symbol.asyncIterator]();
    const { value, done } = await iterator.next();
    if (!done) {
      return { value, iterator };
    }
    return null;
  });

  const initialNodes = await Promise.all(initialPromises);
  for (const node of initialNodes) {
    if (node !== null) {
      heap.push(node);
    }
  }

  while (heap.size() > 0) {
    const minNode = heap.pop();
    yield minNode.value;

    const { value, done } = await minNode.iterator.next();
    if (!done) {
      minNode.value = value;
      heap.push(minNode);
    }
  }
}

