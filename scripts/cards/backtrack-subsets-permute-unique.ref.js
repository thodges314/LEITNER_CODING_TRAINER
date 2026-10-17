function subsetsWithDup(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const out = [];
  const path = [];
  function dfs(start) {
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

function permuteUnique(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const used = new Array(sorted.length).fill(false);
  const out = [];
  const path = [];
  function dfs() {
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

function combine(n, k) {
  const out = [];
  const path = [];
  function dfs(start) {
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
