function lengthOfLongestSubstring(s) {
  const last = new Map();
  let start = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (last.has(ch) && last.get(ch) >= start) start = last.get(ch) + 1;
    last.set(ch, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}

function longestKDistinct(s, k) {
  if (k === 0) return 0;
  const counts = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) || 0) + 1);
    while (counts.size > k) {
      const remaining = counts.get(s[left]) - 1;
      if (remaining === 0) counts.delete(s[left]);
      else counts.set(s[left], remaining);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
