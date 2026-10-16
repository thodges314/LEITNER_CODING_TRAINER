function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) return image;
  const fill = (r, c) => {
    if (r < 0 || c < 0 || r >= image.length || c >= image[0].length) return;
    if (image[r][c] !== original) return;
    image[r][c] = color;
    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
  };
  fill(sr, sc);
  return image;
}

function numIslands(grid) {
  const seen = new Set();
  let count = 0;
  const visit = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
    if (grid[r][c] !== '1' || seen.has(r + ',' + c)) return;
    seen.add(r + ',' + c);
    visit(r + 1, c);
    visit(r - 1, c);
    visit(r, c + 1);
    visit(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1' && !seen.has(r + ',' + c)) {
        count++;
        visit(r, c);
      }
    }
  }
  return count;
}
