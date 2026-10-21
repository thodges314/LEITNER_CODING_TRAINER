function twoSum(nums: number[], target: number): [number, number] | [] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    const match = map.get(diff);
    if (match !== undefined) return [match, i];
    map.set(nums[i], i);
  }
  return [];
}
