import { c } from "./part1.mjs";

// Hand-written cases for batch 16: algorithms round 2, part A (bits, monotonic stack, 2D DP, greedy, two pointers).
export default {
  "bit-basics": [
    c(
      "singleNumber finds the unpaired value",
      `[singleNumber([2, 2, 1]), singleNumber([4, 1, 2, 1, 2]), singleNumber([7])]`,
      "[1, 4, 7]",
    ),
    c("singleNumber with negatives", `singleNumber([-1, -1, -3])`, "-3"),
    c(
      "countOneBits of small numbers",
      `[countOneBits(0), countOneBits(1), countOneBits(11), countOneBits(255)]`,
      "[0, 1, 3, 8]",
    ),
    c(
      "countOneBits of large 32-bit values",
      `[countOneBits(4294967295), countOneBits(2147483648), countOneBits(1024)]`,
      "[32, 1, 1]",
    ),
    c(
      "isPowerOfTwo accepts powers of two",
      `[isPowerOfTwo(1), isPowerOfTwo(2), isPowerOfTwo(16), isPowerOfTwo(1024)]`,
      "[true, true, true, true]",
    ),
    c(
      "isPowerOfTwo rejects everything else",
      `[isPowerOfTwo(0), isPowerOfTwo(-4), isPowerOfTwo(6), isPowerOfTwo(12)]`,
      "[false, false, false, false]",
    ),
  ],
  "bit-tricks-more": [
    c(
      "missingNumber finds the gap in 0..n",
      `[missingNumber([3, 0, 1]), missingNumber([0, 1]), missingNumber([1]), missingNumber([])]`,
      "[2, 2, 0, 0]",
    ),
    c(
      "missingNumber in a longer shuffled list",
      `missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])`,
      "8",
    ),
    c(
      "hammingDistance counts differing bits",
      `[hammingDistance(1, 4), hammingDistance(3, 1), hammingDistance(0, 0), hammingDistance(7, 0)]`,
      "[2, 1, 0, 3]",
    ),
    c(
      "countBitsUpTo lists bit counts",
      `countBitsUpTo(5)`,
      "[0, 1, 1, 2, 1, 2]",
    ),
    c(
      "countBitsUpTo(0) and a longer run",
      `[countBitsUpTo(0), countBitsUpTo(8)]`,
      "[[0], [0, 1, 1, 2, 1, 2, 2, 3, 1]]",
    ),
    c(
      "getBit reads a position",
      `[getBit(5, 0), getBit(5, 1), getBit(5, 2), getBit(5, 3)]`,
      "[1, 0, 1, 0]",
    ),
    c(
      "setBit and clearBit",
      `[setBit(8, 0), setBit(5, 0), clearBit(15, 1), clearBit(4, 0)]`,
      "[9, 5, 13, 4]",
    ),
  ],
  "monotonic-stack-basics": [
    c(
      "nextGreaterElement",
      `nextGreaterElement([4, 5, 2, 10, 8])`,
      "[5, 10, 10, -1, -1]",
    ),
    c(
      "nextGreaterElement with descending, equal and empty input",
      `[nextGreaterElement([3, 2, 1]), nextGreaterElement([2, 2]), nextGreaterElement([])]`,
      "[[-1, -1, -1], [-1, -1], []]",
    ),
    c(
      "nextGreaterElement with an ascending run",
      `nextGreaterElement([1, 2, 3, 4])`,
      "[2, 3, 4, -1]",
    ),
    c(
      "dailyTemperatures classic example",
      `dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])`,
      "[1, 1, 4, 2, 1, 1, 0, 0]",
    ),
    c(
      "dailyTemperatures with rising and falling runs",
      `[dailyTemperatures([30, 40, 50, 60]), dailyTemperatures([60, 50, 40])]`,
      "[[1, 1, 1, 0], [0, 0, 0]]",
    ),
    c(
      "dailyTemperatures: equal temperatures are not warmer",
      `[dailyTemperatures([70, 70, 71]), dailyTemperatures([])]`,
      "[[2, 1, 0], []]",
    ),
  ],
  "monotonic-stack-histogram": [
    c(
      "stockSpan classic example",
      `stockSpan([100, 80, 60, 70, 60, 75, 85])`,
      "[1, 1, 1, 2, 1, 4, 6]",
    ),
    c(
      "stockSpan with equal prices counts them",
      `[stockSpan([5, 5, 5]), stockSpan([]), stockSpan([3])]`,
      "[[1, 2, 3], [], [1]]",
    ),
    c(
      "largestRectangleArea classic example",
      `largestRectangleArea([2, 1, 5, 6, 2, 3])`,
      "10",
    ),
    c(
      "largestRectangleArea of small histograms",
      `[largestRectangleArea([2, 4]), largestRectangleArea([1, 1, 1, 1]), largestRectangleArea([5])]`,
      "[4, 4, 5]",
    ),
    c(
      "largestRectangleArea: empty and a valley",
      `[largestRectangleArea([]), largestRectangleArea([6, 2, 5, 4, 5, 1, 6])]`,
      "[0, 12]",
    ),
    c(
      "largestRectangleArea: ascending and descending bars",
      `[largestRectangleArea([1, 2, 3, 4, 5]), largestRectangleArea([5, 4, 3, 2, 1])]`,
      "[9, 9]",
    ),
  ],
  "unique-paths-grid": [
    c(
      "uniquePaths counts routes",
      `[uniquePaths(3, 7), uniquePaths(3, 2), uniquePaths(7, 3)]`,
      "[28, 3, 28]",
    ),
    c(
      "uniquePaths in a single row, column or cell",
      `[uniquePaths(1, 1), uniquePaths(1, 5), uniquePaths(5, 1)]`,
      "[1, 1, 1]",
    ),
    c("uniquePaths(10, 10)", `uniquePaths(10, 10)`, "48620"),
    c(
      "uniquePathsWithObstacles routes around a block",
      `uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])`,
      "2",
    ),
    c(
      "uniquePathsWithObstacles with a single detour",
      `uniquePathsWithObstacles([[0, 1], [0, 0]])`,
      "1",
    ),
    c(
      "uniquePathsWithObstacles: blocked start, end or wall",
      `[uniquePathsWithObstacles([[1, 0]]), uniquePathsWithObstacles([[0, 1]]), uniquePathsWithObstacles([[0, 0], [1, 1]])]`,
      "[0, 0, 0]",
    ),
    c(
      "uniquePathsWithObstacles: free single cell",
      `uniquePathsWithObstacles([[0]])`,
      "1",
    ),
  ],
  "min-path-sum-grid": [
    c(
      "minPathSum classic example",
      `minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])`,
      "7",
    ),
    c(
      "minPathSum on a rectangle and a single cell",
      `[minPathSum([[1, 2, 3], [4, 5, 6]]), minPathSum([[5]])]`,
      "[12, 5]",
    ),
    c(
      "minPathSum on a single row and a single column",
      `[minPathSum([[1, 2, 3]]), minPathSum([[1], [2], [3]])]`,
      "[6, 6]",
    ),
    c(
      "minimumTotal of a triangle",
      `minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]])`,
      "11",
    ),
    c(
      "minimumTotal with a single row and negatives",
      `[minimumTotal([[-10]]), minimumTotal([[1], [-2, -3]])]`,
      "[-10, -2]",
    ),
    c(
      "minimumTotal does not take the greedy minimum",
      `minimumTotal([[1], [2, 3], [100, 1, 1]])`,
      "4",
    ),
  ],
  "lcs-subsequence": [
    c(
      "longestCommonSubsequence classic examples",
      `[longestCommonSubsequence('abcde', 'ace'), longestCommonSubsequence('AGGTAB', 'GXTXAYB')]`,
      "[3, 4]",
    ),
    c(
      "LCS of equal and disjoint strings",
      `[longestCommonSubsequence('abc', 'abc'), longestCommonSubsequence('abc', 'def')]`,
      "[3, 0]",
    ),
    c(
      "LCS with an empty string",
      `[longestCommonSubsequence('', 'abc'), longestCommonSubsequence('abc', ''), longestCommonSubsequence('', '')]`,
      "[0, 0, 0]",
    ),
    c(
      "LCS is not a substring: characters may be apart",
      `longestCommonSubsequence('axbycz', 'abc')`,
      "3",
    ),
    c(
      "isSubsequence true cases",
      `[isSubsequence('ace', 'abcde'), isSubsequence('', 'x'), isSubsequence('abc', 'abc')]`,
      "[true, true, true]",
    ),
    c(
      "isSubsequence false cases",
      `[isSubsequence('aec', 'abcde'), isSubsequence('a', ''), isSubsequence('abc', 'ab')]`,
      "[false, false, false]",
    ),
  ],
  "edit-distance-knapsack": [
    c(
      "editDistance classic examples",
      `[editDistance('horse', 'ros'), editDistance('intention', 'execution')]`,
      "[3, 5]",
    ),
    c(
      "editDistance with empty and equal strings",
      `[editDistance('', 'abc'), editDistance('abc', ''), editDistance('abc', 'abc'), editDistance('', '')]`,
      "[3, 3, 0, 0]",
    ),
    c(
      "editDistance of single substitution and insertion",
      `[editDistance('a', 'b'), editDistance('cat', 'cart')]`,
      "[1, 1]",
    ),
    c(
      "knapsack classic example",
      `knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)`,
      "9",
    ),
    c(
      "knapsack takes each item at most once",
      `knapsack([1, 2, 3], [6, 10, 12], 5)`,
      "22",
    ),
    c(
      "knapsack with nothing fitting or zero capacity",
      `[knapsack([5, 6], [10, 20], 4), knapsack([1, 2], [3, 4], 0), knapsack([], [], 10)]`,
      "[0, 0, 0]",
    ),
    c("knapsack with a single fitting item", `knapsack([4], [9], 4)`, "9"),
  ],
  "jump-game-greedy": [
    c(
      "canJump reachable arrays",
      `[canJump([2, 3, 1, 1, 4]), canJump([0]), canJump([2, 0, 0])]`,
      "[true, true, true]",
    ),
    c(
      "canJump unreachable arrays",
      `[canJump([3, 2, 1, 0, 4]), canJump([0, 1]), canJump([1, 0, 1, 0])]`,
      "[false, false, false]",
    ),
    c("canJump with big first jump", `canJump([5, 0, 0, 0, 0, 0])`, "true"),
    c(
      "minJumps classic examples",
      `[minJumps([2, 3, 1, 1, 4]), minJumps([2, 3, 0, 1, 4])]`,
      "[2, 2]",
    ),
    c(
      "minJumps trivial and long-chain cases",
      `[minJumps([1]), minJumps([1, 1, 1, 1]), minJumps([10, 1, 1, 1])]`,
      "[0, 3, 1]",
    ),
  ],
  "container-water-two-pointer": [
    c("maxArea classic example", `maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])`, "49"),
    c(
      "maxArea small inputs",
      `[maxArea([1, 1]), maxArea([4, 3, 2, 1, 4]), maxArea([1, 2, 1])]`,
      "[1, 16, 2]",
    ),
    c(
      "maxArea with fewer than two lines",
      `[maxArea([]), maxArea([5])]`,
      "[0, 0]",
    ),
    c(
      "trap classic example",
      `trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])`,
      "6",
    ),
    c(
      "trap with a deep bowl and a flat valley",
      `[trap([4, 2, 0, 3, 2, 5]), trap([3, 0, 3])]`,
      "[9, 3]",
    ),
    c(
      "trap with no pockets",
      `[trap([1, 2, 3]), trap([3, 2, 1]), trap([]), trap([5])]`,
      "[0, 0, 0, 0]",
    ),
  ],
  "greedy-intervals-circuit": [
    c(
      "eraseOverlapIntervals classic example",
      `eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])`,
      "1",
    ),
    c(
      "eraseOverlapIntervals with duplicates and touching intervals",
      `[eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]), eraseOverlapIntervals([[1, 2], [2, 3]]), eraseOverlapIntervals([])]`,
      "[2, 0, 0]",
    ),
    c(
      "eraseOverlapIntervals prefers the earliest end",
      `eraseOverlapIntervals([[1, 100], [11, 22], [1, 11], [2, 12]])`,
      "2",
    ),
    c(
      "canAttendMeetings detects overlap",
      `[canAttendMeetings([[0, 30], [5, 10], [15, 20]]), canAttendMeetings([[7, 10], [2, 4]])]`,
      "[false, true]",
    ),
    c(
      "canAttendMeetings: touching, empty and unsorted input",
      `[canAttendMeetings([[1, 2], [2, 3]]), canAttendMeetings([]), canAttendMeetings([[5, 8], [1, 6]])]`,
      "[true, true, false]",
    ),
    c(
      "Interval functions do not mutate the input",
      `const a = [[3, 4], [1, 2]];\neraseOverlapIntervals(a); canAttendMeetings(a);\na`,
      "[[3, 4], [1, 2]]",
    ),
    c(
      "canCompleteCircuit finds the start",
      `[canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), canCompleteCircuit([5], [4]), canCompleteCircuit([2], [2])]`,
      "[3, 0, 0]",
    ),
    c(
      "canCompleteCircuit returns -1 when total fuel is short",
      `canCompleteCircuit([2, 3, 4], [3, 4, 3])`,
      "-1",
    ),
  ],
};
