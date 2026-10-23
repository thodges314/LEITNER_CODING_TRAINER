function reverseList(head) {
  if (head === null) return head;
  let prev = null;
  while (head.next !== null) {
    const next = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  head.next = prev;
  return head;
}

function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
