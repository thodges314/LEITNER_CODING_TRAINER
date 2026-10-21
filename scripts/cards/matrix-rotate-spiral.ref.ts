function transpose(matrix: number[][]): number[][] {
  if (!matrix.length) return [];
  return matrix[0].map((_, c) => matrix.map((row) => row[c]));
}

function rotate90(matrix: number[][]): number[][] {
  return transpose(matrix).map((row) => row.reverse());
}

function spiralOrder(matrix: number[][]): number[] {
  if (!matrix.length) return [];
  const out: number[] = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}
