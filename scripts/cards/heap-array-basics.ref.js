function parentIndex(i) {
  return Math.floor((i - 1) / 2);
}

function leftIndex(i) {
  return 2 * i + 1;
}

function rightIndex(i) {
  return 2 * i + 2;
}

function isMinHeap(arr) {
  for (let i = 0; i < arr.length; i++) {
    const l = leftIndex(i);
    const r = rightIndex(i);
    if (l < arr.length && arr[i] > arr[l]) return false;
    if (r < arr.length && arr[i] > arr[r]) return false;
  }
  return true;
}

function siftUp(arr, i) {
  while (i > 0) {
    const p = parentIndex(i);
    if (arr[p] <= arr[i]) break;
    [arr[p], arr[i]] = [arr[i], arr[p]];
    i = p;
  }
  return arr;
}
