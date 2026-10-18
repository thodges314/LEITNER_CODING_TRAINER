function dropIndex(pointerY, rects) {
  const index = rects.findIndex((r) => pointerY < r.top + r.height / 2);
  return index === -1 ? rects.length : index;
}

function moveItem(list, from, to) {
  const next = list.slice();
  if (to === from || to === from + 1) return next;
  const [item] = next.splice(from, 1);
  next.splice(to > from ? to - 1 : to, 0, item);
  return next;
}

function reorderOnDrop(list, from, pointerY, rects) {
  return moveItem(list, from, dropIndex(pointerY, rects));
}
