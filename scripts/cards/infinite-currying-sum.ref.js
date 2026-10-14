function sum(...first) {
  const total = first.reduce((a, b) => a + b, 0);
  const next = (...more) => (more.length === 0 ? total : sum(total, ...more));
  next.valueOf = () => total;
  next.toString = () => String(total);
  return next;
}
