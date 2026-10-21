function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftIndex(i: number): number {
  return 2 * i + 1;
}

function rightIndex(i: number): number {
  return 2 * i + 2;
}

function isMinHeap(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    const l = leftIndex(i);
    const r = rightIndex(i);
    if (l < arr.length && arr[i] > arr[l]) return false;
    if (r < arr.length && arr[i] > arr[r]) return false;
  }
  return true;
}

function siftUp(arr: number[], i: number): number[] {
  while (i > 0) {
    const p = parentIndex(i);
    if (arr[p] <= arr[i]) break;
    [arr[p], arr[i]] = [arr[i], arr[p]];
    i = p;
  }
  return arr;
}
