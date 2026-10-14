function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0]);
  const res = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = res[res.length - 1];
    if (curr[0] <= prev[1]) prev[1] = Math.max(prev[1], curr[1]);
    else res.push(curr);
  }
  return res;
}
