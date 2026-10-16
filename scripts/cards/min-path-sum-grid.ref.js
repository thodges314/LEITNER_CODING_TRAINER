function minPathSum(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = new Array(cols).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const best = Math.min(dp[c], c > 0 ? dp[c - 1] : Infinity);
      dp[c] = best + grid[r][c];
    }
  }
  return dp[cols - 1];
}

function minimumTotal(triangle) {
  const dp = triangle[triangle.length - 1].slice();
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      dp[c] = triangle[r][c] + Math.min(dp[c], dp[c + 1]);
    }
  }
  return dp[0];
}
