#### How a Singly Linked List Works
A singly linked list is a chain of `{ val, next }` node objects accessed via a pointer to the first node (`head`, or `null` if the list is empty). `head.val` holds the first node's value, `head.next` points to the second node, and each `.next` links onward until the last node's `.next` is `null`:

```linked-list
{
  "rows": [
    {
      "caption": "list(1, 2, 3, 4) — head points to node 1; the last node points to null:",
      "nodes": [
        { "val": 1, "pointers": ["head"], "state": "active" },
        { "val": 2 },
        { "val": 3 },
        { "val": 4 }
      ]
    }
  ]
}
```
