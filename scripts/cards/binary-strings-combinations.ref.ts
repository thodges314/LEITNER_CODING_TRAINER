function binaryStrings(n: number): string[] {
  const out: string[] = [];
  const go = (s: string): void => {
    if (s.length === n) {
      out.push(s);
      return;
    }
    go(s + '0');
    go(s + '1');
  };
  go('');
  return out;
}

function combine(n: number, k: number): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  const go = (start: number): void => {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    for (let i = start; i <= n; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  };
  go(1);
  return out;
}
