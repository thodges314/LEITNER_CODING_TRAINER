function expand(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--;
    right++;
  }
  return [left + 1, right];
}

function longestPalindrome(s) {
  let bestStart = 0;
  let bestEnd = 0;
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expand(s, i, i), expand(s, i, i + 1)]) {
      if (b - a > bestEnd - bestStart) {
        bestStart = a;
        bestEnd = b;
      }
    }
  }
  return s.slice(bestStart, bestEnd);
}

function countPalindromicSubstrings(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expand(s, i, i), expand(s, i, i + 1)]) {
      count += b - a > 0 ? Math.ceil((b - a) / 2) : 0;
    }
  }
  return count;
}
