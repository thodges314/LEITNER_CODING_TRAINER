import { createMockFetch } from './mockFetch';
import { createTestHelpers, classifyLogLine, stringifyArg } from './testHelpers';
import type { HarnessReport } from './testHelpers';
import { loadSandboxLibrariesForCode } from './sandboxLibraries';
import { NextResponse, NextRequest, revalidateTag, revalidatePath, after, flushAfterTasks, resetAfterTasks } from '../utils/nextSandbox';

export interface WorkerRunMessage {
  type: 'run';
  id: string;
  code: string;
  timeoutMs: number;
}

export interface WorkerLogMessage {
  type: 'log';
  id: string;
  method: 'log' | 'info' | 'warn' | 'error';
  text: string;
  args: unknown[];
}

export interface WorkerResultMessage {
  type: 'result';
  id: string;
  report: HarnessReport;
  returnValue?: unknown;
}

export interface WorkerErrorMessage {
  type: 'error';
  id: string;
  error: string;
}

function serializeSafe(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'bigint') return `${value.toString()}n`;
    return value;
  }
  if (seen.has(value as object)) {
    return '[Circular]';
  }
  seen.add(value as object);

  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof RegExp) {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeSafe(item, seen));
  }
  if (value instanceof Map) {
    return Array.from(value.entries()).map(([k, v]) => [serializeSafe(k, seen), serializeSafe(v, seen)]);
  }
  if (value instanceof Set) {
    return Array.from(value.values()).map((v) => serializeSafe(v, seen));
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    try {
      result[key] = serializeSafe((value as Record<string, unknown>)[key], seen);
    } catch {
      result[key] = '[Unserializable]';
    }
  }
  return result;
}

self.onmessage = async (e: MessageEvent<WorkerRunMessage>) => {
  const { type, id, code } = e.data;
  if (type !== 'run') return;

  const lines: string[] = [];
  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;

  const make =
    (method: 'log' | 'info' | 'warn' | 'error') =>
    (...args: unknown[]) => {
      const text = args.map(stringifyArg).join(' ');
      lines.push(`[${method}] ${text}`);
      const kind = classifyLogLine(method, args);
      if (kind === 'pass') passCount++;
      else if (kind === 'fail') failCount++;
      else if (kind === 'error') errorCount++;

      const logMsg: WorkerLogMessage = {
        type: 'log',
        id,
        method,
        text,
        args: args.map((a) => serializeSafe(a)),
      };
      self.postMessage(logMsg);
    };

  const workerConsole = {
    log: make('log'),
    info: make('info'),
    warn: make('warn'),
    error: make('error'),
  };

  const realFetch = typeof fetch === 'function' ? fetch.bind(globalThis) : undefined;
  const mockFetch = createMockFetch(realFetch);
  const testHelpers = createTestHelpers(workerConsole);
  const articlesStore = new Map<string, unknown>();
  const membersStore = new Map<string, unknown>();
  const libraries = await loadSandboxLibrariesForCode(code, undefined, { includeDomLibs: false });
  const PGlite = libraries.PGlite;
  const executeGraphql = libraries.graphql?.graphql;
  const buildSchema = libraries.graphql?.buildSchema;
  const parseGraphql = libraries.graphql?.parse;
  const validateGraphql = libraries.graphql?.validate;

  const requireShim = (mod: string) => {
    if (mod === 'graphql' && libraries.graphql) {
      return {
        default: { graphql: executeGraphql, buildSchema, parse: parseGraphql, validate: validateGraphql },
        graphql: executeGraphql,
        buildSchema,
        parse: parseGraphql,
        validate: validateGraphql,
      };
    }
    if (mod === 'next/server') return { default: { NextResponse, NextRequest, after }, NextResponse, NextRequest, after };
    if (mod === 'next/cache') return { default: { revalidateTag, revalidatePath }, revalidateTag, revalidatePath };
    throw new Error(`Cannot find module '${mod}' in sandbox worker`);
  };

  const sandboxNames = [
    'console',
    '$test',
    'fetch',
    'require',
    'PGlite',
    'graphql',
    'buildSchema',
    'parseGraphql',
    'validateGraphql',
    'NextResponse',
    'NextRequest',
    'revalidateTag',
    'revalidatePath',
    'articlesStore',
    'membersStore',
    'after',
    'flushAfterTasks',
    'resetAfterTasks',
  ];

  const sandboxValues = [
    workerConsole,
    testHelpers,
    mockFetch,
    requireShim,
    PGlite,
    executeGraphql,
    buildSchema,
    parseGraphql,
    validateGraphql,
    NextResponse,
    NextRequest,
    revalidateTag,
    revalidatePath,
    articlesStore,
    membersStore,
    after,
    flushAfterTasks,
    resetAfterTasks,
  ];

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(...sandboxNames, code);
    const result = await fn(...sandboxValues);

    // Give timer-based assertions a brief moment to settle
    await new Promise((r) => setTimeout(r, 200));

    const passed = passCount > 0 && failCount === 0 && errorCount === 0;
    const summary =
      `${passCount} passed, ${failCount} failed` +
      (errorCount ? `, ${errorCount} error(s)` : '');

    const report: HarnessReport = {
      ran: true,
      passCount,
      failCount,
      errorCount,
      timedOut: false,
      passed,
      summary,
      lines,
    };

    const reply: WorkerResultMessage = {
      type: 'result',
      id,
      report,
      returnValue: serializeSafe(result),
    };
    self.postMessage(reply);
  } catch (err: unknown) {
    const isInfiniteLoop = err instanceof Error && err.message.includes('infinite loop detected');
    const errMsg = stringifyArg(err);
    workerConsole.error(err instanceof Error ? err.stack || errMsg : errMsg);

    const report: HarnessReport = {
      ran: true,
      passCount,
      failCount,
      errorCount,
      timedOut: isInfiniteLoop,
      passed: false,
      summary: `${passCount} passed, ${failCount} failed, ${errorCount} error(s)` + (isInfiniteLoop ? ', timed out' : ''),
      lines,
    };

    const reply: WorkerResultMessage = {
      type: 'result',
      id,
      report,
    };
    self.postMessage(reply);
  }
};
