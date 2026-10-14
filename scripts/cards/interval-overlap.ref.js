function overlaps(a, b) {
  return a[0] <= b[1] && b[0] <= a[1];
}

function intersection(a, b) {
  if (!overlaps(a, b)) return null;
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

function totalLength(intervals) {
  const sorted = [...intervals].sort((x, y) => x[0] - y[0]);
  let total = 0;
  let curStart = null;
  let curEnd = null;
  for (const [start, end] of sorted) {
    if (curEnd === null || start > curEnd) {
      if (curEnd !== null) total += curEnd - curStart;
      curStart = start;
      curEnd = end;
    } else {
      curEnd = Math.max(curEnd, end);
    }
  }
  if (curEnd !== null) total += curEnd - curStart;
  return total;
}
