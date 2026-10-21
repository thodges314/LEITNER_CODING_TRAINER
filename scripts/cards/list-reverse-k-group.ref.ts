function reverseKGroup<T>(head: ListNode<T> | null, k: number): ListNode<T> | null {
  let probe: ListNode<T> | null = head;
  for (let i = 0; i < k; i++) {
    if (!probe) return head;
    probe = probe.next;
  }
  let prev: ListNode<T> | null = reverseKGroup(probe, k);
  let cur: ListNode<T> | null = head;
  for (let i = 0; i < k; i++) {
    if (!cur) break;
    const next: ListNode<T> | null = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

function reverseBetween<T>(head: ListNode<T> | null, left: number, right: number): ListNode<T> | null {
  const dummy: ListNode<T> = { val: (head ? head.val : (0 as unknown as T)), next: head };
  let prev: ListNode<T> | null = dummy;
  for (let i = 0; i < left - 1; i++) {
    if (prev) prev = prev.next;
  }
  if (!prev || !prev.next) return dummy.next;
  const cur: ListNode<T> = prev.next;
  for (let i = 0; i < right - left; i++) {
    const move: ListNode<T> | null = cur.next;
    if (!move) break;
    cur.next = move.next;
    move.next = prev.next;
    prev.next = move;
  }
  return dummy.next;
}

function swapPairs<T>(head: ListNode<T> | null): ListNode<T> | null {
  const dummy: ListNode<T> = { val: (head ? head.val : (0 as unknown as T)), next: head };
  let prev: ListNode<T> | null = dummy;
  while (prev && prev.next && prev.next.next) {
    const a: ListNode<T> = prev.next;
    const b: ListNode<T> = a.next!;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}
