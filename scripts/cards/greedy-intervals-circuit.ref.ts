function eraseOverlapIntervals(intervals: [number, number][] | number[][]): number {
  if (!intervals.length) return 0;
  const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);
  let keep = 1;
  let end = sorted[0][1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] >= end) {
      keep++;
      end = sorted[i][1];
    }
  }
  return intervals.length - keep;
}

function canAttendMeetings(intervals: [number, number][] | number[][]): boolean {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false;
  }
  return true;
}

function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0;
  let tank = 0;
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}
