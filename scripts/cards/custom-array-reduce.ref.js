function myReduce(arr, callback, initialValue) {
  let hasInitial = arguments.length >= 3;
  if (arr.length === 0 && !hasInitial) throw new TypeError('Reduce of empty array with no initial value');
  let acc = hasInitial ? initialValue : arr[0];
  let start = hasInitial ? 0 : 1;
  for (let i = start; i < arr.length; i++) {
    if (i in arr) acc = callback(acc, arr[i], i, arr);
  }
  return acc;
}
