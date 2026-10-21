function missingNumber(nums: number[]): number {
  let x = nums.length;
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}

function hammingDistance(a: number, b: number): number {
  let diff = a ^ b;
  let count = 0;
  while (diff) {
    diff &= diff - 1;
    count++;
  }
  return count;
}

function countBitsUpTo(n: number): number[] {
  const bits = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}

function getBit(n: number, i: number): number {
  return (n >> i) & 1;
}

function setBit(n: number, i: number): number {
  return n | (1 << i);
}

function clearBit(n: number, i: number): number {
  return n & ~(1 << i);
}
