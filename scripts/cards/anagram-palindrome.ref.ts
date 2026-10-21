function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const counts: Record<string, number> = {};
  for (const ch of a) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of b) {
    if (!counts[ch]) return false;
    counts[ch]--;
  }
  return true;
}

function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let i = 0;
  let j = clean.length - 1;
  while (i < j) {
    if (clean[i] !== clean[j]) return false;
    i++;
    j--;
  }
  return true;
}

function longestCommonPrefix(words: string[]): string {
  if (!words.length) return '';
  let prefix = words[0];
  for (const w of words) {
    while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
