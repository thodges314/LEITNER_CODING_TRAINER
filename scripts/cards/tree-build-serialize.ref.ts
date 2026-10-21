function buildTree(preorder: number[], inorder: number[]): TreeNode<number> | null {
  const index = new Map<number, number>(inorder.map((v, i) => [v, i]));
  let p = 0;
  function build(lo: number, hi: number): TreeNode<number> | null {
    if (lo > hi) return null;
    const val = preorder[p++];
    const mid = index.get(val)!;
    const left = build(lo, mid - 1);
    const right = build(mid + 1, hi);
    return { val, left, right };
  }
  return build(0, inorder.length - 1);
}

function serialize(root: TreeNode<number> | null): string {
  const out: string[] = [];
  (function walk(node: TreeNode<number> | null): void {
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

function deserialize(str: string): TreeNode<number> | null {
  const parts = str.split(',');
  let i = 0;
  function build(): TreeNode<number> | null {
    const token = parts[i++];
    if (token === '#') return null;
    const left = build();
    const right = build();
    return { val: Number(token), left, right };
  }
  return build();
}
