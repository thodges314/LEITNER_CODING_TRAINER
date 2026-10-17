import { writeCards, R } from './_author.mjs';
const NODE = 'Tree nodes are { val, left, right } (null for a missing child).';
const LNODE = 'List nodes are { val, next } (null ends the list).';
writeCards([
  { id: 'tree-level-order', title: 'Trees: Level Order, Right Side View, Zigzag', tags: ['tree', 'bfs', 'queue'],
    difficulty: 2, concept: 'trees',
    cx: ['O(n)', 'O(w)', 'Each node is dequeued once; the queue holds at most one level (width w).'],
    prompt: `${NODE} Write levelOrder(root): an array of arrays, one per depth, left to right ([] for a null root). Write rightSideView(root): the last value of each level (what you see from the right). Write zigzagLevelOrder(root): like levelOrder but every odd depth (1, 3, ...) is reversed.`,
    ref: R`function levelOrder(root) {
  const out = [];
  if (!root) return out;
  let level = [root];
  while (level.length) {
    out.push(level.map((node) => node.val));
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return out;
}

function rightSideView(root) {
  return levelOrder(root).map((level) => level[level.length - 1]);
}

function zigzagLevelOrder(root) {
  return levelOrder(root).map((level, depth) => (depth % 2 ? level.reverse() : level));
}` },
  { id: 'tree-path-sum', title: 'Trees: Path Sum, All Root-to-Leaf Paths, Min Depth', tags: ['tree', 'dfs', 'recursion'],
    difficulty: 2, concept: 'trees',
    cx: ['O(n)', 'O(h)', 'DFS visits every node once; the recursion stack is as deep as the tree height h.'],
    prompt: `${NODE} Write hasPathSum(root, target): true when some root-to-LEAF path sums to target (a null tree is false; a node with one child is not a leaf). Write pathSum(root, target): every root-to-leaf path summing to target, as arrays of values, in left-to-right order. Write minDepth(root): the number of nodes on the shortest root-to-leaf path (0 for null; a node with one child must continue down that child).`,
    ref: R`function hasPathSum(root, target) {
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
}` },
  { id: 'tree-diameter-balanced', title: 'Trees: Diameter, Balanced, Symmetric', tags: ['tree', 'dfs', 'height'],
    difficulty: 3, concept: 'trees',
    cx: ['O(n)', 'O(h)', 'One post-order pass computes heights bottom-up, updating the answer at each node.'],
    prompt: `${NODE} Write diameterOfBinaryTree(root): the number of EDGES on the longest path between any two nodes (the path need not pass through the root; 0 for null or one node). Write isBalanced(root): true when at every node the left and right heights differ by at most 1, in a single O(n) pass. Write isSymmetric(root): true when the tree is a mirror image of itself (null is symmetric).`,
    ref: R`function diameterOfBinaryTree(root) {
  let best = 0;
  function height(node) {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }
  height(root);
  return best;
}

function isBalanced(root) {
  function height(node) {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1) return -1;
    return Math.abs(left - right) > 1 ? -1 : 1 + Math.max(left, right);
  }
  return height(root) !== -1;
}

function isSymmetric(root) {
  function mirror(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return !root || mirror(root.left, root.right);
}` },
  { id: 'bst-kth-insert-build', title: 'BST: Kth Smallest/Largest, Insert, Sorted Array to BST', tags: ['bst', 'inorder', 'recursion'],
    difficulty: 3, concept: 'bst',
    cx: ['O(h + k)', 'O(h)', 'In-order traversal stops after k nodes; inserting walks one root-to-leaf path; building splits the array in halves.'],
    prompt: `${NODE} All trees here are binary search trees. Write kthSmallest(root, k) (1-indexed, in-order, stop as soon as you reach it) and kthLargest(root, k). Write insertIntoBST(root, val): insert a new leaf (values are distinct) and return the root; a null root returns a new node. Write sortedArrayToBST(nums): build a height-balanced BST from a sorted array by always choosing the middle index Math.floor((lo + hi) / 2) as the root of each range (null for []).`,
    ref: R`function kthSmallest(root, k) {
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
}` },
  { id: 'tree-build-serialize', title: 'Trees: Build from Preorder + Inorder, Serialize / Deserialize', tags: ['tree', 'recursion', 'serialization'],
    difficulty: 4, concept: 'trees',
    cx: ['O(n)', 'O(n)', 'An index map of the inorder array gives O(1) root lookup; serialization visits every node once.'],
    prompt: `${NODE} Write buildTree(preorder, inorder): rebuild the tree from its preorder and inorder arrays (all values distinct; [] gives null) in O(n) using a value-to-index map. Write serialize(root): any string encoding of the tree (it must handle null, negative and multi-digit values), and deserialize(str): the exact inverse, so deserialize(serialize(t)) rebuilds a tree structurally equal to t and deserialize(serialize(null)) is null.`,
    ref: R`function buildTree(preorder, inorder) {
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
}` },
  { id: 'tree-max-path-sum', title: 'Trees: Max Path Sum, Root-to-Leaf Numbers, Good Nodes', tags: ['tree', 'dfs', 'post-order'],
    difficulty: 4, concept: 'trees',
    cx: ['O(n)', 'O(h)', 'A single DFS: each node combines the best downward gains from its children.'],
    prompt: `${NODE} Write maxPathSum(root): the maximum sum over any non-empty path (it may start and end at any node, and values can be negative). Write sumNumbers(root): every root-to-leaf path read as a decimal number (digits 0-9, e.g. 1 -> 2 -> 3 is 123); return their sum (0 for null). Write goodNodes(root): how many nodes have a value >= every value on the path from the root to them (the root always counts; null gives 0).`,
    ref: R`function maxPathSum(root) {
  let best = -Infinity;
  function gain(node) {
    if (!node) return 0;
    const left = Math.max(0, gain(node.left));
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return best;
}

function sumNumbers(root) {
  function dfs(node, acc) {
    if (!node) return 0;
    const value = acc * 10 + node.val;
    if (!node.left && !node.right) return value;
    return dfs(node.left, value) + dfs(node.right, value);
  }
  return dfs(root, 0);
}

function goodNodes(root) {
  function dfs(node, max) {
    if (!node) return 0;
    const good = node.val >= max ? 1 : 0;
    const next = Math.max(max, node.val);
    return good + dfs(node.left, next) + dfs(node.right, next);
  }
  return root ? dfs(root, -Infinity) : 0;
}` },
  { id: 'list-remove-reorder', title: 'Linked Lists: Remove Nth From End, Reorder, Remove Duplicates', tags: ['linked-list', 'two-pointer', 'in-place'],
    difficulty: 2, concept: 'linked-lists',
    cx: ['O(n)', 'O(1)', 'Each function walks the list a constant number of times, relinking nodes in place.'],
    prompt: `${LNODE} Write removeNthFromEnd(head, n): remove the n-th node from the end in one pass (two pointers n apart; n is valid) and return the head. Write reorderList(head): rearrange in place to L0 -> Ln -> L1 -> Ln-1 -> ... (find the middle, reverse the second half, interleave); it returns nothing. Write deleteDuplicates(head): in a SORTED list keep one copy of each value and return the head.`,
    ref: R`function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: head };
  let fast = dummy;
  let slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}

function reorderList(head) {
  if (!head || !head.next) return;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let first = head;
  second = prev;
  while (second) {
    const a = first.next;
    const b = second.next;
    first.next = second;
    second.next = a;
    first = a;
    second = b;
  }
}

function deleteDuplicates(head) {
  let node = head;
  while (node && node.next) {
    if (node.next.val === node.val) node.next = node.next.next;
    else node = node.next;
  }
  return head;
}` },
  { id: 'list-add-numbers', title: 'Linked Lists: Add Two Numbers, Odd-Even, Intersection', tags: ['linked-list', 'carry', 'two-pointer'],
    difficulty: 3, concept: 'linked-lists',
    cx: ['O(n + m)', 'O(1)', 'Each pass visits every node once; only the carry or a few pointers are kept (the sum list itself is output).'],
    prompt: `${LNODE} Write addTwoNumbers(l1, l2): the digits are stored in REVERSE order (2 -> 4 -> 3 is 342); return the sum as a new list in the same format, handling different lengths and a final carry. Write oddEvenList(head): group all nodes at odd positions (1st, 3rd, ...) first, then the even positions, keeping relative order, in place and O(1) space. Write getIntersectionNode(a, b): the first NODE (by identity) shared by two lists that merge into one tail, or null if they never meet, without extra memory.`,
    ref: R`function addTwoNumbers(l1, l2) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  let carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    tail.next = { val: sum % 10, next: null };
    tail = tail.next;
    l1 = l1 ? l1.next : null;
    l2 = l2 ? l2.next : null;
  }
  return dummy.next;
}

function oddEvenList(head) {
  if (!head || !head.next) return head;
  let odd = head;
  let even = head.next;
  const evenHead = even;
  while (even && even.next) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead;
  return head;
}

function getIntersectionNode(a, b) {
  let p = a;
  let q = b;
  while (p !== q) {
    p = p ? p.next : b;
    q = q ? q.next : a;
  }
  return p;
}` },
  { id: 'list-reverse-k-group', title: 'Linked Lists: Reverse in K-Groups, Reverse Between, Swap Pairs', tags: ['linked-list', 'reversal', 'pointers'],
    difficulty: 4, concept: 'linked-lists',
    cx: ['O(n)', 'O(n / k)', 'Every node is relinked once; the recursive k-group version keeps one frame per group.'],
    prompt: `${LNODE} Write reverseKGroup(head, k): reverse the nodes k at a time and return the new head; a final group shorter than k stays as it is (k >= 1). Write reverseBetween(head, left, right): reverse only the nodes from position left to position right (1-indexed, inclusive) in one pass. Write swapPairs(head): swap every two adjacent nodes by relinking nodes (not by changing values).`,
    ref: R`function reverseKGroup(head, k) {
  let probe = head;
  for (let i = 0; i < k; i++) {
    if (!probe) return head;
    probe = probe.next;
  }
  let prev = reverseKGroup(probe, k);
  let cur = head;
  for (let i = 0; i < k; i++) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

function reverseBetween(head, left, right) {
  const dummy = { val: 0, next: head };
  let prev = dummy;
  for (let i = 0; i < left - 1; i++) prev = prev.next;
  const cur = prev.next;
  for (let i = 0; i < right - left; i++) {
    const move = cur.next;
    cur.next = move.next;
    move.next = prev.next;
    prev.next = move;
  }
  return dummy.next;
}

function swapPairs(head) {
  const dummy = { val: 0, next: head };
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next;
    const b = a.next;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}` },
]);
