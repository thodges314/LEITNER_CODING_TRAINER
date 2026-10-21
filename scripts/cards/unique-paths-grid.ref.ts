function uniquePaths(m: number, n: number): number {
  const row: number[] = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  }
  return row[n - 1];
}

function uniquePathsWithObstacles(grid: number[][]): number {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const row: number[] = new Array(cols).fill(0);
  row[0] = grid[0][0] === 1 ? 0 : 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) row[c] = 0;
      else if (c > 0) row[c] += row[c - 1];
    }
  }
  return row[cols - 1];
}
