function isAnagram(a, b) {
  if (a.length !== b.length) return false;

  const counts = new Map();

  for (let i = 0; i < a.length; i++) {
    const ch = a[i];
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }

  for (let i = 0; i < b.length; i++) {
    const ch = b[i];
    const count = counts.get(ch);
    if (!count) return false;
    counts.set(ch, count - 1);
  }

  return true;
}

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let i = 0;
  let j = clean.length - 1;
  while (i < j) {
    if (clean[i++] !== clean[j--]) return false;
  }
  return true;
}

function longestCommonPrefix(words) {
  if (words.length === 0) return "";

  const master = words[0];
  let length = master.length;

  for (let idx = 1; idx < words.length; idx++) {
    const word = words[idx];
    length = Math.min(length, word.length);

    for (let j = 0; j < length; j++) {
      if (master[j] !== word[j]) {
        length = j;
        break;
      }
    }

    if (length === 0) return "";
  }

  return master.slice(0, length);
}
