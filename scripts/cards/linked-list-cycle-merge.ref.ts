function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow: ListNode<T> | null = head;
  let fast: ListNode<T> | null = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function mergeTwoLists(a: ListNode<number> | null, b: ListNode<number> | null): ListNode<number> | null {
  const dummy: ListNode<number> = { val: 0, next: null };
  let tail: ListNode<number> = dummy;
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
}
