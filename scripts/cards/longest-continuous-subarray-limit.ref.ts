function longestSubarray(nums: number[], limit: number): number {
  let left = 0;
  let maxLen = 0;
  const maxDeque: number[] = [];
  const minDeque: number[] = [];

  for (let right = 0; right < nums.length; right++) {
    const val = nums[right];

    while (maxDeque.length > 0 && val > maxDeque[maxDeque.length - 1]) {
      maxDeque.pop();
    }
    maxDeque.push(val);

    while (minDeque.length > 0 && val < minDeque[minDeque.length - 1]) {
      minDeque.pop();
    }
    minDeque.push(val);

    while (maxDeque[0] - minDeque[0] > limit) {
      if (maxDeque[0] === nums[left]) {
        maxDeque.shift();
      }
      if (minDeque[0] === nums[left]) {
        minDeque.shift();
      }
      left++;
    }

    const currentLen = right - left + 1;
    if (currentLen > maxLen) {
      maxLen = currentLen;
    }
  }

  return maxLen;
}
