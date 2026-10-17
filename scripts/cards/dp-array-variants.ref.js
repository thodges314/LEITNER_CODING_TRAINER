function robLine(nums, from, to) {
  let take = 0;
  let skip = 0;
  for (let i = from; i <= to; i++) {
    [take, skip] = [skip + nums[i], Math.max(take, skip)];
  }
  return Math.max(take, skip);
}

function robCircular(nums) {
  if (!nums.length) return 0;
  if (nums.length === 1) return nums[0];
  return Math.max(robLine(nums, 0, nums.length - 2), robLine(nums, 1, nums.length - 1));
}

function maxProduct(nums) {
  let max = nums[0];
  let min = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    const candidates = [n, max * n, min * n];
    max = Math.max(...candidates);
    min = Math.min(...candidates);
    best = Math.max(best, max);
  }
  return best;
}

function minCostClimbingStairs(cost) {
  let a = 0;
  let b = 0;
  for (let i = 2; i <= cost.length; i++) {
    [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  }
  return b;
}
