function rob(nums: number[]): number {
  let take = 0;
  let skip = 0;
  for (const n of nums) {
    [take, skip] = [skip + n, Math.max(take, skip)];
  }
  return Math.max(take, skip);
}

function lengthOfLIS(nums: number[]): number {
  const dp: number[] = new Array(nums.length).fill(1);
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}
