function subsetsWithDup(nums: number[]): number[][] {
  const sorted = [...nums].sort((a, b) => a - b);
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(start: number): void {
    out.push([...path]);
    for (let i = start; i < sorted.length; i++) {
      if (i > start && sorted[i] === sorted[i - 1]) continue;
      path.push(sorted[i]);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(0);
  return out;
}

function permuteUnique(nums: number[]): number[][] {
  const sorted = [...nums].sort((a, b) => a - b);
  const used: boolean[] = new Array(sorted.length).fill(false);
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(): void {
    if (path.length === sorted.length) {
      out.push([...path]);
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(sorted[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  }
  dfs();
  return out;
}

function combine(n: number, k: number): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  function dfs(start: number): void {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(1);
  return out;
}
