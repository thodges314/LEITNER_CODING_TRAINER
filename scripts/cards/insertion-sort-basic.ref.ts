function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const value = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > value) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = value;
  }
  return arr;
}

function selectionSort(arr: number[]): number[] {
  const out = arr.slice();
  for (let i = 0; i < out.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < out.length; j++) {
      if (out[j] < out[min]) min = j;
    }
    [out[i], out[min]] = [out[min], out[i]];
  }
  return out;
}

function isSorted(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}
