function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = w.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

function topKFrequent(nums, k) {
  const counts = new Map();
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, k)
    .map(([n]) => n);
}
