// One-off: writes the hand-authored batch-16 "Algorithms round 2, part A" cards (bits, monotonic stack, 2D DP,
// greedy, two pointers) into scripts/cards/, scripts/difficulty.json and scripts/complexity-cache.json.
// Cases are in scripts/testcases/part16.mjs. Run: node scripts/cards-batch16.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'cards');
const diffFile = path.join(here, 'difficulty.json');
const cacheFile = path.join(here, 'complexity-cache.json');
const ladder = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const R = String.raw;

const cards = [
  {
    id: 'bit-basics', title: 'Bit Manipulation: Single Number, Count Bits, Power of Two', tags: ['bit-manipulation', 'xor', 'basics'],
    difficulty: 1, concept: 'bits',
    cx: ['O(n) / O(bits) / O(1)', 'O(1)', 'singleNumber is one XOR pass, countOneBits loops once per set bit and isPowerOfTwo is a single bitwise test, all with constant extra space.'],
    prompt: 'Write singleNumber(nums): every number appears twice except one; return that one using XOR (O(1) extra space). Write countOneBits(n): the number of 1 bits in the binary form of a non-negative integer up to 2^32 - 1 (use n & (n - 1) to clear the lowest set bit; countOneBits(0) is 0). Write isPowerOfTwo(n): true for 1, 2, 4, 8, ... and false for 0 and negative numbers, using a bitwise test (no loops, no Math.log).',
    ref: R`function singleNumber(nums) {
  let result = 0;
  for (const n of nums) result ^= n;
  return result;
}

function countOneBits(n) {
  n = n >>> 0;
  let count = 0;
  while (n) {
    n = (n & (n - 1)) >>> 0;
    count++;
  }
  return count;
}

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
  },
  {
    id: 'bit-tricks-more', title: 'Bit Manipulation: Missing Number, Hamming, Counting Bits, Bit Flags', tags: ['bit-manipulation', 'xor', 'dp'],
    difficulty: 2, concept: 'bits',
    cx: ['O(n)', 'O(n)', 'Each function makes one pass over the input; countBitsUpTo stores an array of n + 1 counts built from earlier entries.'],
    prompt: 'Write missingNumber(nums): the array holds n distinct numbers from 0..n, return the missing one using XOR of indices and values. Write hammingDistance(a, b): the number of bit positions where two non-negative integers differ. Write countBitsUpTo(n): an array where entry i is the number of 1 bits of i for i = 0..n (use bits[i] = bits[i >> 1] + (i & 1)). Write getBit(n, i) (0 or 1), setBit(n, i), clearBit(n, i) for bit position i (0 is the least significant).',
    ref: R`function missingNumber(nums) {
  let x = nums.length;
  for (let i = 0; i < nums.length; i++) x ^= i ^ nums[i];
  return x;
}

function hammingDistance(a, b) {
  let diff = a ^ b;
  let count = 0;
  while (diff) {
    diff &= diff - 1;
    count++;
  }
  return count;
}

function countBitsUpTo(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}

function getBit(n, i) {
  return (n >> i) & 1;
}

function setBit(n, i) {
  return n | (1 << i);
}

function clearBit(n, i) {
  return n & ~(1 << i);
}`,
  },
  {
    id: 'monotonic-stack-basics', title: 'Monotonic Stack: Next Greater Element and Daily Temperatures', tags: ['stack', 'monotonic-stack', 'array'],
    difficulty: 2, concept: 'monotonic-stack',
    cx: ['O(n)', 'O(n)', 'Each index is pushed and popped at most once, and the stack plus result arrays hold up to n entries.'],
    prompt: 'Write nextGreaterElement(nums): for each element the first STRICTLY greater value to its right, or -1 if none (nextGreaterElement([4, 5, 2, 10]) is [5, 10, 10, -1]). Write dailyTemperatures(temps): for each day the number of days until a warmer (strictly higher) temperature, or 0 if there is none. Use a stack of indices that stays in decreasing order of value; both must run in O(n).',
    ref: R`function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return result;
}

function dailyTemperatures(temps) {
  const result = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      result[j] = i - j;
    }
    stack.push(i);
  }
  return result;
}`,
  },
  {
    id: 'monotonic-stack-histogram', title: 'Monotonic Stack: Stock Span and Largest Rectangle in Histogram', tags: ['stack', 'monotonic-stack', 'histogram'],
    difficulty: 4, concept: 'monotonic-stack',
    cx: ['O(n)', 'O(n)', 'Every bar is pushed and popped at most once, so both functions are linear with a stack of up to n indices.'],
    prompt: 'Write stockSpan(prices): for each day the number of consecutive days ending today (including today) whose price is <= today\'s price (stockSpan([100, 80, 60, 70]) is [1, 1, 1, 2]). Write largestRectangleArea(heights): the area of the largest rectangle that fits inside a histogram of bars with width 1 (0 for an empty histogram). Use a monotonic stack so that both run in O(n).',
    ref: R`function stockSpan(prices) {
  const spans = [];
  const stack = [];
  for (let i = 0; i < prices.length; i++) {
    while (stack.length && prices[stack[stack.length - 1]] <= prices[i]) stack.pop();
    spans.push(stack.length ? i - stack[stack.length - 1] : i + 1);
    stack.push(i);
  }
  return spans;
}

function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}`,
  },
  {
    id: 'unique-paths-grid', title: '2D DP: Unique Paths and Unique Paths With Obstacles', tags: ['dp', '2d-dp', 'grid', 'combinatorics'],
    difficulty: 2, concept: 'dp2d',
    cx: ['O(m × n)', 'O(n)', 'Every cell is computed once from its top and left neighbours, keeping only one row of counts.'],
    prompt: 'A robot starts at the top-left of an m x n grid and can only move right or down. Write uniquePaths(m, n): the number of different paths to the bottom-right corner. Write uniquePathsWithObstacles(grid): the same count when grid is an array of rows where 1 is an obstacle and 0 is free (obstacles cannot be entered; if the start or end is blocked the answer is 0).',
    ref: R`function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  }
  return row[n - 1];
}

function uniquePathsWithObstacles(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const row = new Array(cols).fill(0);
  row[0] = grid[0][0] === 1 ? 0 : 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) row[c] = 0;
      else if (c > 0) row[c] += row[c - 1];
    }
  }
  return row[cols - 1];
}`,
  },
  {
    id: 'min-path-sum-grid', title: '2D DP: Minimum Path Sum and Triangle', tags: ['dp', '2d-dp', 'grid', 'triangle'],
    difficulty: 3, concept: 'dp2d',
    cx: ['O(m × n)', 'O(n)', 'Each grid or triangle cell is visited once and only a single row of best-so-far sums is stored.'],
    prompt: 'Write minPathSum(grid): the smallest sum of numbers along a path from the top-left to the bottom-right of a grid of non-negative numbers, moving only right or down. Write minimumTotal(triangle): for a triangle given as an array of rows (row i has i + 1 numbers), the smallest path sum from the top to the bottom where each step moves to an adjacent number on the row below (index j or j + 1).',
    ref: R`function minPathSum(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = new Array(cols).fill(Infinity);
  dp[0] = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const best = Math.min(dp[c], c > 0 ? dp[c - 1] : Infinity);
      dp[c] = best + grid[r][c];
    }
  }
  return dp[cols - 1];
}

function minimumTotal(triangle) {
  const dp = triangle[triangle.length - 1].slice();
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      dp[c] = triangle[r][c] + Math.min(dp[c], dp[c + 1]);
    }
  }
  return dp[0];
}`,
  },
  {
    id: 'lcs-subsequence', title: '2D DP: Longest Common Subsequence and isSubsequence', tags: ['dp', '2d-dp', 'string', 'subsequence'],
    difficulty: 3, concept: 'dp2d',
    cx: ['O(m × n)', 'O(m × n)', 'The LCS table has (m + 1) x (n + 1) cells each filled once; isSubsequence is a single linear two-pointer pass.'],
    prompt: 'Write longestCommonSubsequence(a, b): the LENGTH of the longest subsequence (characters in order, not necessarily adjacent) that appears in both strings, using a 2D DP table (0 if either string is empty). Write isSubsequence(s, t): true when s can be formed by deleting characters from t without reordering (the empty string is a subsequence of everything), using two pointers.',
    ref: R`function longestCommonSubsequence(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isSubsequence(s, t) {
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++;
  }
  return i === s.length;
}`,
  },
  {
    id: 'edit-distance-knapsack', title: '2D DP: Edit Distance and 0/1 Knapsack', tags: ['dp', '2d-dp', 'string', 'knapsack'],
    difficulty: 4, concept: 'dp2d',
    cx: ['O(m × n) / O(items × capacity)', 'O(m × n) / O(capacity)', 'Edit distance fills an (m + 1) x (n + 1) table; the knapsack tries each item against every capacity using a single capacity-sized array.'],
    prompt: 'Write editDistance(a, b): the minimum number of single-character insertions, deletions and substitutions needed to turn a into b (editDistance("horse", "ros") is 3). Write knapsack(weights, values, capacity): the maximum total value of items whose total weight is at most capacity, where each item can be taken at most once (0/1 knapsack; 0 when nothing fits).',
    ref: R`function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}`,
  },
  {
    id: 'jump-game-greedy', title: 'Greedy: Jump Game and Minimum Jumps', tags: ['greedy', 'array', 'reachability'],
    difficulty: 2, concept: 'greedy',
    cx: ['O(n)', 'O(1)', 'A single left-to-right pass tracks the farthest reachable index (and the current jump boundary) with constant extra state.'],
    prompt: 'Each number in nums is the maximum jump length from that index. Write canJump(nums): can you reach the last index starting from index 0? (Greedy: track the farthest reachable index; a single element is always reachable.) Write minJumps(nums): the minimum number of jumps to reach the last index, assuming it is reachable (0 for a single element).',
    ref: R`function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

function minJumps(nums) {
  let jumps = 0;
  let end = 0;
  let farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === end) {
      jumps++;
      end = farthest;
    }
  }
  return jumps;
}`,
  },
  {
    id: 'container-water-two-pointer', title: 'Two Pointers: Container With Most Water and Trapping Rain Water', tags: ['two-pointer', 'greedy', 'array'],
    difficulty: 3, concept: 'two-pointer',
    cx: ['O(n)', 'O(1)', 'Two pointers walk inward once each, always moving the shorter side, with constant extra variables.'],
    prompt: 'Write maxArea(heights): choose two vertical lines (index i < j) to form a container; its water area is min(heights[i], heights[j]) * (j - i). Return the maximum area (0 if fewer than two lines), in O(n) with two pointers moving inward from both ends. Write trap(height): given the heights of unit-width bars, the total units of rain water trapped between them (two pointers with leftMax/rightMax; 0 for fewer than three bars).',
    ref: R`function maxArea(heights) {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    const area = Math.min(heights[left], heights[right]) * (right - left);
    best = Math.max(best, area);
    if (heights[left] < heights[right]) left++;
    else right--;
  }
  return best;
}

function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
  },
  {
    id: 'greedy-intervals-circuit', title: 'Greedy: Non-Overlapping Intervals, Meetings, Gas Station', tags: ['greedy', 'intervals', 'sorting'],
    difficulty: 3, concept: 'greedy',
    cx: ['O(n log n) / O(n)', 'O(n) / O(1)', 'The interval functions sort a copy and scan once; the gas station scan is a single pass with two running totals.'],
    prompt: 'Intervals are [start, end] pairs where an interval that ends exactly when another starts does NOT overlap. Write eraseOverlapIntervals(intervals): the minimum number of intervals to remove so the rest do not overlap (greedy: sort by end, keep the earliest-ending; 0 for []). Write canAttendMeetings(intervals): true when no two intervals overlap ([] is true). Do not mutate the input. Write canCompleteCircuit(gas, cost): stations are in a circle, gas[i] is fuel gained at station i and cost[i] the fuel needed to reach the next one; return the index of the station to start at so you can complete the loop (the answer is unique when it exists), or -1.',
    ref: R`function eraseOverlapIntervals(intervals) {
  if (!intervals.length) return 0;
  const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);
  let keep = 1;
  let end = sorted[0][1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] >= end) {
      keep++;
      end = sorted[i][1];
    }
  }
  return intervals.length - keep;
}

function canAttendMeetings(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false;
  }
  return true;
}

function canCompleteCircuit(gas, cost) {
  let total = 0;
  let tank = 0;
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}`,
  },
];

for (const c of cards) {
  fs.writeFileSync(path.join(dir, `${c.id}.meta.json`), JSON.stringify({ track: 'algorithms', title: c.title, tags: c.tags }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.prompt.txt`), c.prompt + '\n');
  fs.writeFileSync(path.join(dir, `${c.id}.ref.js`), c.ref + '\n');
  ladder[c.id] = { difficulty: c.difficulty, concept: c.concept };
  cache[c.id] = { targetTime: c.cx[0], targetSpace: c.cx[1], complexityExplanation: c.cx[2] };
}
fs.writeFileSync(diffFile, JSON.stringify(ladder, null, 1) + '\n');
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
console.log(`wrote ${cards.length} cards`);
