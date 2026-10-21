function removeNthFromEnd<T>(head: ListNode<T> | null, n: number): ListNode<T> | null {
  const dummy: ListNode<T> = { val: (head ? head.val : (0 as unknown as T)), next: head };
  let fast: ListNode<T> | null = dummy;
  let slow: ListNode<T> | null = dummy;
  for (let i = 0; i < n; i++) {
    if (fast) fast = fast.next;
  }
  while (fast && fast.next) {
    fast = fast.next;
    slow = slow ? slow.next : null;
  }
  if (slow && slow.next) {
    slow.next = slow.next.next;
  }
  return dummy.next;
}

function reorderList<T>(head: ListNode<T> | null): void {
  if (!head || !head.next) return;
  let slow: ListNode<T> = head;
  let fast: ListNode<T> | null = head;
  while (fast && fast.next && fast.next.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }
  let second: ListNode<T> | null = slow.next;
  slow.next = null;
  let prev: ListNode<T> | null = null;
  while (second) {
    const next: ListNode<T> | null = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let first: ListNode<T> | null = head;
  second = prev;
  while (first && second) {
    const a: ListNode<T> | null = first.next;
    const b: ListNode<T> | null = second.next;
    first.next = second;
    second.next = a;
    first = a;
    second = b;
  }
}

function deleteDuplicates<T>(head: ListNode<T> | null): ListNode<T> | null {
  let node: ListNode<T> | null = head;
  while (node && node.next) {
    if (node.next.val === node.val) {
      node.next = node.next.next;
    } else {
      node = node.next;
    }
  }
  return head;
}
