function myReduce<T, U = T>(
  arr: T[],
  callback: (accumulator: U, value: T, index: number, array: T[]) => U,
  initialValue?: U
): U {
  const hasInitial = arguments.length >= 3;
  if (arr.length === 0 && !hasInitial) throw new TypeError('Reduce of empty array with no initial value');
  let acc = (hasInitial ? initialValue : arr[0]) as U;
  const start = hasInitial ? 0 : 1;
  for (let i = start; i < arr.length; i++) {
    if (i in arr) acc = callback(acc, arr[i], i, arr);
  }
  return acc;
}
