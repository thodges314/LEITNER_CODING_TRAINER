function rob(nums) {
  let take = 0;
  let skip = 0;
  for (const n of nums) {
    [take, skip] = [skip + n, Math.max(take, skip)];
  }
  return Math.max(take, skip);
}

function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}
