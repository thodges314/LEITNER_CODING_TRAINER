Binary search finds a target value in a **sorted** array by repeatedly checking the middle element and eliminating the half of the search range where the target cannot live.

```array-trace
{
  "title": "Step-by-step trace for binarySearch([-1, 0, 3, 5, 9, 12, 18, 24, 31], 24):",
  "rows": [
    {
      "caption": "1. Check the middle of indices 0–8 (value 9 at index 4):",
      "items": [
        { "value": -1, "index": 0 },
        { "value": 0, "index": 1 },
        { "value": 3, "index": 2 },
        { "value": 5, "index": 3 },
        { "value": 9, "index": 4, "state": "mid" },
        { "value": 12, "index": 5 },
        { "value": 18, "index": 6 },
        { "value": 24, "index": 7 },
        { "value": 31, "index": 8 }
      ]
    },
    {
      "caption": "Since 24 > 9, discard indices 0–4:",
      "items": [
        { "value": -1, "index": 0, "state": "removed" },
        { "value": 0, "index": 1, "state": "removed" },
        { "value": 3, "index": 2, "state": "removed" },
        { "value": 5, "index": 3, "state": "removed" },
        { "value": 9, "index": 4, "state": "removed" },
        { "value": 12, "index": 5 },
        { "value": 18, "index": 6 },
        { "value": 24, "index": 7 },
        { "value": 31, "index": 8 }
      ]
    },
    {
      "caption": "2. Check the middle of the remaining range (indices 5–8, value 18 at index 6 — with an even number of elements, pick the last element of the left half):",
      "offset": 5,
      "items": [
        { "value": 12, "index": 5 },
        { "value": 18, "index": 6, "state": "mid" },
        { "value": 24, "index": 7 },
        { "value": 31, "index": 8 }
      ]
    },
    {
      "caption": "Since 24 > 18, discard indices 5–6:",
      "offset": 5,
      "items": [
        { "value": 12, "index": 5, "state": "removed" },
        { "value": 18, "index": 6, "state": "removed" },
        { "value": 24, "index": 7 },
        { "value": 31, "index": 8 }
      ]
    },
    {
      "caption": "3. Check the middle of indices 7–8 (value 24 at index 7). Match found — return 7:",
      "offset": 7,
      "items": [
        { "value": 24, "index": 7, "state": "found" },
        { "value": 31, "index": 8 }
      ]
    }
  ]
}
```

