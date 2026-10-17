import { writeCards, R } from './_author.mjs';
writeCards([
  { id: 'backtrack-combination-sum', title: 'Backtracking: Combination Sum I, II and III', tags: ['backtracking', 'combinations', 'recursion'],
    difficulty: 3, concept: 'backtracking',
    cx: ['O(2^n)', 'O(n)', 'The search tree branches on take/skip; depth is bounded by the target or the candidate count.'],
    prompt: 'Write combinationSum(candidates, target): all unique combinations of distinct positive numbers summing to target, where each number may be reused any number of times. Write combinationSum2(candidates, target): candidates may contain duplicates and each element may be used at most once; the result must contain no duplicate combinations (sort first and skip repeated values at the same depth). Write combinationSum3(k, n): all combinations of exactly k distinct digits from 1 to 9 that sum to n. Result order does not matter, and numbers inside each combination should be ascending.',
    ref: R`function combinationSum(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b);
  const out = [];
  const path = [];
  function dfs(start, remaining) {
    if (remaining === 0) {
      out.push([...path]);
      return;
    }
    for (let i = start; i < nums.length && nums[i] <= remaining; i++) {
      path.push(nums[i]);
      dfs(i, remaining - nums[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return out;
}

function combinationSum2(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b);
  const out = [];
  const path = [];
  function dfs(start, remaining) {
    if (remaining === 0) {
      out.push([...path]);
      return;
    }
    for (let i = start; i < nums.length && nums[i] <= remaining; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]);
      dfs(i + 1, remaining - nums[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return out;
}

function combinationSum3(k, n) {
  const out = [];
  const path = [];
  function dfs(start, remaining) {
    if (path.length === k) {
      if (remaining === 0) out.push([...path]);
      return;
    }
    for (let d = start; d <= 9 && d <= remaining; d++) {
      path.push(d);
      dfs(d + 1, remaining - d);
      path.pop();
    }
  }
  dfs(1, n);
  return out;
}` },
  { id: 'backtrack-n-queens', title: 'Backtracking: N-Queens (Boards and Count)', tags: ['backtracking', 'n-queens', 'constraint'],
    difficulty: 4, concept: 'backtracking',
    cx: ['O(n!)', 'O(n)', 'One queen per row with O(1) column and diagonal conflict checks prunes the search; the path and sets use O(n).'],
    prompt: "Write solveNQueens(n): every way to place n queens on an n x n board so none attack each other, each solution as an array of n strings using 'Q' and '.' (one string per row); return [] when there is none. Use sets (or boolean arrays) for columns and both diagonals so conflict checks are O(1). Write totalNQueens(n): just the number of solutions. Solution order does not matter.",
    ref: R`function solveNQueens(n) {
  const out = [];
  const cols = new Set();
  const diag = new Set();
  const anti = new Set();
  const placed = [];
  function dfs(row) {
    if (row === n) {
      out.push(placed.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(row - c) || anti.has(row + c)) continue;
      cols.add(c);
      diag.add(row - c);
      anti.add(row + c);
      placed.push(c);
      dfs(row + 1);
      placed.pop();
      cols.delete(c);
      diag.delete(row - c);
      anti.delete(row + c);
    }
  }
  dfs(0);
  return out;
}

function totalNQueens(n) {
  let count = 0;
  const cols = new Set();
  const diag = new Set();
  const anti = new Set();
  function dfs(row) {
    if (row === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(row - c) || anti.has(row + c)) continue;
      cols.add(c);
      diag.add(row - c);
      anti.add(row + c);
      dfs(row + 1);
      cols.delete(c);
      diag.delete(row - c);
      anti.delete(row + c);
    }
  }
  dfs(0);
  return count;
}` },
  { id: 'backtrack-word-search', title: 'Backtracking: Word Search and Word Search II', tags: ['backtracking', 'grid', 'dfs'],
    difficulty: 3, concept: 'backtracking',
    cx: ['O(r * c * 4^L)', 'O(L)', 'Each start cell explores up to four directions per letter of a word of length L; the recursion depth is L.'],
    prompt: 'The board is an array of rows of single-character strings. Write exist(board, word): true when word can be traced through horizontally or vertically adjacent cells without reusing a cell within the same path (mark cells while exploring and restore them when backtracking; do not leave the board changed). Write findWords(board, words): the words from the list that exist on the board, each listed once, in any order.',
    ref: R`function exist(board, word) {
  const rows = board.length;
  const cols = rows ? board[0].length : 0;
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    const saved = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = saved;
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}

function findWords(board, words) {
  return [...new Set(words)].filter((word) => exist(board, word));
}` },
  { id: 'backtrack-palindrome-partition', title: 'Backtracking: Palindrome Partitioning, Phone Letters, Restore IPs', tags: ['backtracking', 'strings', 'partition'],
    difficulty: 3, concept: 'backtracking',
    cx: ['O(n * 2^n)', 'O(n)', 'Each gap between characters is cut or not, and each candidate piece costs O(n) to check or copy.'],
    prompt: "Write partition(s): every way to split a non-empty string into pieces that are all palindromes, as arrays of strings. Write letterCombinations(digits): all strings a phone keypad could spell for a digit string of 2-9 (2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz); [] for ''. Write restoreIpAddresses(s): every valid IPv4 address obtainable by inserting three dots into the digit string s (four parts, each 0-255, no leading zeros except the single digit 0), as strings. Result order does not matter.",
    ref: R`function partition(s) {
  const out = [];
  const path = [];
  const isPal = (lo, hi) => {
    while (lo < hi) if (s[lo++] !== s[hi--]) return false;
    return true;
  };
  function dfs(start) {
    if (start === s.length) {
      out.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      path.push(s.slice(start, end + 1));
      dfs(end + 1);
      path.pop();
    }
  }
  dfs(0);
  return out;
}

function letterCombinations(digits) {
  if (!digits) return [];
  const keys = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const out = [];
  function dfs(i, built) {
    if (i === digits.length) {
      out.push(built);
      return;
    }
    for (const ch of keys[digits[i]]) dfs(i + 1, built + ch);
  }
  dfs(0, '');
  return out;
}

function restoreIpAddresses(s) {
  const out = [];
  const parts = [];
  function dfs(start) {
    if (parts.length === 4) {
      if (start === s.length) out.push(parts.join('.'));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const piece = s.slice(start, start + len);
      if (piece.length > 1 && piece[0] === '0') break;
      if (Number(piece) > 255) break;
      parts.push(piece);
      dfs(start + len);
      parts.pop();
    }
  }
  dfs(0);
  return out;
}` },
  { id: 'backtrack-subsets-permute-unique', title: 'Backtracking: Subsets II, Permutations II, Combinations', tags: ['backtracking', 'duplicates', 'permutations'],
    difficulty: 3, concept: 'backtracking',
    cx: ['O(n * 2^n)', 'O(n)', 'Sorting plus a same-depth skip rule prunes duplicate branches; every output costs O(n) to copy.'],
    prompt: 'Write subsetsWithDup(nums): all distinct subsets (the power set without duplicate subsets) of an array that may contain repeated values; sort first and skip a value equal to the previous one at the same depth. Write permuteUnique(nums): all distinct permutations of an array that may contain repeats. Write combine(n, k): every combination of k numbers chosen from 1..n, each ascending. Result order does not matter.',
    ref: R`function subsetsWithDup(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const out = [];
  const path = [];
  function dfs(start) {
    out.push([...path]);
    for (let i = start; i < sorted.length; i++) {
      if (i > start && sorted[i] === sorted[i - 1]) continue;
      path.push(sorted[i]);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(0);
  return out;
}

function permuteUnique(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const used = new Array(sorted.length).fill(false);
  const out = [];
  const path = [];
  function dfs() {
    if (path.length === sorted.length) {
      out.push([...path]);
      return;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(sorted[i]);
      dfs();
      path.pop();
      used[i] = false;
    }
  }
  dfs();
  return out;
}

function combine(n, k) {
  const out = [];
  const path = [];
  function dfs(start) {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(1);
  return out;
}` },
]);
