function isDefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

function assertDefined<T>(val: T, message?: string): asserts val is NonNullable<T> {
  if (val === null || val === undefined) {
    throw new TypeError(message || 'Value is null or undefined');
  }
}

function assertCondition(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertRecord(val: unknown, message?: string): asserts val is Record<string, unknown> {
  if (val === null || typeof val !== 'object' || Array.isArray(val)) {
    throw new TypeError(message || 'Value is not a record object');
  }
}
