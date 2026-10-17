function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target;
  return hasPathSum(root.left, target - root.val) || hasPathSum(root.right, target - root.val);
}

function pathSum(root, target) {
  const out = [];
  const path = [];
  function dfs(node, remaining) {
    if (!node) return;
    path.push(node.val);
    if (!node.left && !node.right && node.val === remaining) out.push([...path]);
    dfs(node.left, remaining - node.val);
    dfs(node.right, remaining - node.val);
    path.pop();
  }
  dfs(root, target);
  return out;
}

function minDepth(root) {
  if (!root) return 0;
  if (!root.left) return 1 + minDepth(root.right);
  if (!root.right) return 1 + minDepth(root.left);
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}
