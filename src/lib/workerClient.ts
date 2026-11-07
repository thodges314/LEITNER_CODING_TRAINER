import type { TopicItem } from './leitner';
import type { HarnessReport } from './testHelpers';
import type { WorkerLogMessage, WorkerResultMessage, WorkerRunMessage } from './sandboxWorker';

let activeWorker: Worker | null = null;
let activeTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Checks whether a card requires browser DOM APIs or React execution context.
 * Non-DOM, non-React cards (algorithms, data structures, utilities, async, node,
 * graphql, sql, language, etc.) can be offloaded safely to the Web Worker.
 */
export function isBrowserDomOrReactCard(card: TopicItem): boolean {
  if (
    card.track === 'react' ||
    card.track === 'react-components' ||
    card.track === 'd3' ||
    card.track === 'tailwind' ||
    card.track === 'dom-browser'
  ) {
    return true;
  }
  if (card.tags?.includes('dom')) {
    return true;
  }
  const harness = card.testHarness || '';
  const starter = card.starterCode || '';
  if (
    /\b(document\.|window\.|HTMLElement|customElements)\b/.test(harness) ||
    /\b(document\.|window\.|HTMLElement|customElements)\b/.test(starter)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if the current environment supports modern Web Workers with ES module loading.
 * False in Node.js / Vitest jsdom test environments.
 */
export function supportsWebWorker(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof Worker !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined'
  );
}

/** Forcefully terminates any currently executing worker thread to free CPU and unblock UI. */
export function terminateActiveWorker(): void {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = undefined;
  }
  if (activeWorker) {
    try {
      activeWorker.terminate();
    } catch {
      // ignore
    }
    activeWorker = null;
  }
}

export interface WorkerExecutionOptions {
  code: string;
  timeoutMs?: number;
  onLog?: (msg: WorkerLogMessage) => void;
}

export interface WorkerExecutionOutcome {
  report: HarnessReport;
  returnValue?: unknown;
}

/**
 * Runs code inside an isolated Web Worker. If execution exceeds `timeoutMs` (e.g. Due to
 * synchronous infinite loops or catastrophic regex backtracking), the worker thread
 * is forcefully killed with `worker.terminate()`, preventing browser tab lockups.
 */
export async function runInWorker(
  options: WorkerExecutionOptions
): Promise<WorkerExecutionOutcome> {
  const timeoutMs = options.timeoutMs ?? 8000;
  terminateActiveWorker();

  return new Promise((resolve) => {
    let worker: Worker | null = null;
    const id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const cleanup = () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = undefined;
      }
      if (worker) {
        try {
          worker.terminate();
        } catch {
          // ignore
        }
        if (activeWorker === worker) {
          activeWorker = null;
        }
        worker = null;
      }
    };

    activeTimer = setTimeout(() => {
      cleanup();

      const timeoutReport: HarnessReport = {
        ran: true,
        passCount: 0,
        failCount: 0,
        errorCount: 1,
        timedOut: true,
        passed: false,
        summary: '0 passed, 0 failed, 1 error(s), timed out',
        lines: [
          `[error] Execution timed out after ${timeoutMs}ms (terminated runaway worker thread to prevent tab freeze)`,
        ],
      };
      resolve({ report: timeoutReport });
    }, timeoutMs);

    try {
      // Vite bundles workers created via new URL(..., import.meta.url) into dedicated chunks
      worker = new Worker(new URL('./sandboxWorker.ts', import.meta.url), {
        type: 'module',
      });
      activeWorker = worker;

      worker.onmessage = (e: MessageEvent<WorkerLogMessage | WorkerResultMessage>) => {
        const data = e.data;
        if (!data || data.id !== id) return;

        if (data.type === 'log') {
          options.onLog?.(data);
        } else if (data.type === 'result') {
          cleanup();
          resolve({
            report: data.report,
            returnValue: data.returnValue,
          });
        }
      };

      worker.onerror = (e: ErrorEvent) => {
        cleanup();
        const errReport: HarnessReport = {
          ran: true,
          passCount: 0,
          failCount: 0,
          errorCount: 1,
          timedOut: false,
          passed: false,
          summary: '0 passed, 0 failed, 1 error(s)',
          lines: [`[error] Worker runtime error: ${e.message || String(e)}`],
        };
        resolve({ report: errReport });
      };

      const runMsg: WorkerRunMessage = {
        type: 'run',
        id,
        code: options.code,
        timeoutMs,
      };
      worker.postMessage(runMsg);
    } catch (err: unknown) {
      cleanup();
      const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      const errReport: HarnessReport = {
        ran: false,
        passCount: 0,
        failCount: 0,
        errorCount: 1,
        timedOut: false,
        passed: false,
        summary: `Worker initialization failed: ${errMsg}`,
        lines: [`[error] Worker initialization failed: ${errMsg}`],
      };
      resolve({ report: errReport });
    }
  });
}
