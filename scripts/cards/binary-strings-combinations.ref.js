function binaryStrings(n) {
  const out = [];
  const go = (s) => {
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

function combine(n, k) {
  const out = [];
  const path = [];
  const go = (start) => {
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
