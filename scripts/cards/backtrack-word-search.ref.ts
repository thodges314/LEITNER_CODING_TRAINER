function exist(board: string[][], word: string): boolean {
  const rows = board.length;
  const cols = rows ? board[0].length : 0;
  function dfs(r: number, c: number, i: number): boolean {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    const saved = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}

function findWords(board: string[][], words: string[]): string[] {
  return [...new Set(words)].filter((word) => exist(board, word));
}
