function addTwoNumbers(l1: ListNode<number> | null, l2: ListNode<number> | null): ListNode<number> | null {
  const dummy: ListNode<number> = { val: 0, next: null };
  let tail: ListNode<number> = dummy;
  let carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    tail.next = { val: sum % 10, next: null };
    tail = tail.next;
    l1 = l1 ? l1.next : null;
    l2 = l2 ? l2.next : null;
  }
  return dummy.next;
}

function oddEvenList<T>(head: ListNode<T> | null): ListNode<T> | null {
  if (!head || !head.next) return head;
  let odd: ListNode<T> = head;
  let even: ListNode<T> | null = head.next;
  const evenHead: ListNode<T> | null = even;
  while (even && even.next) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead;
  return head;
}

function getIntersectionNode<T>(a: ListNode<T> | null, b: ListNode<T> | null): ListNode<T> | null {
  let p: ListNode<T> | null = a;
  let q: ListNode<T> | null = b;
  while (p !== q) {
    p = p ? p.next : b;
    q = q ? q.next : a;
  }
  return p;
}
