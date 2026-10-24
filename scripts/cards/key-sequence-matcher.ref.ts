function createSequenceMatcher(
  bindings: Record<string, string>,
  timeoutMs = 1000,
): (key: string, now: number) => string | null {
  const sequences = Object.keys(bindings).map((s) => s.split(' '));
  const startsWith = (seq: string[], prefix: string[]): boolean => prefix.every((key, i) => seq[i] === key);
  let buffer: string[] = [];
  let last = -Infinity;

  return function press(key: string, now: number): string | null {
    if (now - last > timeoutMs) buffer = [];
    last = now;

    let attempt = [...buffer, key];
    if (!sequences.some((s) => startsWith(s, attempt))) attempt = [key];

    const exact = sequences.find((s) => s.length === attempt.length && startsWith(s, attempt));
    if (exact) {
      buffer = [];
      return bindings[exact.join(' ')];
    }
    buffer = sequences.some((s) => startsWith(s, attempt)) ? attempt : [];
    return null;
  };
}
