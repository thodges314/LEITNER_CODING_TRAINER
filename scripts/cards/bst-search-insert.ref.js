function searchBST(root, val) {
  while (root && root.val !== val) {
    root = val < root.val ? root.left : root.right;
  }
  return root || null;
}

function insertBST(root, val) {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertBST(root.left, val);
  else if (val > root.val) root.right = insertBST(root.right, val);
  return root;
}

function findMin(root) {
  if (!root) return undefined;
  while (root.left) root = root.left;
  return root.val;
}

function findMax(root) {
  if (!root) return undefined;
  while (root.right) root = root.right;
  return root.val;
}
