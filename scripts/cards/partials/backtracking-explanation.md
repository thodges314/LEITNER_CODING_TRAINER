#### How Backtracking Works
Think of backtracking like exploring a **decision tree with a pencil and an eraser**: pick one option, follow it until you hit a full answer (save it!) or a dead end, and then **erase your last choice** ("backtrack") to try the next branch:

```decision-tree
{
  "title": "Backtracking Decision Tree: binaryStrings(2)",
  "caption": "Walk down from \"\" → choose '0' → choose '0' (\"00\", save!) → backtrack to \"0\" → choose '1' (\"01\", save!) → backtrack to \"\" → explore '1' for \"10\" and \"11\":",
  "root": {
    "label": "\"\"",
    "state": "root",
    "children": [
      {
        "label": "\"0\"",
        "edgeLabel": "+'0'",
        "state": "branch",
        "children": [
          { "label": "\"00\"", "edgeLabel": "+'0'", "state": "solution" },
          { "label": "\"01\"", "edgeLabel": "+'1'", "state": "solution" }
        ]
      },
      {
        "label": "\"1\"",
        "edgeLabel": "+'1'",
        "state": "branch",
        "children": [
          { "label": "\"10\"", "edgeLabel": "+'0'", "state": "solution" },
          { "label": "\"11\"", "edgeLabel": "+'1'", "state": "solution" }
        ]
      }
    ]
  },
  "steps": [
    { "label": "Choose", "detail": "Pick a valid next step (push to path or mark visited)." },
    { "label": "Explore", "detail": "Recurse deeper from that updated state." },
    { "label": "Unchoose (Backtrack)", "detail": "Undo that step (pop / unmark) before trying the next branch." }
  ]
}
```