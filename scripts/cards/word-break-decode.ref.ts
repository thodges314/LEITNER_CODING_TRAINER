function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set<string>(wordDict);
  const dp: boolean[] = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

function numDecodings(s: string): number {
  const dp: number[] = new Array(s.length + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= s.length; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }
  }
  return dp[s.length];
}
