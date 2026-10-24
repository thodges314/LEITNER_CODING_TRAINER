type TransferDirection = 'left' | 'right';

function moveSelected(
  left: string[],
  right: string[],
  selected: string[],
  direction: TransferDirection
): { left: string[]; right: string[] } {
  const toRight = direction === 'right';
  const from = toRight ? left : right;
  const to = toRight ? right : left;
  const chosen = new Set<string>(selected);
  const moving = from.filter((item) => chosen.has(item));
  const nextFrom = from.filter((item) => !chosen.has(item));
  const nextTo = [...to, ...moving];
  return toRight ? { left: nextFrom, right: nextTo } : { left: nextTo, right: nextFrom };
}

function moveAll(
  left: string[],
  right: string[],
  direction: TransferDirection
): { left: string[]; right: string[] } {
  return moveSelected(left, right, direction === 'right' ? left : right, direction);
}
