function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return undefined;
}

function kthLargest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.right;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.left;
  }
  return undefined;
}

function insertIntoBST(root, val) {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}

function sortedArrayToBST(nums) {
  function build(lo, hi) {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return { val: nums[mid], left: build(lo, mid - 1), right: build(mid + 1, hi) };
  }
  return build(0, nums.length - 1);
}
