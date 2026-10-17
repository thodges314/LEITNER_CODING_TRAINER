function buildTree(preorder, inorder) {
  const index = new Map(inorder.map((v, i) => [v, i]));
  let p = 0;
  function build(lo, hi) {
    if (lo > hi) return null;
    const val = preorder[p++];
    const mid = index.get(val);
    const left = build(lo, mid - 1);
    const right = build(mid + 1, hi);
    return { val, left, right };
  }
  return build(0, inorder.length - 1);
}

function serialize(root) {
  const out = [];
  (function walk(node) {
    if (!node) {
      out.push('#');
      return;
    }
    out.push(String(node.val));
    walk(node.left);
    walk(node.right);
  })(root);
  return out.join(',');
}

function deserialize(str) {
  const parts = str.split(',');
  let i = 0;
  function build() {
    const token = parts[i++];
    if (token === '#') return null;
    const left = build();
    const right = build();
    return { val: Number(token), left, right };
  }
  return build();
}
