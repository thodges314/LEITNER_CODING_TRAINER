function partition(s: string): string[][] {
  const out: string[][] = [];
  const path: string[] = [];
  const isPal = (lo: number, hi: number): boolean => {
    while (lo < hi) if (s[lo++] !== s[hi--]) return false;
    return true;
  };
  function dfs(start: number): void {
    if (start === s.length) {
      out.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      path.push(s.slice(start, end + 1));
      dfs(end + 1);
      path.pop();
    }
  }
  dfs(0);
  return out;
}

function letterCombinations(digits: string): string[] {
  if (!digits) return [];
  const keys: Record<string, string> = {
    2: 'abc',
    3: 'def',
    4: 'ghi',
    5: 'jkl',
    6: 'mno',
    7: 'pqrs',
    8: 'tuv',
    9: 'wxyz',
  };
  const out: string[] = [];
  function dfs(i: number, built: string): void {
    if (i === digits.length) {
      out.push(built);
      return;
    }
    for (const ch of keys[digits[i]] || '') dfs(i + 1, built + ch);
  }
  dfs(0, '');
  return out;
}

function restoreIpAddresses(s: string): string[] {
  const out: string[] = [];
  const parts: string[] = [];
  function dfs(start: number): void {
    if (parts.length === 4) {
      if (start === s.length) out.push(parts.join('.'));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const piece = s.slice(start, start + len);
      if (piece.length > 1 && piece[0] === '0') break;
      if (Number(piece) > 255) break;
      parts.push(piece);
      dfs(start + len);
      parts.pop();
    }
  }
  dfs(0);
  return out;
}
