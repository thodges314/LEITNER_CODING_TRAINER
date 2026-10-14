import React from 'react';
import ReactDOM from 'react-dom/client';
import type { TopicItem } from './leitner';

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
export async function transpileForExecution(code: string, mode: ExecutionMode): Promise<TranspileOutcome> {
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
    const out = transform(code, { transforms: ['typescript', 'jsx'] });
    return { ok: true, code: out.code, diagnostics };
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    diagnostics.push({ type: 'error', formatted: `Transpilation Error: ${msg}` });
    return { ok: false, code: '', diagnostics };
  }
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

/** Classifies a single console call as a pass, fail, error, or neither. */
export function classifyLogLine(
  method: 'log' | 'info' | 'warn' | 'error',
  args: unknown[]
): 'pass' | 'fail' | 'error' | 'neutral' {
  const text = args.map(stringifyArg).join(' ');
  if (/\bFAIL(ED)?\b/.test(text)) return 'fail';
  if (method === 'error') return 'error';
  if (/\bPASS(ED)?\b/.test(text)) return 'pass';
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

  const combined = bufferContainsHarness(code, harness) ? code : `${code}\n\n${harness}\n`;
  const transpiled = await transpileForExecution(combined, mode);
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

  // Components mounted by the harness are not rendered during headless evaluation.
  const mount = () => {};
  const headlessReactDOM = {
    ...ReactDOM,
    createRoot: () => ({ render: () => {}, unmount: () => {} }),
  };

  let timedOut = false;
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(
      'console',
      'React',
      'ReactDOM',
      'mount',
      'useState',
      'useEffect',
      'useRef',
      'useReducer',
      'useMemo',
      'useCallback',
      'useContext',
      'createContext',
      transpiled.code
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), timeoutMs);
    });
    const run = fn(
      sandboxConsole,
      React,
      headlessReactDOM,
      mount,
      React.useState,
      React.useEffect,
      React.useRef,
      React.useReducer,
      React.useMemo,
      React.useCallback,
      React.useContext,
      React.createContext
    );
    const outcome = await Promise.race([run, timeout]);
    clearTimeout(timer);
    if (outcome === 'timeout') timedOut = true;
    // Give timer-based assertions (setTimeout in harnesses) a moment to log.
    else await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    errorCount++;
    lines.push(`[error] ${stringifyArg(err)}`);
  }

  const passed = passCount > 0 && failCount === 0 && errorCount === 0 && !timedOut;
  const summary =
    `${passCount} passed, ${failCount} failed` + (errorCount ? `, ${errorCount} error(s)` : '') + (timedOut ? ', timed out' : '');
  return { ran: true, passCount, failCount, errorCount, timedOut, passed, summary, lines };
}
