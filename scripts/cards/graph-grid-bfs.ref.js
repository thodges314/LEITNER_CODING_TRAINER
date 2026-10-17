function orangesRotting(grid) {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const cells = grid.map((row) => [...row]);
  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === 2) queue.push([r, c]);
      else if (cells[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc] === 1) {
          cells[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}

function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (!n || grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  const seen = grid.map((row) => row.map(() => false));
  let queue = [[0, 0]];
  seen[0][0] = true;
  let length = 1;
  while (queue.length) {
    const next = [];
    for (const [r, c] of queue) {
      if (r === n - 1 && c === n - 1) return length;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            next.push([nr, nc]);
          }
        }
      }
    }
    queue = next;
    length++;
  }
  return -1;
}

function updateMatrix(mat) {
  const rows = mat.length;
  const cols = rows ? mat[0].length : 0;
  const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : Infinity)));
  const queue = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (mat[r][c] === 0) queue.push([r, c]);
  }
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dist[nr][nc] > dist[r][c] + 1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}
