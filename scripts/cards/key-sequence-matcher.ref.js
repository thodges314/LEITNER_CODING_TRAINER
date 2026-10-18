function createSequenceMatcher(bindings, timeoutMs = 1000) {
  const sequences = Object.keys(bindings).map((s) => s.split(' '));
  const startsWith = (seq, prefix) => prefix.every((key, i) => seq[i] === key);
  let buffer = [];
  let last = -Infinity;

  return function press(key, now) {
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
