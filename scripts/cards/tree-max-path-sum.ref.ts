function maxPathSum(root: TreeNode<number> | null): number {
  let best = -Infinity;
  function gain(node: TreeNode<number> | null): number {
    if (!node) return 0;
    const left = Math.max(0, gain(node.left));
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return best;
}

function sumNumbers(root: TreeNode<number> | null): number {
  function dfs(node: TreeNode<number> | null, acc: number): number {
    if (!node) return 0;
    const value = acc * 10 + node.val;
    if (!node.left && !node.right) return value;
    return dfs(node.left, value) + dfs(node.right, value);
  }
  return dfs(root, 0);
}

function goodNodes(root: TreeNode<number> | null): number {
  function dfs(node: TreeNode<number> | null, max: number): number {
    if (!node) return 0;
    const good = node.val >= max ? 1 : 0;
    const next = Math.max(max, node.val);
    return good + dfs(node.left, next) + dfs(node.right, next);
  }
  return root ? dfs(root, -Infinity) : 0;
}
