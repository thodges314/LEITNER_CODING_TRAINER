function searchBST(root: TreeNode<number> | null, val: number): TreeNode<number> | null {
  let curr: TreeNode<number> | null = root;
  while (curr && curr.val !== val) {
    curr = val < curr.val ? curr.left : curr.right;
  }
  return curr;
}

function insertBST(root: TreeNode<number> | null, val: number): TreeNode<number> {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertBST(root.left, val);
  else if (val > root.val) root.right = insertBST(root.right, val);
  return root;
}

function findMin(root: TreeNode<number> | null): number | undefined {
  if (!root) return undefined;
  let curr: TreeNode<number> = root;
  while (curr.left) curr = curr.left;
  return curr.val;
}

function findMax(root: TreeNode<number> | null): number | undefined {
  if (!root) return undefined;
  let curr: TreeNode<number> = root;
  while (curr.right) curr = curr.right;
  return curr.val;
}
