function levelOrder(root) {
  const out = [];
  if (!root) return out;
  let level = [root];
  while (level.length) {
    out.push(level.map((node) => node.val));
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return out;
}

function rightSideView(root) {
  return levelOrder(root).map((level) => level[level.length - 1]);
}

function zigzagLevelOrder(root) {
  return levelOrder(root).map((level, depth) => (depth % 2 ? level.reverse() : level));
}
