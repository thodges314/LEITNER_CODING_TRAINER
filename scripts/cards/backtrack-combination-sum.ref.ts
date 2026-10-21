function combinationSum(candidates: number[], target: number): number[][] {
  const nums = [...candidates].sort((a, b) => a - b);
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(start: number, remaining: number): void {
    if (remaining === 0) {
      out.push([...path]);
      return;
    }
    for (let i = start; i < nums.length && nums[i] <= remaining; i++) {
      path.push(nums[i]);
      dfs(i, remaining - nums[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return out;
}

function combinationSum2(candidates: number[], target: number): number[][] {
  const nums = [...candidates].sort((a, b) => a - b);
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(start: number, remaining: number): void {
    if (remaining === 0) {
      out.push([...path]);
      return;
    }
    for (let i = start; i < nums.length && nums[i] <= remaining; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]);
      dfs(i + 1, remaining - nums[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return out;
}

function combinationSum3(k: number, n: number): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(start: number, remaining: number): void {
    if (path.length === k) {
      if (remaining === 0) out.push([...path]);
      return;
    }
    for (let d = start; d <= 9 && d <= remaining; d++) {
      path.push(d);
      dfs(d + 1, remaining - d);
      path.pop();
    }
  }
  dfs(1, n);
  return out;
}
