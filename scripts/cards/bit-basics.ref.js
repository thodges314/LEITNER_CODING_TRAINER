function singleNumber(nums) {
  let result = 0;
  for (const n of nums) result ^= n;
  return result;
}

function countOneBits(n) {
  n = n >>> 0;
  let count = 0;
  while (n) {
    n = (n & (n - 1)) >>> 0;
    count++;
  }
  return count;
}

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
