function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function sumTree(root) {
  if (!root) return 0;
  return root.val + sumTree(root.left) + sumTree(root.right);
}

function countLeaves(root) {
  if (!root) return 0;
  if (!root.left && !root.right) return 1;
  return countLeaves(root.left) + countLeaves(root.right);
}
