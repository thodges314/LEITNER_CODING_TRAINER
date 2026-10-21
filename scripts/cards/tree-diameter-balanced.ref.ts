function diameterOfBinaryTree(root: TreeNode<number> | null): number {
  let best = 0;
  function height(node: TreeNode<number> | null): number {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }
  height(root);
  return best;
}

function isBalanced(root: TreeNode<number> | null): boolean {
  function height(node: TreeNode<number> | null): number {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1) return -1;
    return Math.abs(left - right) > 1 ? -1 : 1 + Math.max(left, right);
  }
  return height(root) !== -1;
}

function isSymmetric(root: TreeNode<number> | null): boolean {
  function mirror(a: TreeNode<number> | null, b: TreeNode<number> | null): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return !root || mirror(root.left, root.right);
}
