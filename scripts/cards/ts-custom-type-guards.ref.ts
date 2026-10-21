function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isError(val: unknown): val is Error {
  return val instanceof Error || (isRecord(val) && typeof (val as Record<string, unknown>).message === 'string');
}
