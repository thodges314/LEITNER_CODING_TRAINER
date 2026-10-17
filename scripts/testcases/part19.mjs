import { c } from './part1.mjs';

// Hand-written cases for batch 19: trees and linked lists, round 2.
const T = `const n = (val, left = null, right = null) => ({ val, left, right });`;
const S = `${T}\nconst ser = (t) => (t ? [t.val, ser(t.left), ser(t.right)] : null);`;
const LL = `const list = (...vals) => vals.reduceRight((next, val) => ({ val, next }), null);
const toArray = (node) => { const out = []; while (node) { out.push(node.val); node = node.next; } return out; };`;
const BIG = `const big = n(5, n(4, n(11, n(7), n(2))), n(8, n(13), n(4, n(5), n(1))));`;

export default {
  'tree-level-order': [
    c('levelOrder groups values by depth', `${T}\nlevelOrder(n(3, n(9), n(20, n(15), n(7))))`, '[[3], [9, 20], [15, 7]]'),
    c('levelOrder: null and single node', `${T}\n[levelOrder(null), levelOrder(n(1))]`, '[[], [[1]]]'),
    c('levelOrder with a lopsided tree', `${T}\nlevelOrder(n(1, n(2, null, n(5)), n(3)))`, '[[1], [2, 3], [5]]'),
    c('rightSideView sees the last node of every level', `${T}\n[rightSideView(n(3, n(9), n(20, n(15), n(7)))), rightSideView(n(1, n(2, null, n(5)), n(3)))]`, '[[3, 20, 7], [1, 3, 5]]'),
    c('rightSideView of a left-only chain and of null', `${T}\n[rightSideView(n(1, n(2, n(3)))), rightSideView(null)]`, '[[1, 2, 3], []]'),
    c('zigzagLevelOrder reverses every odd depth', `${T}\n[zigzagLevelOrder(n(3, n(9), n(20, n(15), n(7)))), zigzagLevelOrder(n(1, n(2, null, n(5)), n(3)))]`, '[[[3], [20, 9], [15, 7]], [[1], [3, 2], [5]]]'),
    c('zigzagLevelOrder of null', `zigzagLevelOrder(null)`, '[]'),
  ],
  'tree-path-sum': [
    c('hasPathSum finds a root-to-leaf sum', `${T}\n${BIG}\n[hasPathSum(big, 22), hasPathSum(big, 26), hasPathSum(big, 18)]`, '[true, true, true]'),
    c('hasPathSum rejects sums that are not leaf paths', `${T}\n${BIG}\n[hasPathSum(big, 5), hasPathSum(big, 9), hasPathSum(big, 100)]`, '[false, false, false]'),
    c('hasPathSum: a non-leaf root does not count, null is false', `${T}\n[hasPathSum(n(1, n(2)), 1), hasPathSum(n(1, n(2)), 3), hasPathSum(null, 0), hasPathSum(n(4), 4)]`, '[false, true, false, true]'),
    c('pathSum returns every matching path left to right', `${T}\n${BIG}\npathSum(big, 22)`, '[[5, 4, 11, 2], [5, 8, 4, 5]]'),
    c('pathSum with one match and with none', `${T}\n${BIG}\n[pathSum(big, 26), pathSum(big, 3)]`, '[[[5, 8, 13]], []]'),
    c('pathSum copies paths (later mutation must not leak in)', `${T}\nconst r = pathSum(n(1, n(2), n(2)), 3);\n[r.length, r[0] !== r[1], r[0], r[1]]`, '[2, true, [1, 2], [1, 2]]'),
    c('minDepth counts nodes down to the nearest leaf', `${T}\n${BIG}\nminDepth(big)`, '3'),
    c('minDepth: one-child nodes continue, null is 0', `${T}\n[minDepth(n(1, n(2))), minDepth(null), minDepth(n(1)), minDepth(n(1, null, n(2, null, n(3))))]`, '[2, 0, 1, 3]'),
  ],
  'tree-diameter-balanced': [
    c('diameterOfBinaryTree counts edges on the longest path', `${T}\ndiameterOfBinaryTree(n(1, n(2, n(4), n(5)), n(3)))`, '3'),
    c('diameterOfBinaryTree: null, single node and a chain', `${T}\n[diameterOfBinaryTree(null), diameterOfBinaryTree(n(1)), diameterOfBinaryTree(n(1, n(2, n(3))))]`, '[0, 0, 2]'),
    c('diameterOfBinaryTree need not pass through the root', `${T}\nconst deep = n(2, n(3, n(4, n(5)), n(6, null, n(7))));\ndiameterOfBinaryTree(n(1, deep))`, '4'),
    c('isBalanced accepts balanced trees', `${T}\n[isBalanced(n(1, n(2, n(4), n(5)), n(3))), isBalanced(null), isBalanced(n(1))]`, '[true, true, true]'),
    c('isBalanced rejects a chain of three', `${T}\nisBalanced(n(1, n(2, n(3))))`, 'false'),
    c('isBalanced checks every node, not just the root', `${T}\nisBalanced(n(1, n(2, n(3, n(4, n(8))), n(5)), n(6, n(7, n(9)))))`, 'false'),
    c('isSymmetric accepts a mirror image', `${T}\n[isSymmetric(n(1, n(2, n(3), n(4)), n(2, n(4), n(3)))), isSymmetric(null), isSymmetric(n(1))]`, '[true, true, true]'),
    c('isSymmetric rejects a shifted subtree and unequal values', `${T}\n[isSymmetric(n(1, n(2, null, n(3)), n(2, null, n(3)))), isSymmetric(n(1, n(2), n(3))), isSymmetric(n(1, n(2)))]`, '[false, false, false]'),
  ],
  'bst-kth-insert-build': [
    c('kthSmallest walks the in-order sequence', `${T}\nconst t = n(5, n(3, n(2, n(1)), n(4)), n(6));\n[kthSmallest(t, 1), kthSmallest(t, 3), kthSmallest(t, 6)]`, '[1, 3, 6]'),
    c('kthLargest walks the reverse in-order sequence', `${T}\nconst t = n(5, n(3, n(2, n(1)), n(4)), n(6));\n[kthLargest(t, 1), kthLargest(t, 2), kthLargest(t, 6)]`, '[6, 5, 1]'),
    c('kth on a single node', `${T}\n[kthSmallest(n(7), 1), kthLargest(n(7), 1)]`, '[7, 7]'),
    c('insertIntoBST adds a leaf on the correct side', `${S}\nser(insertIntoBST(n(4, n(2), n(7)), 5))`, '[4, [2, null, null], [7, [5, null, null], null]]'),
    c('insertIntoBST into a null tree and a smaller value', `${S}\n[ser(insertIntoBST(null, 5)), ser(insertIntoBST(n(4), 1))]`, '[[5, null, null], [4, [1, null, null], null]]'),
    c('insertIntoBST returns the same root object', `${T}\nconst root = n(4);\ninsertIntoBST(root, 9) === root`, 'true'),
    c('sortedArrayToBST uses the lower middle index', `${S}\nser(sortedArrayToBST([1, 2, 3, 4, 5]))`, '[3, [1, null, [2, null, null]], [4, null, [5, null, null]]]'),
    c('sortedArrayToBST: empty, single and two elements', `${S}\n[sortedArrayToBST([]), ser(sortedArrayToBST([9])), ser(sortedArrayToBST([1, 2]))]`, '[null, [9, null, null], [1, null, [2, null, null]]]'),
  ],
  'tree-build-serialize': [
    c('buildTree from preorder and inorder', `${S}\nser(buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]))`, '[3, [9, null, null], [20, [15, null, null], [7, null, null]]]'),
    c('buildTree: empty and single value', `${S}\n[buildTree([], []), ser(buildTree([-1], [-1]))]`, '[null, [-1, null, null]]'),
    c('buildTree with a left-leaning chain', `${S}\nser(buildTree([1, 2, 3], [3, 2, 1]))`, '[1, [2, [3, null, null], null], null]'),
    c('buildTree with a right-leaning chain', `${S}\nser(buildTree([1, 2, 3], [1, 2, 3]))`, '[1, null, [2, null, [3, null, null]]]'),
    c('serialize returns a string and handles null', `[typeof serialize(null), deserialize(serialize(null))]`, "['string', null]"),
    c('round trip rebuilds a balanced tree', `${S}\nconst t = n(1, n(2, n(4), n(5)), n(3));\nJSON.stringify(ser(deserialize(serialize(t)))) === JSON.stringify(ser(t))`, 'true'),
    c('round trip keeps negative and multi-digit values', `${S}\nconst t = n(-10, n(20, null, n(-3)), n(300, n(15)));\nJSON.stringify(ser(deserialize(serialize(t)))) === JSON.stringify(ser(t))`, 'true'),
    c('round trip preserves left versus right children', `${S}\nconst l = n(1, n(2));\nconst r = n(1, null, n(2));\n[JSON.stringify(ser(deserialize(serialize(l)))) === JSON.stringify(ser(l)), JSON.stringify(ser(deserialize(serialize(r)))) === JSON.stringify(ser(r)), serialize(l) !== serialize(r)]`, '[true, true, true]'),
  ],
  'tree-max-path-sum': [
    c('maxPathSum can bend at a node', `${T}\n[maxPathSum(n(1, n(2), n(3))), maxPathSum(n(-10, n(9), n(20, n(15), n(7))))]`, '[6, 42]'),
    c('maxPathSum with all-negative values takes the largest single node', `${T}\n[maxPathSum(n(-3)), maxPathSum(n(-1, n(-2), n(-3)))]`, '[-3, -1]'),
    c('maxPathSum drops a negative child', `${T}\nmaxPathSum(n(2, n(-1)))`, '2'),
    c('sumNumbers adds every root-to-leaf number', `${T}\n[sumNumbers(n(1, n(2), n(3))), sumNumbers(n(4, n(9, n(5), n(1)), n(0)))]`, '[25, 1026]'),
    c('sumNumbers: null and a single digit', `${T}\n[sumNumbers(null), sumNumbers(n(7))]`, '[0, 7]'),
    c('goodNodes counts nodes not smaller than any ancestor', `${T}\ngoodNodes(n(3, n(1, n(3)), n(4, n(1), n(5))))`, '4'),
    c('goodNodes: null, single node and decreasing chain', `${T}\n[goodNodes(null), goodNodes(n(1)), goodNodes(n(5, n(4, n(3))))]`, '[0, 1, 1]'),
    c('goodNodes with negative values', `${T}\ngoodNodes(n(-1, n(-2), n(0)))`, '2'),
  ],
  'list-remove-reorder': [
    c('removeNthFromEnd removes from the middle', `${LL}\ntoArray(removeNthFromEnd(list(1, 2, 3, 4, 5), 2))`, '[1, 2, 3, 5]'),
    c('removeNthFromEnd can remove the head or the tail', `${LL}\n[toArray(removeNthFromEnd(list(1, 2), 2)), toArray(removeNthFromEnd(list(1, 2), 1))]`, '[[2], [1]]'),
    c('removeNthFromEnd of a single node leaves an empty list', `${LL}\nremoveNthFromEnd(list(1), 1)`, 'null'),
    c('reorderList interleaves ends (even length)', `${LL}\nconst h = list(1, 2, 3, 4);\nconst r = reorderList(h);\n[r, toArray(h)]`, '[undefined, [1, 4, 2, 3]]'),
    c('reorderList (odd length)', `${LL}\nconst h = list(1, 2, 3, 4, 5);\nreorderList(h);\ntoArray(h)`, '[1, 5, 2, 4, 3]'),
    c('reorderList leaves tiny lists alone', `${LL}\nconst a = list(1);\nconst b = list(1, 2);\nreorderList(a); reorderList(b);\n[toArray(a), toArray(b)]`, '[[1], [1, 2]]'),
    c('deleteDuplicates keeps one of each value', `${LL}\n[toArray(deleteDuplicates(list(1, 1, 2, 3, 3))), toArray(deleteDuplicates(list(2, 2, 2)))]`, '[[1, 2, 3], [2]]'),
    c('deleteDuplicates: empty and already unique', `${LL}\n[deleteDuplicates(null), toArray(deleteDuplicates(list(1, 2, 3)))]`, '[null, [1, 2, 3]]'),
  ],
  'list-add-numbers': [
    c('addTwoNumbers adds reversed-digit lists', `${LL}\ntoArray(addTwoNumbers(list(2, 4, 3), list(5, 6, 4)))`, '[7, 0, 8]'),
    c('addTwoNumbers handles different lengths and a final carry', `${LL}\n[toArray(addTwoNumbers(list(9, 9, 9, 9), list(1))), toArray(addTwoNumbers(list(5), list(5)))]`, '[[0, 0, 0, 0, 1], [0, 1]]'),
    c('addTwoNumbers with zeros', `${LL}\ntoArray(addTwoNumbers(list(0), list(0)))`, '[0]'),
    c('addTwoNumbers builds a new list (inputs untouched)', `${LL}\nconst a = list(1, 2);\nconst b = list(3);\naddTwoNumbers(a, b);\n[toArray(a), toArray(b)]`, '[[1, 2], [3]]'),
    c('oddEvenList groups odd positions first', `${LL}\n[toArray(oddEvenList(list(1, 2, 3, 4, 5))), toArray(oddEvenList(list(2, 1, 3, 5, 6, 4, 7)))]`, '[[1, 3, 5, 2, 4], [2, 3, 6, 7, 1, 5, 4]]'),
    c('oddEvenList: null, one and two nodes', `${LL}\n[oddEvenList(null), toArray(oddEvenList(list(1))), toArray(oddEvenList(list(1, 2)))]`, '[null, [1], [1, 2]]'),
    c('getIntersectionNode returns the shared node', `${LL}\nconst shared = list(8, 4, 5);\nconst a = list(4, 1); a.next.next = shared;\nconst b = list(5, 6, 1); b.next.next.next = shared;\ngetIntersectionNode(a, b) === shared`, 'true'),
    c('getIntersectionNode returns null when lists never meet', `${LL}\ngetIntersectionNode(list(1, 2), list(1, 2, 3))`, 'null'),
    c('getIntersectionNode with identical heads and empty input', `${LL}\nconst a = list(1, 2);\n[getIntersectionNode(a, a) === a, getIntersectionNode(null, a)]`, '[true, null]'),
  ],
  'list-reverse-k-group': [
    c('reverseKGroup reverses full groups only', `${LL}\n[toArray(reverseKGroup(list(1, 2, 3, 4, 5), 2)), toArray(reverseKGroup(list(1, 2, 3, 4, 5), 3))]`, '[[2, 1, 4, 3, 5], [3, 2, 1, 4, 5]]'),
    c('reverseKGroup with k equal to the length and with k = 1', `${LL}\n[toArray(reverseKGroup(list(1, 2, 3, 4), 4)), toArray(reverseKGroup(list(1, 2, 3), 1))]`, '[[4, 3, 2, 1], [1, 2, 3]]'),
    c('reverseKGroup with k larger than the list', `${LL}\n[toArray(reverseKGroup(list(1, 2), 5)), reverseKGroup(null, 2)]`, '[[1, 2], null]'),
    c('reverseBetween reverses a middle segment', `${LL}\ntoArray(reverseBetween(list(1, 2, 3, 4, 5), 2, 4))`, '[1, 4, 3, 2, 5]'),
    c('reverseBetween can cover the whole list or a single node', `${LL}\n[toArray(reverseBetween(list(1, 2, 3, 4, 5), 1, 5)), toArray(reverseBetween(list(5), 1, 1)), toArray(reverseBetween(list(1, 2, 3), 2, 2))]`, '[[5, 4, 3, 2, 1], [5], [1, 2, 3]]'),
    c('reverseBetween ending at the tail', `${LL}\ntoArray(reverseBetween(list(1, 2, 3, 4), 3, 4))`, '[1, 2, 4, 3]'),
    c('swapPairs swaps neighbours', `${LL}\n[toArray(swapPairs(list(1, 2, 3, 4))), toArray(swapPairs(list(1, 2, 3)))]`, '[[2, 1, 4, 3], [2, 1, 3]]'),
    c('swapPairs: empty and single node', `${LL}\n[swapPairs(null), toArray(swapPairs(list(1)))]`, '[null, [1]]'),
    c('swapPairs relinks nodes rather than copying values', `${LL}\nconst a = list(1, 2);\nconst second = a.next;\nswapPairs(a) === second`, 'true'),
  ],
};
