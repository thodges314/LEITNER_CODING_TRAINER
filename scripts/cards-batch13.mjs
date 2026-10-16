// One-off: writes the hand-authored batch-13 algorithm cards into scripts/cards/ and scripts/difficulty.json.
// Test cases live (hand-written) in scripts/testcases/part13.mjs. Run: node scripts/cards-batch13.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'cards');
const diffFile = path.join(here, 'difficulty.json');
const ladder = JSON.parse(fs.readFileSync(diffFile, 'utf8'));

const cards = [
  {
    id: 'reverse-linked-list',
    title: 'Linked List: Reverse and Middle',
    tags: ['linked-list', 'pointers', 'basics'],
    difficulty: 1,
    concept: 'linked-lists',
    prompt:
      "Nodes look like { val, next } (the last node has next: null). Write reverseList(head) that reverses the list in place and returns the new head (null for an empty list), and middleNode(head) that returns the middle node (the second of the two middles when the length is even; null for an empty list). Use the slow/fast pointer technique for middleNode.",
    ref: `function reverseList(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
  },
  {
    id: 'linked-list-cycle-merge',
    title: 'Linked List: Cycle Detection and Merge Sorted Lists',
    tags: ['linked-list', 'two-pointer', 'floyd'],
    difficulty: 2,
    concept: 'linked-lists',
    prompt:
      "Nodes look like { val, next }. Write hasCycle(head) using Floyd's tortoise and hare (O(1) extra space; true when some node can be reached twice by following next), and mergeTwoLists(a, b) that merges two sorted lists into one sorted list by relinking nodes (no new nodes) and returns the head. Either input may be null; when values tie, take from a first.",
    ref: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function mergeTwoLists(a, b) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
  },
  {
    id: 'min-stack',
    title: 'MinStack and Queue From Two Stacks',
    tags: ['stack', 'queue', 'design', 'class'],
    difficulty: 2,
    concept: 'stack',
    prompt:
      "Implement class MinStack with push(x), pop() (returns the removed value, undefined when empty), top() (undefined when empty), size() and getMin() (smallest value currently in the stack, undefined when empty), all in O(1). Also implement class QueueFromStacks with enqueue(x), dequeue() (undefined when empty), peek() and size(), using only two arrays that you treat strictly as stacks (push/pop at the end only).",
    ref: `class MinStack {
  constructor() {
    this.items = [];
    this.mins = [];
  }
  push(x) {
    this.items.push(x);
    const min = this.mins.length ? Math.min(x, this.mins[this.mins.length - 1]) : x;
    this.mins.push(min);
  }
  pop() {
    this.mins.pop();
    return this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1];
  }
  size() {
    return this.items.length;
  }
  getMin() {
    return this.mins[this.mins.length - 1];
  }
}

class QueueFromStacks {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  _shift() {
    if (!this.outbox.length) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  enqueue(x) {
    this.inbox.push(x);
  }
  dequeue() {
    this._shift();
    return this.outbox.pop();
  }
  peek() {
    this._shift();
    return this.outbox[this.outbox.length - 1];
  }
  size() {
    return this.inbox.length + this.outbox.length;
  }
}`,
  },
  {
    id: 'anagram-palindrome',
    title: 'Strings: Anagram, Palindrome, Common Prefix',
    tags: ['string', 'hash-map', 'basics'],
    difficulty: 1,
    concept: 'strings',
    prompt:
      "Write isAnagram(a, b) (same letters with the same counts; case-sensitive, spaces count), isPalindrome(s) (ignore case and every non-alphanumeric character; an empty string is a palindrome) and longestCommonPrefix(words) (the longest string that starts every word; '' for an empty array).",
    ref: `function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const counts = {};
  for (const ch of a) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of b) {
    if (!counts[ch]) return false;
    counts[ch]--;
  }
  return true;
}

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let i = 0;
  let j = clean.length - 1;
  while (i < j) {
    if (clean[i] !== clean[j]) return false;
    i++;
    j--;
  }
  return true;
}

function longestCommonPrefix(words) {
  if (!words.length) return '';
  let prefix = words[0];
  for (const w of words) {
    while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}`,
  },
  {
    id: 'group-anagrams-top-k',
    title: 'Hash Map: Group Anagrams and Top K Frequent',
    tags: ['hash-map', 'sorting', 'frequency'],
    difficulty: 2,
    concept: 'hashing',
    prompt:
      "Write groupAnagrams(words) returning an array of groups (arrays) of words that are anagrams of each other; keep the first-seen order of groups and of the words inside each group. Write topKFrequent(nums, k) returning the k most frequent numbers, most frequent first; break ties by smaller number first.",
    ref: `function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = w.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

function topKFrequent(nums, k) {
  const counts = new Map();
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, k)
    .map(([n]) => n);
}`,
  },
  {
    id: 'climb-stairs-fib-dp',
    title: 'Dynamic Programming: Fibonacci and Climbing Stairs',
    tags: ['dp', 'memoization', 'recursion', 'basics'],
    difficulty: 1,
    concept: 'dp',
    prompt:
      "Write fib(n) (fib(0) = 0, fib(1) = 1) so that fib(50) returns instantly (memoize or iterate; never plain double recursion), and climbStairs(n): the number of distinct ways to climb n steps taking 1 or 2 steps at a time (climbStairs(0) = 1).",
    ref: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

function climbStairs(n) {
  let prev = 1;
  let cur = 1;
  for (let i = 2; i <= n; i++) {
    [prev, cur] = [cur, prev + cur];
  }
  return cur;
}`,
  },
  {
    id: 'coin-change-dp',
    title: 'Dynamic Programming: Coin Change',
    tags: ['dp', 'bottom-up', 'array'],
    difficulty: 3,
    concept: 'dp',
    prompt:
      "Write coinChange(coins, amount): the fewest coins (unlimited supply of each denomination) needed to make amount, or -1 when it is impossible. amount 0 needs 0 coins. Also write countWays(coins, amount): the number of distinct combinations (order does not matter) that make amount; countWays(coins, 0) is 1.",
    ref: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

function countWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) dp[a] += dp[a - coin];
  }
  return dp[amount];
}`,
  },
  {
    id: 'lis-house-robber-dp',
    title: 'Dynamic Programming: House Robber and Longest Increasing Subsequence',
    tags: ['dp', 'subsequence', 'array'],
    difficulty: 4,
    concept: 'dp',
    prompt:
      "Write rob(nums): the maximum sum of values you can take from an array when no two chosen elements are adjacent (0 for an empty array). Write lengthOfLIS(nums): the length of the longest strictly increasing subsequence (not necessarily contiguous; 0 for an empty array). An O(n^2) lengthOfLIS is fine.",
    ref: `function rob(nums) {
  let take = 0;
  let skip = 0;
  for (const n of nums) {
    [take, skip] = [skip + n, Math.max(take, skip)];
  }
  return Math.max(take, skip);
}

function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}`,
  },
  {
    id: 'bst-search-insert',
    title: 'Binary Search Tree: Search, Insert, Min/Max',
    tags: ['tree', 'bst', 'recursion', 'basics'],
    difficulty: 2,
    concept: 'bst',
    prompt:
      "Nodes look like { val, left, right }. For a binary search tree (left < node < right, no duplicates): write searchBST(root, val) returning the node holding val or null; insertBST(root, val) inserting val and returning the root (a new node when root is null; an existing value is left alone); findMin(root) and findMax(root) returning the smallest/largest value (undefined for an empty tree).",
    ref: `function searchBST(root, val) {
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
}`,
  },
  {
    id: 'bst-validate-lca-invert',
    title: 'Binary Tree: Validate BST, Invert, Lowest Common Ancestor',
    tags: ['tree', 'bst', 'recursion', 'lca'],
    difficulty: 3,
    concept: 'bst',
    prompt:
      "Nodes look like { val, left, right }. Write isValidBST(root) (strict: every left-subtree value < node < every right-subtree value, not just the direct children; an empty tree is valid), invertTree(root) that mirrors the tree in place and returns the root, and lowestCommonAncestor(root, p, q) for a BST where p and q are values present in the tree; return the value of their lowest common ancestor (a node may be its own ancestor).",
    ref: `function isValidBST(root, lo = -Infinity, hi = Infinity) {
  if (!root) return true;
  if (root.val <= lo || root.val >= hi) return false;
  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);
}

function invertTree(root) {
  if (!root) return root;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}

function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node.val;
  }
  return undefined;
}`,
  },
  {
    id: 'flood-fill-islands',
    title: 'Grid DFS: Flood Fill and Number of Islands',
    tags: ['graph', 'grid', 'dfs', 'bfs'],
    difficulty: 3,
    concept: 'graphs',
    prompt:
      "Write floodFill(image, sr, sc, color): replace the 4-directionally connected region of equal values that contains (sr, sc) with color and return the image (if the start cell already has color, change nothing). Write numIslands(grid): the number of 4-directionally connected groups of '1' cells in a grid of '0'/'1' strings (an empty grid has 0). numIslands must not mutate the caller's grid.",
    ref: `function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) return image;
  const fill = (r, c) => {
    if (r < 0 || c < 0 || r >= image.length || c >= image[0].length) return;
    if (image[r][c] !== original) return;
    image[r][c] = color;
    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
  };
  fill(sr, sc);
  return image;
}

function numIslands(grid) {
  const seen = new Set();
  let count = 0;
  const visit = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
    if (grid[r][c] !== '1' || seen.has(r + ',' + c)) return;
    seen.add(r + ',' + c);
    visit(r + 1, c);
    visit(r - 1, c);
    visit(r, c + 1);
    visit(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1' && !seen.has(r + ',' + c)) {
        count++;
        visit(r, c);
      }
    }
  }
  return count;
}`,
  },
  {
    id: 'course-schedule-topo',
    title: 'Graph: Course Schedule (Topological Sort)',
    tags: ['graph', 'topological-sort', 'bfs', 'cycle'],
    difficulty: 4,
    concept: 'graphs',
    prompt:
      "There are numCourses courses labelled 0..n-1. prerequisites is an array of [course, prereq] pairs meaning prereq must be taken first. Write canFinish(numCourses, prerequisites): true when every course can be finished (the graph has no cycle). Write findOrder(numCourses, prerequisites): an order in which to take all courses, or [] if impossible; use Kahn's algorithm (queue of zero in-degree nodes, taking the smallest label first when several are available so the answer is deterministic).",
    ref: `function buildGraph(n, prerequisites) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indegree[course]++;
  }
  return { adj, indegree };
}

function findOrder(numCourses, prerequisites) {
  const { adj, indegree } = buildGraph(numCourses, prerequisites);
  const ready = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) ready.push(i);
  const order = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const node = ready.shift();
    order.push(node);
    for (const next of adj[node]) {
      if (--indegree[next] === 0) ready.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}

function canFinish(numCourses, prerequisites) {
  return findOrder(numCourses, prerequisites).length === numCourses;
}`,
  },
  {
    id: 'trie-prefix-tree',
    title: 'Trie: Insert, Search, Prefix',
    tags: ['trie', 'class', 'string', 'design'],
    difficulty: 3,
    concept: 'trie',
    prompt:
      "Implement class Trie with insert(word), search(word) (true only for a complete inserted word), startsWith(prefix) (true when any inserted word begins with prefix; the empty prefix is true once a word exists) and wordsWithPrefix(prefix) returning every inserted word that starts with prefix in alphabetical order (no duplicates, [] when none).",
    ref: `class Trie {
  constructor() {
    this.root = { children: {}, end: false };
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  _find(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children[ch];
      if (!node) return null;
    }
    return node;
  }
  search(word) {
    const node = this._find(word);
    return !!node && node.end;
  }
  startsWith(prefix) {
    const node = this._find(prefix);
    if (!node) return false;
    return node.end || Object.keys(node.children).length > 0;
  }
  wordsWithPrefix(prefix) {
    const start = this._find(prefix);
    const out = [];
    const walk = (node, path) => {
      if (node.end) out.push(path);
      for (const ch of Object.keys(node.children).sort()) walk(node.children[ch], path + ch);
    };
    if (start) walk(start, prefix);
    return out;
  }
}`,
  },
  {
    id: 'min-heap-class',
    title: 'Heap: MinHeap From Scratch',
    tags: ['heap', 'priority-queue', 'class', 'array'],
    difficulty: 3,
    concept: 'heap',
    prompt:
      "Implement class MinHeap backed by an array: push(x), pop() (removes and returns the smallest value, undefined when empty), peek() (smallest value without removing, undefined when empty) and size(). push/pop must be O(log n) using sift-up/sift-down on the array (do not sort on every push). Also write kSmallest(nums, k) returning the k smallest numbers in ascending order using your MinHeap.",
    ref: `class MinHeap {
  constructor() {
    this.h = [];
  }
  size() {
    return this.h.length;
  }
  peek() {
    return this.h[0];
  }
  push(x) {
    const h = this.h;
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (h[parent] <= h[i]) break;
      [h[parent], h[i]] = [h[i], h[parent]];
      i = parent;
    }
  }
  pop() {
    const h = this.h;
    if (!h.length) return undefined;
    const top = h[0];
    const last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let small = i;
        if (l < h.length && h[l] < h[small]) small = l;
        if (r < h.length && h[r] < h[small]) small = r;
        if (small === i) break;
        [h[small], h[i]] = [h[i], h[small]];
        i = small;
      }
    }
    return top;
  }
}

function kSmallest(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) heap.push(n);
  const out = [];
  while (out.length < k && heap.size()) out.push(heap.pop());
  return out;
}`,
  },
  {
    id: 'merge-sort-quick-sort',
    title: 'Sorting: Merge Sort and Quick Sort',
    tags: ['sorting', 'recursion', 'divide-and-conquer'],
    difficulty: 3,
    concept: 'sorting',
    prompt:
      "Write mergeSort(arr) and quickSort(arr), each returning a NEW array sorted ascending by number and leaving the input untouched. mergeSort must be stable and use a merge helper over two sorted halves; quickSort picks a pivot and partitions into less / equal / greater parts. Do not use Array.prototype.sort. Both handle empty and one-element arrays and duplicates.",
    ref: `function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const mid = arr.length >> 1;
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function quickSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const pivot = arr[arr.length >> 1];
  const less = arr.filter((x) => x < pivot);
  const equal = arr.filter((x) => x === pivot);
  const greater = arr.filter((x) => x > pivot);
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}`,
  },
  {
    id: 'permutations-subsets-backtracking',
    title: 'Backtracking: Subsets, Permutations, Parentheses',
    tags: ['backtracking', 'recursion', 'combinatorics'],
    difficulty: 3,
    concept: 'backtracking',
    prompt:
      "Write subsets(nums) returning all subsets (the power set) of an array of distinct numbers, permute(nums) returning all orderings of distinct numbers, and generateParenthesis(n) returning every well-formed string of n pairs of parentheses. Return [[]] for subsets([]), [[]] for permute([]) and [''] for generateParenthesis(0). Any order of results is accepted, but each result must appear exactly once.",
    ref: `function subsets(nums) {
  const out = [];
  const path = [];
  const go = (start) => {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  };
  go(0);
  return out;
}

function permute(nums) {
  const out = [];
  const used = new Array(nums.length).fill(false);
  const path = [];
  const go = () => {
    if (path.length === nums.length) {
      out.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  };
  go();
  return out;
}

function generateParenthesis(n) {
  const out = [];
  const go = (s, open, close) => {
    if (s.length === 2 * n) {
      out.push(s);
      return;
    }
    if (open < n) go(s + '(', open + 1, close);
    if (close < open) go(s + ')', open, close + 1);
  };
  go('', 0, 0);
  return out;
}`,
  },
  {
    id: 'binary-search-variants',
    title: 'Binary Search: Classic, Lower Bound, Integer Square Root',
    tags: ['binary-search', 'array', 'basics'],
    difficulty: 2,
    concept: 'binary-search',
    prompt:
      "Write binarySearch(sorted, target) returning the index of target in an ascending array or -1; lowerBound(sorted, target) returning the first index whose value is >= target (sorted.length if none; works with duplicates); and mySqrt(x) returning the floor of the square root of a non-negative integer using binary search (no Math.sqrt).",
    ref: `function binarySearch(sorted, target) {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

function lowerBound(sorted, target) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function mySqrt(x) {
  let lo = 0;
  let hi = x;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (mid * mid <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}`,
  },
  {
    id: 'search-rotated-array',
    title: 'Binary Search: Rotated Sorted Array',
    tags: ['binary-search', 'array', 'rotated'],
    difficulty: 4,
    concept: 'binary-search',
    prompt:
      "A sorted ascending array of distinct numbers was rotated at an unknown pivot (e.g. [4,5,6,7,0,1,2]). Write findMin(nums) returning the smallest value (undefined for an empty array) and searchRotated(nums, target) returning the index of target or -1, both in O(log n).",
    ref: `function findMin(nums) {
  if (!nums.length) return undefined;
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}

function searchRotated(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
  },
  {
    id: 'matrix-rotate-spiral',
    title: 'Matrix: Rotate 90 Degrees and Spiral Order',
    tags: ['matrix', '2d-array', 'simulation'],
    difficulty: 3,
    concept: 'matrix',
    prompt:
      "Write rotate90(matrix) returning a NEW n x m matrix rotated 90 degrees clockwise (rows become columns; an empty matrix gives []), transpose(matrix) returning the transpose, and spiralOrder(matrix) returning the elements in clockwise spiral order starting at the top-left (works for non-square matrices; [] for an empty matrix).",
    ref: `function transpose(matrix) {
  if (!matrix.length) return [];
  return matrix[0].map((_, c) => matrix.map((row) => row[c]));
}

function rotate90(matrix) {
  return transpose(matrix).map((row) => row.reverse());
}

function spiralOrder(matrix) {
  if (!matrix.length) return [];
  const out = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}`,
  },
  {
    id: 'kadane-prefix-sum',
    title: 'Arrays: Maximum Subarray and Prefix Sums',
    tags: ['array', 'dp', 'prefix-sum', 'kadane'],
    difficulty: 2,
    concept: 'arrays',
    prompt:
      "Write maxSubarray(nums): the largest sum of any non-empty contiguous subarray (Kadane's algorithm; works when every number is negative; 0 for an empty array). Write productExceptSelf(nums): an array where element i is the product of all other elements, without using division. Write subarraySum(nums, k): the number of contiguous subarrays whose sum equals k (prefix sums + hash map).",
    ref: `function maxSubarray(nums) {
  if (!nums.length) return 0;
  let best = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}

function productExceptSelf(nums) {
  const out = new Array(nums.length).fill(1);
  let left = 1;
  for (let i = 0; i < nums.length; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let sum = 0;
  let count = 0;
  for (const n of nums) {
    sum += n;
    count += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}`,
  },
];

for (const c of cards) {
  fs.writeFileSync(
    path.join(dir, `${c.id}.meta.json`),
    JSON.stringify({ track: 'algorithms', title: c.title, tags: c.tags }, null, 2) + '\n'
  );
  fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
  ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
}
fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
console.log(`wrote ${cards.length} cards`);
