function solveNQueens(n) {
  const out = [];
  const cols = new Set();
  const diag = new Set();
  const anti = new Set();
  const placed = [];
  function dfs(row) {
    if (row === n) {
      out.push(placed.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(row - c) || anti.has(row + c)) continue;
      cols.add(c);
      diag.add(row - c);
      anti.add(row + c);
      placed.push(c);
      dfs(row + 1);
      placed.pop();
      cols.delete(c);
      diag.delete(row - c);
      anti.delete(row + c);
    }
  }
  dfs(0);
  return out;
}

function totalNQueens(n) {
  let count = 0;
  const cols = new Set();
  const diag = new Set();
  const anti = new Set();
  function dfs(row) {
    if (row === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(row - c) || anti.has(row + c)) continue;
      cols.add(c);
      diag.add(row - c);
      anti.add(row + c);
      dfs(row + 1);
      cols.delete(c);
      diag.delete(row - c);
      anti.delete(row + c);
    }
  }
  dfs(0);
  return count;
}
