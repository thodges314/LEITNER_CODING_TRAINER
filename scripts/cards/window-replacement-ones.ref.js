function characterReplacement(s, k) {
  const counts = {};
  let left = 0;
  let maxCount = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts[s[right]] = (counts[s[right]] || 0) + 1;
    maxCount = Math.max(maxCount, counts[s[right]]);
    while (right - left + 1 - maxCount > k) {
      counts[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
