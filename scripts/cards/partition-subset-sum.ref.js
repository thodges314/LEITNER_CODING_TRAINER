function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const half = total / 2;
  const dp = new Array(half + 1).fill(false);
  dp[0] = true;
  for (const n of nums) {
    for (let s = half; s >= n; s--) {
      if (dp[s - n]) dp[s] = true;
    }
  }
  return dp[half];
}

function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const want = (total + target) / 2;
  const dp = new Array(want + 1).fill(0);
  dp[0] = 1;
  for (const n of nums) {
    for (let s = want; s >= n; s--) dp[s] += dp[s - n];
  }
  return dp[want];
}
