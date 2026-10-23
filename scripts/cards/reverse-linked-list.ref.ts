function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  if (head === null) return head;
  let prev: ListNode<T> | null = null;
  while (head.next != null) {
    const next: ListNode<T> | null = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  head.next = prev;
  return head;
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
