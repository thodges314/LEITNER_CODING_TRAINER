function kthSmallest(root: TreeNode<number> | null, k: number): number | undefined {
  const stack: TreeNode<number>[] = [];
  let node: TreeNode<number> | null = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    const popped = stack.pop();
    if (!popped) break;
    node = popped;
    if (--k === 0) return node.val;
    node = node.right;
  }
  return undefined;
}

function kthLargest(root: TreeNode<number> | null, k: number): number | undefined {
  const stack: TreeNode<number>[] = [];
  let node: TreeNode<number> | null = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.right;
    }
    const popped = stack.pop();
    if (!popped) break;
    node = popped;
    if (--k === 0) return node.val;
    node = node.left;
  }
  return undefined;
}

function insertIntoBST(root: TreeNode<number> | null, val: number): TreeNode<number> {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}

function sortedArrayToBST(nums: number[]): TreeNode<number> | null {
  function build(lo: number, hi: number): TreeNode<number> | null {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return { val: nums[mid], left: build(lo, mid - 1), right: build(mid + 1, hi) };
  }
  return build(0, nums.length - 1);
}
