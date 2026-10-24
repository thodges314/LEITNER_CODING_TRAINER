interface Rect {
  top: number;
  height: number;
}

function dropIndex(pointerY: number, rects: Rect[]): number {
  const index = rects.findIndex((r) => pointerY < r.top + r.height / 2);
  return index === -1 ? rects.length : index;
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  if (to === from || to === from + 1) return next;
  const [item] = next.splice(from, 1);
  next.splice(to > from ? to - 1 : to, 0, item);
  return next;
}

function reorderOnDrop<T>(list: T[], from: number, pointerY: number, rects: Rect[]): T[] {
  return moveItem(list, from, dropIndex(pointerY, rects));
}
