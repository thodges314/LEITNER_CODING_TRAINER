type Interval = [number, number];

function overlaps(a: Interval, b: Interval): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

function intersection(a: Interval, b: Interval): Interval | null {
  if (!overlaps(a, b)) return null;
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

function totalLength(intervals: Interval[]): number {
  const sorted = [...intervals].sort((x, y) => x[0] - y[0]);
  let total = 0;
  let curStart: number | null = null;
  let curEnd: number | null = null;
  for (const [start, end] of sorted) {
    if (curEnd === null || start > curEnd) {
      if (curEnd !== null && curStart !== null) total += curEnd - curStart;
      curStart = start;
      curEnd = end;
    } else {
      curEnd = Math.max(curEnd, end);
    }
  }
  if (curEnd !== null && curStart !== null) total += curEnd - curStart;
  return total;
}
