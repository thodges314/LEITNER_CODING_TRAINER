import { c } from './part1.mjs';

// Hand-written cases for batch 21: backtracking, round 2. Results are normalised because order is free.
const N = `const norm = (groups) => groups.map((g) => [...g].sort((a, b) => a - b)).sort((a, b) => (a.join() < b.join() ? -1 : 1));`;
const O = `const norm = (groups) => groups.map((g) => [...g]).sort((a, b) => (a.join() < b.join() ? -1 : 1));`;
const BOARD = `const board = () => [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']];`;

export default {
  'backtrack-combination-sum': [
    c('combinationSum reuses candidates', `${N}\n[norm(combinationSum([2, 3, 6, 7], 7)), norm(combinationSum([2, 3, 5], 8))]`, '[[[2, 2, 3], [7]], [[2, 2, 2, 2], [2, 3, 3], [3, 5]]]'),
    c('combinationSum with no answer and a single candidate', `${N}\n[norm(combinationSum([2], 1)), norm(combinationSum([1], 2))]`, '[[], [[1, 1]]]'),
    c('combinationSum does not modify its input', `${N}\nconst a = [3, 2];\ncombinationSum(a, 5);\na`, '[3, 2]'),
    c('combinationSum2 uses each element once and avoids duplicate sets', `${N}\nnorm(combinationSum2([10, 1, 2, 7, 6, 1, 5], 8))`, '[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]'),
    c('combinationSum2 with repeated twos', `${N}\nnorm(combinationSum2([2, 5, 2, 1, 2], 5))`, '[[1, 2, 2], [5]]'),
    c('combinationSum2 with no solution', `combinationSum2([2, 4], 5)`, '[]'),
    c('combinationSum3 digits 1-9 without repeats', `${N}\n[norm(combinationSum3(3, 7)), norm(combinationSum3(3, 9))]`, '[[[1, 2, 4]], [[1, 2, 6], [1, 3, 5], [2, 3, 4]]]'),
    c('combinationSum3 impossible cases', `[combinationSum3(4, 1), combinationSum3(2, 18)]`, '[[], []]'),
  ],
  'backtrack-n-queens': [
    c('solveNQueens(4) has two boards', `${O}\nnorm(solveNQueens(4))`, '[["..Q.", "Q...", "...Q", ".Q.."], [".Q..", "...Q", "Q...", "..Q."]]'),
    c('solveNQueens(1) is a single queen', `solveNQueens(1)`, '[["Q"]]'),
    c('solveNQueens has no solution for 2 or 3', `[solveNQueens(2), solveNQueens(3)]`, '[[], []]'),
    c('solveNQueens(5) has 10 boards of 5 rows each', `const r = solveNQueens(5);\n[r.length, r.every((b) => b.length === 5 && b.every((row) => row.length === 5 && row.split('Q').length === 2))]`, '[10, true]'),
    c('solveNQueens boards have one queen per column', `const r = solveNQueens(6);\nr.every((b) => new Set(b.map((row) => row.indexOf('Q'))).size === 6)`, 'true'),
    c('totalNQueens counts solutions', `[totalNQueens(1), totalNQueens(2), totalNQueens(4), totalNQueens(5), totalNQueens(6)]`, '[1, 0, 2, 10, 4]'),
    c('totalNQueens(8) is 92', `totalNQueens(8)`, '92'),
  ],
  'backtrack-word-search': [
    c('exist traces adjacent cells', `${BOARD}\n[exist(board(), 'ABCCED'), exist(board(), 'SEE')]`, '[true, true]'),
    c('exist does not reuse a cell', `${BOARD}\n[exist(board(), 'ABCB'), exist([['a', 'a']], 'aaa')]`, '[false, false]'),
    c('exist on a single cell', `[exist([['a']], 'a'), exist([['a']], 'ab')]`, '[true, false]'),
    c('exist restores the board after searching', `${BOARD}\nconst b = board();\nexist(b, 'ABCCED');\nexist(b, 'XYZ');\nJSON.stringify(b) === JSON.stringify(board())`, 'true'),
    c('exist finds a word that needs a turn after a dead end', `exist([['a', 'b'], ['c', 'd']], 'acdb')`, 'true'),
    c('findWords returns the words present', `const b = [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']];\nfindWords(b, ['oath', 'pea', 'eat', 'rain']).sort()`, "['eat', 'oath']"),
    c('findWords with duplicates and no matches', `const b = [['a', 'b'], ['c', 'd']];\n[findWords(b, ['ab', 'ab', 'cd']).sort(), findWords(b, ['abcd', 'xyz'])]`, "[['ab', 'cd'], []]"),
  ],
  'backtrack-palindrome-partition': [
    c('partition splits into palindromes', `${O}\n[norm(partition('aab')), norm(partition('aba'))]`, "[[['a', 'a', 'b'], ['aa', 'b']], [['a', 'b', 'a'], ['aba']]]"),
    c('partition of a single character', `partition('a')`, "[['a']]"),
    c('partition of a run of equal letters', `${O}\nnorm(partition('aaa'))`, "[['a', 'a', 'a'], ['a', 'aa'], ['aa', 'a'], ['aaa']]"),
    c('letterCombinations of two digits', `letterCombinations('23').sort()`, "['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']"),
    c('letterCombinations: empty input and four-letter keys', `[letterCombinations(''), letterCombinations('7').sort(), letterCombinations('79').length]`, "[[], ['p', 'q', 'r', 's'], 16]"),
    c('restoreIpAddresses classic example', `restoreIpAddresses('25525511135').sort()`, "['255.255.11.135', '255.255.111.35']"),
    c('restoreIpAddresses rejects leading zeros and large parts', `[restoreIpAddresses('0000'), restoreIpAddresses('010010').sort(), restoreIpAddresses('256256256256')]`, "[['0.0.0.0'], ['0.10.0.10', '0.100.1.0'], []]"),
    c('restoreIpAddresses with several answers', `restoreIpAddresses('101023').sort()`, "['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3']"),
    c('restoreIpAddresses with too few or too many digits', `[restoreIpAddresses('111'), restoreIpAddresses('1111'), restoreIpAddresses('1234567890123')]`, "[[], ['1.1.1.1'], []]"),
  ],
  'backtrack-subsets-permute-unique': [
    c('subsetsWithDup omits duplicate subsets', `${O}\nnorm(subsetsWithDup([1, 2, 2]))`, '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]'),
    c('subsetsWithDup of an unsorted input and of empty', `${O}\n[norm(subsetsWithDup([4, 4, 1])), subsetsWithDup([])]`, '[[[], [1], [1, 4], [1, 4, 4], [4], [4, 4]], [[]]]'),
    c('permuteUnique avoids repeated permutations', `${O}\nnorm(permuteUnique([1, 1, 2]))`, '[[1, 1, 2], [1, 2, 1], [2, 1, 1]]'),
    c('permuteUnique of distinct values and of one value', `${O}\n[permuteUnique([1, 2, 3]).length, norm(permuteUnique([5]))]`, '[6, [[5]]]'),
    c('permuteUnique of all equal values', `permuteUnique([2, 2, 2])`, '[[2, 2, 2]]'),
    c('combine picks k numbers from 1..n', `${N}\nnorm(combine(4, 2))`, '[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]'),
    c('combine edge cases', `${N}\n[norm(combine(1, 1)), norm(combine(3, 3)), combine(5, 1).length, combine(6, 3).length]`, '[[[1]], [[1, 2, 3]], 5, 20]'),
  ],
};
