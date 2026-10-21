function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let cur: ListNode<T> | null = head;
  while (cur) {
    const next: ListNode<T> | null = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

function middleNode<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow: ListNode<T> | null = head;
  let fast: ListNode<T> | null = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}
