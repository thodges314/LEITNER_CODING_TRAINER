export type ConsoleLike = { log: (...args: unknown[]) => void };

export interface HarnessReport {
  /** True when the harness actually executed (a compile error or missing harness gives false). */
  ran: boolean;
  passCount: number;
  failCount: number;
  /** Uncaught exceptions or console.error output that was not an explicit FAIL. */
  errorCount: number;
  timedOut: boolean;
  /** True only when at least one PASS was seen and nothing failed, errored or timed out. */
  passed: boolean;
  summary: string;
  lines: string[];
}

/** Strict deep equality (NaN-aware, handles Date/Map/Set/arrays/holes/cycles) for harness assertions. */
export function deepEqualValues(a: unknown, b: unknown, seen = new WeakMap<object, object>()): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;
  seen.set(a, b);
  if (a instanceof Date) return a.getTime() === (b as Date).getTime();
  if (a instanceof Map) {
    const mb = b as Map<unknown, unknown>;
    if (a.size !== mb.size) return false;
    for (const [k, v] of a) if (!mb.has(k) || !deepEqualValues(v, mb.get(k), seen)) return false;
    return true;
  }
  if (a instanceof Set) {
    const sb = b as Set<unknown>;
    if (a.size !== sb.size) return false;
    for (const v of a) if (!sb.has(v)) return false;
    return true;
  }
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqualValues((a as never)[k], (b as never)[k], seen)
  );
}

export function show(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value instanceof Map) return `Map(${value.size}) ${show([...value])}`;
  if (value instanceof Set) return `Set(${value.size}) ${show([...value])}`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'function') return '[Function]';
  try {
    return JSON.stringify(value, (_k, v) => (v === undefined ? '__undefined__' : v))?.replace(/"__undefined__"/g, 'undefined') ?? String(value);
  } catch {
    return String(value);
  }
}

/**
 * `$test` helpers available to card harnesses. Each assertion prints one
 * `label: PASS` / `label: FAIL ...` line that the runner counts.
 */
export function createTestHelpers(out: ConsoleLike) {
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const CASE_TIMEOUT = 5000;
  const withTimeout = <T,>(p: Promise<T>) =>
    Promise.race([p, sleep(CASE_TIMEOUT).then(() => Promise.reject(new Error(`timed out after ${CASE_TIMEOUT} ms`)))]);

  function check(label: string, ok: unknown, ...details: unknown[]) {
    if (ok) out.log(`${label}:`, 'PASS');
    else out.log(`${label}:`, 'FAIL', ...details);
  }

  return {
    sleep,
    equal: (a: unknown, b: unknown) => deepEqualValues(a, b),
    check,
    /** Runs `fn` and compares its result with `expected()` using strict deep equality. */
    async run(label: string, fn: () => unknown, expected: () => unknown) {
      try {
        const actual = await withTimeout(Promise.resolve().then(fn));
        const want = expected();
        if (deepEqualValues(actual, want)) out.log(`${label}:`, 'PASS');
        else out.log(`${label}:`, 'FAIL', `received ${show(actual)}, expected ${show(want)}`);
      } catch (err) {
        out.log(`${label}:`, 'FAIL', `threw ${show(err)}`);
      }
    },
    /** Expects `fn` to reject/throw with an error whose "Name: message" matches `pattern`. */
    async rejects(label: string, fn: () => unknown, pattern: string) {
      try {
        const value = await withTimeout(Promise.resolve().then(fn));
        out.log(`${label}:`, 'FAIL', `resolved with ${show(value)} instead of rejecting`);
      } catch (err) {
        const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        if (new RegExp(pattern, 'i').test(text)) out.log(`${label}:`, 'PASS');
        else out.log(`${label}:`, 'FAIL', `rejected with ${show(text)}, expected /${pattern}/`);
      }
    },
    /** Runs `fn(console)` with a private console and compares the lines it logged. */
    async logs(label: string, fn: (c: ConsoleLike) => unknown, expected: () => unknown) {
      const captured: string[] = [];
      try {
        await withTimeout(Promise.resolve().then(() => fn({ log: (...a: unknown[]) => captured.push(a.join(' ')) })));
        await sleep(40);
        const want = expected();
        if (deepEqualValues(captured, want)) out.log(`${label}:`, 'PASS');
        else out.log(`${label}:`, 'FAIL', `received ${show(captured)}, expected ${show(want)}`);
      } catch (err) {
        out.log(`${label}:`, 'FAIL', `threw ${show(err)}`);
      }
    },
  };
}

export function stringifyArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    return String(arg);
  }
}

/** Classifies a single console call as a pass, fail, or neither. */
export function classifyLogLine(
  _method: 'log' | 'info' | 'warn' | 'error',
  args: unknown[]
): 'pass' | 'fail' | 'error' | 'neutral' {
  const text = args.map(stringifyArg).join(' ');
  if (/\bFAIL(ED)?\b/.test(text)) return 'fail';
  if (/\bPASS(ED)?\b/.test(text) && _method !== 'error') return 'pass';
  // console.error is plain output (solutions legitimately log errors); only uncaught exceptions count as errors.
  return 'neutral';
}
