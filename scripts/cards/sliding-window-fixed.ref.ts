function maxSubarraySum(arr: number[], k: number): number | null {
  if (arr.length < k || arr.length === 0) return null;
  let max = 0,
    window = 0;
  for (let i = 0; i < k; i++) window += arr[i];
  max = window;
  for (let i = k; i < arr.length; i++) {
    window += arr[i] - arr[i - k];
    max = Math.max(max, window);
  }
  return max;
}
