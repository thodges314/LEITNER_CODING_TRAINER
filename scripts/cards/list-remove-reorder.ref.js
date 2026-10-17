function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: head };
  let fast = dummy;
  let slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}

function reorderList(head) {
  if (!head || !head.next) return;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let first = head;
  second = prev;
  while (second) {
    const a = first.next;
    const b = second.next;
    first.next = second;
    second.next = a;
    first = a;
    second = b;
  }
}

function deleteDuplicates(head) {
  let node = head;
  while (node && node.next) {
    if (node.next.val === node.val) node.next = node.next.next;
    else node = node.next;
  }
  return head;
}
