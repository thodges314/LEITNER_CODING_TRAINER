function reverseKGroup(head, k) {
  let probe = head;
  for (let i = 0; i < k; i++) {
    if (!probe) return head;
    probe = probe.next;
  }
  let prev = reverseKGroup(probe, k);
  let cur = head;
  for (let i = 0; i < k; i++) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

function reverseBetween(head, left, right) {
  const dummy = { val: 0, next: head };
  let prev = dummy;
  for (let i = 0; i < left - 1; i++) prev = prev.next;
  const cur = prev.next;
  for (let i = 0; i < right - left; i++) {
    const move = cur.next;
    cur.next = move.next;
    move.next = prev.next;
    prev.next = move;
  }
  return dummy.next;
}

function swapPairs(head) {
  const dummy = { val: 0, next: head };
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next;
    const b = a.next;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}
