function createMatrix<T = number>(rows: number, cols: number, fill: T = 0 as unknown as T): T[][] {
  return Array.from({ length: rows }, () => new Array<T>(cols).fill(fill));
}

function matrixSum(matrix: number[][]): number {
  let total = 0;
  for (const row of matrix) {
    for (const value of row) total += value;
  }
  return total;
}

function diagonalSum(matrix: number[][]): number {
  const n = matrix.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += matrix[i][i];
    if (i !== n - 1 - i) total += matrix[i][n - 1 - i];
  }
  return total;
}
