function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

function climbStairs(n) {
  let prev = 1;
  let cur = 1;
  for (let i = 2; i <= n; i++) {
    [prev, cur] = [cur, prev + cur];
  }
  return cur;
}
