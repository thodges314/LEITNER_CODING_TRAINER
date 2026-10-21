function levelOrder(root: TreeNode<number> | null): number[][] {
  const out: number[][] = [];
  if (!root) return out;
  let level: TreeNode<number>[] = [root];
  while (level.length) {
    out.push(level.map((node) => node.val));
    const next: TreeNode<number>[] = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return out;
}

function rightSideView(root: TreeNode<number> | null): number[] {
  return levelOrder(root).map((level) => level[level.length - 1]);
}

function zigzagLevelOrder(root: TreeNode<number> | null): number[][] {
  return levelOrder(root).map((level, depth) => (depth % 2 ? [...level].reverse() : level));
}
