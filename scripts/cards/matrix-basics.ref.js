function createMatrix(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => new Array(cols).fill(fill));
}

function matrixSum(matrix) {
  let total = 0;
  for (const row of matrix) {
    for (const value of row) total += value;
  }
  return total;
}

function diagonalSum(matrix) {
  const n = matrix.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += matrix[i][i];
    if (i !== n - 1 - i) total += matrix[i][n - 1 - i];
  }
  return total;
}
