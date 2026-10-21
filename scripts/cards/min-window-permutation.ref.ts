function minWindow(s: string, t: string): string {
  if (!t.length || t.length > s.length) return '';
  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  let missing = t.length;
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      if ((need.get(ch) as number) > 0) missing--;
      need.set(ch, (need.get(ch) as number) - 1);
    }
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const lc = s[left];
      if (need.has(lc)) {
        need.set(lc, (need.get(lc) as number) + 1);
        if ((need.get(lc) as number) > 0) missing++;
      }
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}

function findAnagrams(s: string, p: string): number[] {
  const out: number[] = [];
  if (p.length > s.length) return out;
  const need: Record<string, number> = {};
  for (const ch of p) need[ch] = (need[ch] || 0) + 1;
  let missing = p.length;
  for (let i = 0; i < s.length; i++) {
    if (need[s[i]] !== undefined) {
      if (need[s[i]] > 0) missing--;
      need[s[i]]--;
    }
    if (i >= p.length) {
      const gone = s[i - p.length];
      if (need[gone] !== undefined) {
        need[gone]++;
        if (need[gone] > 0) missing++;
      }
    }
    if (missing === 0) out.push(i - p.length + 1);
  }
  return out;
}

function checkInclusion(s1: string, s2: string): boolean {
  return findAnagrams(s2, s1).length > 0;
}
