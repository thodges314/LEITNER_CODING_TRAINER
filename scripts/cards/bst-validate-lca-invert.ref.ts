function isValidBST(
  root: TreeNode<number> | null,
  lo: number = -Infinity,
  hi: number = Infinity
): boolean {
  if (!root) return true;
  if (root.val <= lo || root.val >= hi) return false;
  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);
}

function invertTree(root: TreeNode<number> | null): TreeNode<number> | null {
  if (!root) return root;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}

function lowestCommonAncestor(
  root: TreeNode<number> | null,
  p: number,
  q: number
): number | undefined {
  let node: TreeNode<number> | null = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node.val;
  }
  return undefined;
}
