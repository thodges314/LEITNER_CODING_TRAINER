import React from 'react';
import { createPortal } from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import type { TopicItem } from './leitner';
import { createMockFetch } from './mockFetch';
import { createDomTools, MockIntersectionObserver } from './domTools';
import type { DomTools } from './domTools';
import { isTsOnlyCard } from './tsOnly';

export type ExecutionMode = 'js' | 'ts';

export interface TranspileOutcome {
  ok: boolean;
  code: string;
  /** Compiler / syntax diagnostics, already formatted for display. */
  diagnostics: Array<{ type: 'error' | 'warn'; formatted: string }>;
}

/**
 * Transpiles TS/JSX to executable JS. Sucrase and the TypeScript compiler are
 * loaded on demand so they stay out of the initial bundle.
 */
export async function transpileForExecution(
  code: string,
  mode: ExecutionMode,
  loopTimeoutMs = 3000
): Promise<TranspileOutcome> {
  const diagnostics: TranspileOutcome['diagnostics'] = [];

  if (mode === 'ts') {
    const { checkAndTranspileTS } = await import('../utils/typeChecker');
    const result = checkAndTranspileTS(code);
    for (const d of result.diagnostics) {
      diagnostics.push({ type: d.type, formatted: d.formatted });
    }
    // Halt on strict type errors so mismatched interfaces cannot pass silently.
    if (!result.success) return { ok: false, code: '', diagnostics };
  }

  try {
    const { transform } = await import('sucrase');
    const out = transform(code, { transforms: ['typescript', 'jsx', 'imports'] });
    const { injectLoopGuards } = await import('./loopGuards');
    const guardedCode = injectLoopGuards(out.code, loopTimeoutMs);
    return { ok: true, code: guardedCode, diagnostics };
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    diagnostics.push({ type: 'error', formatted: `Transpilation Error: ${msg}` });
    return { ok: false, code: '', diagnostics };
  }
}

type ConsoleLike = { log: (...args: unknown[]) => void };

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

function show(value: unknown): string {
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

/** Built-in prototypes that user code may monkey-patch (polyfill cards). They are restored after every run. */
const PATCHABLE_PROTOTYPES: Array<object | undefined> = [
  Object.prototype,
  Function.prototype,
  Array.prototype,
  String.prototype,
  Number.prototype,
  Boolean.prototype,
  Promise.prototype,
  Map.prototype,
  Set.prototype,
  WeakMap.prototype,
  Date.prototype,
  RegExp.prototype,
  Error.prototype,
];

function snapshotBuiltins() {
  const saved = PATCHABLE_PROTOTYPES.filter((p): p is object => Boolean(p)).map((proto) => ({
    proto,
    descriptors: Object.getOwnPropertyDescriptors(proto),
  }));
  return () => {
    for (const { proto, descriptors } of saved) {
      for (const key of Reflect.ownKeys(proto)) {
        if (!(key in descriptors)) Reflect.deleteProperty(proto, key);
      }
      for (const key of Reflect.ownKeys(descriptors)) {
        const d = (descriptors as Record<string | symbol, PropertyDescriptor>)[key];
        const current = Object.getOwnPropertyDescriptor(proto, key);
        if (!current || current.value !== d.value || current.get !== d.get || current.set !== d.set) {
          try {
            Object.defineProperty(proto, key, d);
          } catch {
            /* non-configurable: leave as is */
          }
        }
      }
    }
  };
}

const SANDBOX_NAMES = [
  'require',
  'console',
  'React',
  'ReactDOM',
  'mount',
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useReducer',
  'useMemo',
  'useCallback',
  'useContext',
  'useId',
  'useSyncExternalStore',
  'useImperativeHandle',
  'forwardRef',
  'createContext',
  'use',
  'Suspense',
  'startTransition',
  'useTransition',
  'useDeferredValue',
  'useOptimistic',
  'useActionState',
  'fetch',
  'IntersectionObserver',
  '$dom',
  '$test',
] as const;

export interface SandboxScope {
  names: readonly string[];
  values: unknown[];
  /** Tears down anything the sandbox rendered (components, portals, observers). */
  cleanup(): void;
}

/**
 * Builds the free variables available to user code and harnesses:
 * React + hooks, a ReactDOM with createPortal, a deterministic fetch, a mock
 * IntersectionObserver and the `$dom` test tools (render, renderHook, fire, wait, ...) and `$test` assertion helpers.
 */
export function createSandboxScope(options: {
  console: unknown;
  mount: (...args: never[]) => void;
  reactDOM: Record<string, unknown>;
}): SandboxScope {
  let tools: DomTools | null = null;
  const restoreBuiltins = snapshotBuiltins();
  const lazyDom = new Proxy({} as DomTools, {
    get(_t, prop) {
      tools ??= createDomTools();
      return tools[prop as keyof DomTools];
    },
  });
  const realFetch = typeof fetch === 'function' ? fetch.bind(globalThis) : undefined;
  const customReactDOM = { ...ReactDOMClient, createPortal, ...options.reactDOM };
  const requireShim = (mod: string) => {
    if (mod === 'react') return { default: React, ...React };
    if (mod === 'react-dom') return { default: customReactDOM, ...customReactDOM };
    if (mod === 'react-dom/client') return { default: customReactDOM, ...customReactDOM };
    throw new Error(`Cannot find module '${mod}' in browser sandbox`);
  };
  const values: unknown[] = [
    requireShim,
    options.console,
    React,
    customReactDOM,
    options.mount,
    React.useState,
    React.useEffect,
    React.useLayoutEffect,
    React.useRef,
    React.useReducer,
    React.useMemo,
    React.useCallback,
    React.useContext,
    React.useId,
    React.useSyncExternalStore,
    React.useImperativeHandle,
    React.forwardRef,
    React.createContext,
    React.use,
    React.Suspense,
    React.startTransition,
    React.useTransition,
    React.useDeferredValue,
    React.useOptimistic,
    React.useActionState,
    createMockFetch(realFetch),
    MockIntersectionObserver,
    lazyDom,
    createTestHelpers(options.console as ConsoleLike),
  ];
  return {
    names: SANDBOX_NAMES,
    values,
    cleanup() {
      try {
        tools?.cleanup();
      } finally {
        tools = null;
        restoreBuiltins();
      }
    },
  };
}

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

const notRun = (summary: string, errorCount = 0): HarnessReport => ({
  ran: false,
  passCount: 0,
  failCount: 0,
  errorCount,
  timedOut: false,
  passed: false,
  summary,
  lines: [],
});

function stringifyArg(arg: unknown): string {
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

/**
 * Whether the buffer already contains the (uncommented) harness, in which case it
 * must not be appended a second time.
 */
export function bufferContainsHarness(code: string, harness: string): boolean {
  const first = harness
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!first) return false;
  return code.split('\n').some((l) => l.trim() === first);
}

/**
 * Runs the user's code followed by the card's test harness without any UI,
 * counting PASS/FAIL console output. This is the source of truth for pass/fail.
 */
export async function runHarness(
  card: TopicItem,
  code: string,
  mode: ExecutionMode,
  timeoutMs = 8000
): Promise<HarnessReport> {
  const harness = card.testHarness?.trim();
  if (!harness) return notRun('No test harness is defined for this card.');

  // Type-level checks (@ts-expect-error in the harness) only mean something under strict checking.
  if (isTsOnlyCard(card)) mode = 'ts';

  const combined = bufferContainsHarness(code, harness) ? code : `${code}\n\n${harness}\n`;

  // In TS mode, strictly type-check the user's solution (or combined buffer for typescript-patterns puzzles).
  if (mode === 'ts') {
    const codeToCheck = isTsOnlyCard(card) ? combined : code;
    const { checkAndTranspileTS } = await import('../utils/typeChecker');
    const tsCheck = checkAndTranspileTS(codeToCheck);
    if (!tsCheck.success) {
      return notRun(`Code did not compile: ${tsCheck.diagnostics.map((d) => d.formatted).join('; ')}`, 1);
    }
  }

  const transpiled = await transpileForExecution(combined, 'js', Math.min(timeoutMs, 3000));
  if (!transpiled.ok) {
    return notRun(`Code did not compile: ${transpiled.diagnostics.map((d) => d.formatted).join('; ')}`, 1);
  }

  const lines: string[] = [];
  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;

  const make =
    (method: 'log' | 'info' | 'warn' | 'error') =>
    (...args: unknown[]) => {
      lines.push(`[${method}] ${args.map(stringifyArg).join(' ')}`);
      const kind = classifyLogLine(method, args);
      if (kind === 'pass') passCount++;
      else if (kind === 'fail') failCount++;
      else if (kind === 'error') errorCount++;
    };
  const sandboxConsole = { log: make('log'), info: make('info'), warn: make('warn'), error: make('error') };

  // Components mounted via mount()/createRoot() by user code are not previewed during headless grading.
  const scope = createSandboxScope({
    console: sandboxConsole,
    mount: () => {},
    reactDOM: { createRoot: () => ({ render: () => {}, unmount: () => {} }) },
  });

  let timedOut = false;
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(...scope.names, transpiled.code);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), timeoutMs);
    });
    const run = fn(...scope.values);
    const outcome = await Promise.race([run, timeout]);
    clearTimeout(timer);
    if (outcome === 'timeout') timedOut = true;
    // Give timer-based assertions (setTimeout in harnesses) a moment to log.
    else await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    const isInfiniteLoop = err instanceof Error && err.message.includes('infinite loop detected');
    if (isInfiniteLoop) {
      timedOut = true;
    }
    errorCount++;
    lines.push(`[error] ${stringifyArg(err)}`);
  } finally {
    try {
      scope.cleanup();
    } catch (err) {
      lines.push(`[warn] cleanup failed: ${stringifyArg(err)}`);
    }
  }

  const passed = passCount > 0 && failCount === 0 && errorCount === 0 && !timedOut;
  const summary =
    `${passCount} passed, ${failCount} failed` + (errorCount ? `, ${errorCount} error(s)` : '') + (timedOut ? ', timed out' : '');
  return { ran: true, passCount, failCount, errorCount, timedOut, passed, summary, lines };
}

/**
 * Runs arbitrary JavaScript code inside an isolated Web Worker thread with a hard timeout.
 * If execution exceeds `timeoutMs`, the worker thread is forcefully terminated
 * via `worker.terminate()`, safely recovering from synchronous infinite loops.
 */
export async function runWithTimeout(code: string, timeoutMs = 3000): Promise<unknown> {
  const { injectLoopGuards } = await import('./loopGuards');
  const guardedCode = injectLoopGuards(code, timeoutMs);

  return new Promise((resolve, reject) => {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      // Non-browser environment fallback (Node / Vitest jsdom)
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction(guardedCode);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise((_, rej) => {
        timer = setTimeout(
          () => rej(new Error(`Execution timed out after ${timeoutMs}ms (infinite loop detected)`)),
          timeoutMs
        );
      });
      Promise.race([fn(), timeoutPromise])
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
      return;
    }

    const workerScript = `
      self.onmessage = async () => {
        try {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
          const fn = new AsyncFunction(${JSON.stringify(guardedCode)});
          const result = await fn();
          self.postMessage({ type: 'success', result });
        } catch (err) {
          self.postMessage({ type: 'error', error: err instanceof Error ? err.message : String(err) });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    let worker: Worker | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (worker) {
        worker.terminate();
        worker = null;
      }
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {
        // ignore
      }
    };

    try {
      worker = new Worker(blobUrl);

      timer = setTimeout(() => {
        cleanup(); // Forcefully kills the OS execution thread
        reject(new Error(`Execution timed out after ${timeoutMs}ms (infinite loop detected)`));
      }, timeoutMs);

      worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        cleanup();
        if (data.type === 'error') {
          reject(new Error(data.error));
        } else {
          resolve(data.result);
        }
      };

      worker.onerror = (e: ErrorEvent) => {
        cleanup();
        reject(new Error(e.message || 'Worker execution error'));
      };

      worker.postMessage({ run: true });
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

