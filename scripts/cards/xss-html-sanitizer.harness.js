const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'I', 'LI',
  'OL', 'P', 'PRE', 'SPAN', 'STRONG', 'UL',
]);
const DROP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED',
  'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH',
]);

await $test.run(
  'Preserves safe formatting tags and relative/HTTPS links',
  async () => sanitizeHtml('<p>Hello <strong>world</strong>! <a href="https://example.com" target="_blank">Docs</a></p>'),
  () => '<p>Hello <strong>world</strong>! <a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a></p>'
);

await $test.run(
  'Removes script, iframe, and style elements completely',
  async () => sanitizeHtml('<div>Safe<script>alert(1)</script><iframe src="https://evil.com"></iframe><style>body{display:none}</style></div>'),
  () => '<div>Safe</div>'
);

await $test.run(
  'Strips inline event handlers and obfuscated javascript: hrefs',
  async () => sanitizeHtml('<p onclick="steal()">Click</p><a href="java\nscript:alert(1)">Bad</a>'),
  () => '<p>Click</p><a>Bad</a>'
);

await $test.run(
  'Unwraps non-allowlisted benign tags while preserving text',
  async () => sanitizeHtml('<custom-tag>Keep <em>text</em></custom-tag>'),
  () => 'Keep <em>text</em>'
);

