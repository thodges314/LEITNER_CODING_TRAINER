function moveSelected(left, right, selected, direction) {
  const toRight = direction === 'right';
  const from = toRight ? left : right;
  const to = toRight ? right : left;
  const chosen = new Set(selected);
  const moving = from.filter((item) => chosen.has(item));
  const nextFrom = from.filter((item) => !chosen.has(item));
  const nextTo = [...to, ...moving];
  return toRight ? { left: nextFrom, right: nextTo } : { left: nextTo, right: nextFrom };
}

function moveAll(left, right, direction) {
  return moveSelected(left, right, direction === 'right' ? left : right, direction);
}
