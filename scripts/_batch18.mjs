import { writeCards, R } from './_author.mjs';

writeCards([
  {
    id: 'longest-substring-window', title: 'Sliding Window: Longest Substring Without Repeats and K Distinct', tags: ['sliding-window', 'string', 'hash-map'],
    difficulty: 2, concept: 'sliding-window',
    cx: ['O(n)', 'O(k)', 'Each index enters and leaves the window at most once, with a map bounded by the alphabet or k.'],
    prompt: 'Write lengthOfLongestSubstring(s): the length of the longest substring with no repeated character (0 for an empty string), using a sliding window and a map of last-seen indices. Write longestKDistinct(s, k): the length of the longest substring containing at most k distinct characters (0 when k is 0 or s is empty).',
    ref: R`function lengthOfLongestSubstring(s) {
  const last = new Map();
  let start = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (last.has(ch) && last.get(ch) >= start) start = last.get(ch) + 1;
    last.set(ch, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}

function longestKDistinct(s, k) {
  if (k === 0) return 0;
  const counts = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) || 0) + 1);
    while (counts.size > k) {
      const remaining = counts.get(s[left]) - 1;
      if (remaining === 0) counts.delete(s[left]);
      else counts.set(s[left], remaining);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  },
  {
    id: 'min-window-permutation', title: 'Sliding Window: Minimum Window Substring, Permutation, Anagram Indices', tags: ['sliding-window', 'string', 'frequency'],
    difficulty: 3, concept: 'sliding-window',
    cx: ['O(n + m)', 'O(m)', 'The window moves across s once while a frequency map of the target characters tracks what is still missing.'],
    prompt: "Write minWindow(s, t): the smallest substring of s that contains every character of t with at least its multiplicity (the leftmost one on ties); '' if none exists or t is empty. Write checkInclusion(s1, s2): true when s2 contains some permutation of s1 as a contiguous substring. Write findAnagrams(s, p): the array of start indices (ascending) of every substring of s that is an anagram of p ([] when p is longer than s).",
    ref: R`function minWindow(s, t) {
  if (!t.length || t.length > s.length) return '';
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  let missing = t.length;
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      if (need.get(ch) > 0) missing--;
      need.set(ch, need.get(ch) - 1);
    }
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const lc = s[left];
      if (need.has(lc)) {
        need.set(lc, need.get(lc) + 1);
        if (need.get(lc) > 0) missing++;
      }
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}

function findAnagrams(s, p) {
  const out = [];
  if (p.length > s.length) return out;
  const need = {};
  for (const ch of p) need[ch] = (need[ch] || 0) + 1;
  let missing = p.length;
  for (let i = 0; i < s.length; i++) {
    if (need[s[i]] !== undefined) {
      if (need[s[i]] > 0) missing--;
      need[s[i]]--;
    }
    if (i >= p.length) {
      const gone = s[i - p.length];
      if (need[gone] !== undefined) {
        need[gone]++;
        if (need[gone] > 0) missing++;
      }
    }
    if (missing === 0) out.push(i - p.length + 1);
  }
  return out;
}

function checkInclusion(s1, s2) {
  return findAnagrams(s2, s1).length > 0;
}`,
  },
  {
    id: 'window-replacement-ones', title: 'Sliding Window: Character Replacement, Longest Ones, Shortest Subarray', tags: ['sliding-window', 'array', 'two-pointer'],
    difficulty: 3, concept: 'sliding-window',
    cx: ['O(n)', 'O(1)', 'Both window edges only move forward, and the state is a few counters (or a small frequency table).'],
    prompt: 'Write characterReplacement(s, k): the length of the longest substring that can be turned into one repeated letter by replacing at most k characters (0 for an empty string). Write longestOnes(nums, k): the longest run of 1s in a 0/1 array if you may flip at most k zeros. Write minSubArrayLen(target, nums): the smallest length of a contiguous subarray of positive numbers whose sum is >= target, or 0 if none.',
    ref: R`function characterReplacement(s, k) {
  const counts = {};
  let left = 0;
  let maxCount = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    counts[s[right]] = (counts[s[right]] || 0) + 1;
    maxCount = Math.max(maxCount, counts[s[right]]);
    while (right - left + 1 - maxCount > k) {
      counts[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}`,
  },
  {
    id: 'strings-basics', title: 'Strings: Reverse Words, Run-Length Encoding, Rotation', tags: ['string', 'basics', 'encoding'],
    difficulty: 1, concept: 'strings',
    cx: ['O(n)', 'O(n)', 'Each function scans the string once and builds an output proportional to its length.'],
    prompt: "Write reverseWords(s): the words of s in reverse order joined by single spaces, ignoring leading, trailing and repeated spaces ('  hello   world ' becomes 'world hello'; '' stays ''). Write runLengthEncode(s) ('aabccc' becomes 'a2b1c3', every run gets its count, '' stays '') and runLengthDecode(s) (the inverse; counts can have several digits, 'x12' is twelve x's). Write isRotation(a, b): true when b is a rotation of a (same length and b appears in a + a; two empty strings are rotations).",
    ref: R`function reverseWords(s) {
  return s.split(' ').filter(Boolean).reverse().join(' ');
}

function runLengthEncode(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out += s[i] + (j - i);
    i = j;
  }
  return out;
}

function runLengthDecode(s) {
  return s.replace(/(\D)(\d+)/g, (_, ch, n) => ch.repeat(Number(n)));
}

function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}`,
  },
  {
    id: 'longest-palindrome-substring', title: 'Strings: Longest Palindromic Substring and Count', tags: ['string', 'palindrome', 'expand-around-center'],
    difficulty: 3, concept: 'strings',
    cx: ['O(n²)', 'O(1)', 'Expanding around each of the 2n - 1 centers costs up to n steps each, with only index variables stored.'],
    prompt: "Write longestPalindrome(s): the longest palindromic substring (the leftmost one when several have the same length; '' for an empty string) using expand-around-center. Write countPalindromicSubstrings(s): the number of palindromic substrings, counting each position range separately ('aaa' has 6; '' has 0).",
    ref: R`function expand(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--;
    right++;
  }
  return [left + 1, right];
}

function longestPalindrome(s) {
  let bestStart = 0;
  let bestEnd = 0;
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expand(s, i, i), expand(s, i, i + 1)]) {
      if (b - a > bestEnd - bestStart) {
        bestStart = a;
        bestEnd = b;
      }
    }
  }
  return s.slice(bestStart, bestEnd);
}

function countPalindromicSubstrings(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    for (const [a, b] of [expand(s, i, i), expand(s, i, i + 1)]) {
      count += b - a > 0 ? Math.ceil((b - a) / 2) : 0;
    }
  }
  return count;
}`,
  },
  {
    id: 'string-arithmetic', title: 'Strings: Add Binary, Add Big Numbers, Multiply Strings', tags: ['string', 'math', 'carry', 'big-number'],
    difficulty: 3, concept: 'strings',
    cx: ['O(n + m) / O(n × m)', 'O(n + m)', 'Addition walks both strings once with a carry; schoolbook multiplication fills an n + m digit array.'],
    prompt: "Do not use BigInt or Number() on the whole strings. Write addBinary(a, b) for two binary strings ('11' + '1' is '100'), addStrings(a, b) for two non-negative decimal strings of any length ('999' + '1' is '1000'), and multiplyStrings(a, b) for two non-negative decimal strings ('123' * '456' is '56088'; any factor '0' gives '0'). Results have no leading zeros except for '0' itself.",
    ref: R`function addInBase(a, b, base) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let out = '';
  while (i >= 0 || j >= 0 || carry) {
    const sum = (i >= 0 ? Number(a[i--]) : 0) + (j >= 0 ? Number(b[j--]) : 0) + carry;
    out = (sum % base) + out;
    carry = Math.floor(sum / base);
  }
  return out || '0';
}

function addBinary(a, b) {
  return addInBase(a, b, 2);
}

function addStrings(a, b) {
  return addInBase(a, b, 10);
}

function multiplyStrings(a, b) {
  if (a === '0' || b === '0') return '0';
  const digits = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      const sum = Number(a[i]) * Number(b[j]) + digits[i + j + 1];
      digits[i + j + 1] = sum % 10;
      digits[i + j] += Math.floor(sum / 10);
    }
  }
  return digits.join('').replace(/^0+/, '');
}`,
  },
  {
    id: 'word-break-decode', title: 'DP: Word Break and Decode Ways', tags: ['dp', '1d-dp', 'string'],
    difficulty: 3, concept: 'dp',
    cx: ['O(n²) / O(n)', 'O(n)', 'Word break checks each prefix against each earlier split point; decode ways does one pass with a table of n + 1 counts.'],
    prompt: "Write wordBreak(s, wordDict): true when s can be split into a sequence of words from the array wordDict (words can be reused; the empty string is true). Write numDecodings(s): the number of ways to decode a digit string where 'A' = 1 ... 'Z' = 26 ('12' has 2 ways, '226' has 3, '06' has 0, '10' has 1; a leading or unmatched '0' makes it impossible).",
    ref: R`function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

function numDecodings(s) {
  const dp = new Array(s.length + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= s.length; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }
  }
  return dp[s.length];
}`,
  },
  {
    id: 'partition-subset-sum', title: 'DP: Partition Equal Subset Sum and Target Sum Ways', tags: ['dp', 'subset-sum', 'knapsack'],
    difficulty: 4, concept: 'dp',
    cx: ['O(n × S)', 'O(S)', 'Each number updates a one-dimensional table indexed by the subset sum S being searched.'],
    prompt: 'Write canPartition(nums): true when the positive integers can be split into two subsets with equal sum (an empty array is true). Write findTargetSumWays(nums, target): the number of ways to put a + or - sign in front of every number so the total equals target (reduce it to a subset-sum count; [0, 0, 0] with target 0 has 8 ways; 0 when impossible).',
    ref: R`function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const half = total / 2;
  const dp = new Array(half + 1).fill(false);
  dp[0] = true;
  for (const n of nums) {
    for (let s = half; s >= n; s--) {
      if (dp[s - n]) dp[s] = true;
    }
  }
  return dp[half];
}

function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const want = (total + target) / 2;
  const dp = new Array(want + 1).fill(0);
  dp[0] = 1;
  for (const n of nums) {
    for (let s = want; s >= n; s--) dp[s] += dp[s - n];
  }
  return dp[want];
}`,
  },
  {
    id: 'stock-profit-dp', title: 'DP: Best Time to Buy and Sell Stock (One, Many, Cooldown)', tags: ['dp', 'array', 'state-machine', 'greedy'],
    difficulty: 3, concept: 'dp',
    cx: ['O(n)', 'O(1)', 'Each price updates a handful of running profit states, so one pass and constant space suffice.'],
    prompt: 'Write maxProfit(prices): the best profit from one buy followed by one later sell (0 if no profit is possible or prices is empty). Write maxProfitMany(prices): the best total profit with unlimited transactions (you hold at most one share). Write maxProfitCooldown(prices): unlimited transactions, but after selling you must wait one day before buying again.',
    ref: R`function maxProfit(prices) {
  let min = Infinity;
  let best = 0;
  for (const p of prices) {
    min = Math.min(min, p);
    best = Math.max(best, p - min);
  }
  return best;
}

function maxProfitMany(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
  }
  return total;
}

function maxProfitCooldown(prices) {
  let hold = -Infinity;
  let sold = 0;
  let rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p;
    hold = Math.max(hold, rest - p);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}`,
  },
  {
    id: 'dp-array-variants', title: 'DP: Circular House Robber, Max Product Subarray, Min Cost Stairs', tags: ['dp', 'array', '1d-dp'],
    difficulty: 3, concept: 'dp',
    cx: ['O(n)', 'O(1)', 'Each function sweeps the array once keeping only the previous one or two states.'],
    prompt: 'Write robCircular(nums): houses are in a circle (the first and last are adjacent), you cannot rob two adjacent houses; return the maximum loot (0 for an empty array, nums[0] for one house). Write maxProduct(nums): the largest product of a non-empty contiguous subarray (track both the running max and min because negatives flip them). Write minCostClimbingStairs(cost): you may start on step 0 or 1, pay cost[i] to leave step i and climb 1 or 2 steps; return the minimum cost to reach the top (just past the last index).',
    ref: R`function robLine(nums, from, to) {
  let take = 0;
  let skip = 0;
  for (let i = from; i <= to; i++) {
    [take, skip] = [skip + nums[i], Math.max(take, skip)];
  }
  return Math.max(take, skip);
}

function robCircular(nums) {
  if (!nums.length) return 0;
  if (nums.length === 1) return nums[0];
  return Math.max(robLine(nums, 0, nums.length - 2), robLine(nums, 1, nums.length - 1));
}

function maxProduct(nums) {
  let max = nums[0];
  let min = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    const candidates = [n, max * n, min * n];
    max = Math.max(...candidates);
    min = Math.min(...candidates);
    best = Math.max(best, max);
  }
  return best;
}

function minCostClimbingStairs(cost) {
  let a = 0;
  let b = 0;
  for (let i = 2; i <= cost.length; i++) {
    [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  }
  return b;
}`,
  },
]);
