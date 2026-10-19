/**
 * Strips the bottom test runner example block from user code before sending to the preview iframe.
 * The test runner section (e.g. `// Test runner example:`) is meant for headless evaluation / test
 * harness runs, whereas the preview iframe renders the live interactive component demo.
 */
export function stripTestRunnerBlock(rawCode: string): string {
  const markerRegex = /(?:\r?\n|^)[ \t]*\/\/[ \t]*Test runner example:[^\n]*(?:\r?\n|$)/i;
  const match = markerRegex.exec(rawCode);
  if (match && match.index !== undefined) {
    return rawCode.slice(0, match.index).trimEnd();
  }
  const fallbackMarker = '// Test runner example:';
  const idx = rawCode.indexOf(fallbackMarker);
  if (idx !== -1) {
    return rawCode.slice(0, idx).trimEnd();
  }
  return rawCode;
}
