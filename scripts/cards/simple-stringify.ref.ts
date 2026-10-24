function simpleStringify(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return '"' + escaped + '"';
  }
  if (Array.isArray(value)) {
    const parts = (value as unknown[]).map((item) => {
      const s = simpleStringify(item);
      return s === undefined ? 'null' : s;
    });
    return '[' + parts.join(',') + ']';
  }
  return undefined;
}
