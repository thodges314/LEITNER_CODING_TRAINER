function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const mid = arr.length >> 1;
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function quickSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const pivot = arr[arr.length >> 1];
  const less = arr.filter((x) => x < pivot);
  const equal = arr.filter((x) => x === pivot);
  const greater = arr.filter((x) => x > pivot);
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}
