function binarySearch(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

function lowerBound(sorted, target) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function mySqrt(x) {
  let lo = 0;
  let hi = x;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (mid * mid <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
