function subsets(nums) {
  const out = [];
  const path = [];
  const go = (start) => {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  };
  go(0);
  return out;
}

function permute(nums) {
  const out = [];
  const used = new Array(nums.length).fill(false);
  const path = [];
  const go = () => {
    if (path.length === nums.length) {
      out.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  };
  go();
  return out;
}

function generateParenthesis(n) {
  const out = [];
  const go = (s, open, close) => {
    if (s.length === 2 * n) {
      out.push(s);
      return;
    }
    if (open < n) go(s + '(', open + 1, close);
    if (close < open) go(s + ')', open, close + 1);
  };
  go('', 0, 0);
  return out;
}
