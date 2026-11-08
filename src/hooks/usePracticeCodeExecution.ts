import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { getCardInputLanguage } from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';
import {
  transpileForExecution,
  createSandboxScope,
  prepareSqlCode,
  prepareGraphqlCode,
  prepareHtmlCode,
  bufferContainsHarness,
  classifyLogLine,
} from '../lib/runner';
import { loadSandboxLibrariesForCode } from '../lib/sandboxLibraries';
import {
  runInWorker,
  supportsWebWorker,
  isBrowserDomOrReactCard,
} from '../lib/workerClient';
import { formatConsoleArg, formatAssertionFailure } from '../components/practice/consoleFormat';
import type { ConsoleLogEntry } from '../components/practice/consoleFormat';

export interface UsePracticeCodeExecutionOptions {
  currentCard: TopicItem | null;
  code: string;
  executionMode: 'js' | 'ts';
  isTsTrack: boolean;
}

export function usePracticeCodeExecution({
  currentCard,
  code,
  executionMode,
  isTsTrack,
}: UsePracticeCodeExecutionOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [outputLogs, setOutputLogs] = useState<ConsoleLogEntry[]>([]);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [mountedComponent, setMountedComponent] = useState<{
    element: React.ReactElement;
    key: number;
  } | null>(null);
  const [isPreviewLive, setIsPreviewLive] = useState<boolean>(false);
  const [previewRunTrigger, setPreviewRunTrigger] = useState<number>(0);

  const appendConsoleLog = (type: 'log' | 'warn' | 'error' | 'info', content: string) => {
    const now = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setOutputLogs((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: now,
      },
    ]);
    if (type === 'error') {
      setExecutionStatus('error');
    }
  };

  const handleRunCode = async () => {
    setIsPreviewLive(true);
    setPreviewRunTrigger((c) => c + 1);
    if (!code.trim() || isRunning) return;
    setIsOutputOpen(true);
    setIsRunning(true);
    setExecutionStatus('running');

    const logs: ConsoleLogEntry[] = [];
    const now = () =>
      new Date().toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

    const appendLog = (type: 'log' | 'warn' | 'error' | 'info', ...args: unknown[]) => {
      const failFormatted = formatAssertionFailure(args, currentCard);
      const isFail = Boolean(failFormatted);
      if (isFail) {
        setExecutionStatus('error');
      }
      const entry: ConsoleLogEntry = {
        type: isFail ? 'error' : type,
        content: failFormatted || args.map(formatConsoleArg).join(' '),
        timestamp: now(),
        failure: isFail,
      };
      logs.push(entry);
      setOutputLogs([...logs]);
    };

    const customConsole = {
      log: (...args: unknown[]) => appendLog('log', ...args),
      info: (...args: unknown[]) => appendLog('info', ...args),
      warn: (...args: unknown[]) => appendLog('warn', ...args),
      error: (...args: unknown[]) => appendLog('error', ...args),
    };

    const mount = (compOrElem: unknown, props: Record<string, unknown> = {}) => {
      if (!compOrElem) return;
      if (React.isValidElement(compOrElem)) {
        setMountedComponent({ element: compOrElem, key: Date.now() });
        appendLog('info', '↳ React Element mounted to live preview');
      } else if (typeof compOrElem === 'function') {
        const el = React.createElement(compOrElem as React.ComponentType, props);
        setMountedComponent({ element: el, key: Date.now() });
        appendLog('info', '↳ Component mounted to live preview');
      } else {
        appendLog('warn', `mount() received unsupported argument type: ${typeof compOrElem}`);
      }
    };

    const customReactDOM = {
      ...ReactDOM,
      createRoot: () => ({
        render: (element: React.ReactElement) => mount(element),
        unmount: () => setMountedComponent(null),
      }),
    };

    const inputLang = getCardInputLanguage(currentCard);
    const isWrappedInput = inputLang === 'sql' || inputLang === 'graphql' || inputLang === 'html';
    const rawCodeToRun =
      inputLang === 'sql'
        ? prepareSqlCode(code, currentCard?.testHarness)
        : inputLang === 'graphql'
          ? prepareGraphqlCode(code, currentCard?.testHarness)
          : inputLang === 'html'
            ? prepareHtmlCode(code, currentCard?.testHarness)
            : code;
    const executableSource =
      isWrappedInput &&
      currentCard?.testHarness &&
      !bufferContainsHarness(rawCodeToRun, currentCard.testHarness)
        ? `${rawCodeToRun}\n\n${currentCard.testHarness}\n`
        : rawCodeToRun;

    const effectiveMode = isWrappedInput ? 'js' : executionMode;
    const transpiled = await transpileForExecution(
      executableSource,
      effectiveMode,
      3000,
      isTsTrack ? undefined : currentCard?.promptSeed
    );
    for (const diag of transpiled.diagnostics) {
      logs.push({
        type: diag.type === 'warn' ? 'warn' : 'error',
        content: diag.formatted,
        timestamp: now(),
        failure: diag.type !== 'warn',
      });
    }
    if (transpiled.diagnostics.length > 0) setOutputLogs([...logs]);
    if (!transpiled.ok) {
      setExecutionStatus('error');
      setIsRunning(false);
      return;
    }
    const executableCode = transpiled.code;

    // For non-React and non-DOM cards, offload execution to the isolated Web Worker
    if (currentCard && !isBrowserDomOrReactCard(currentCard) && supportsWebWorker()) {
      try {
        const outcome = await runInWorker({
          code: executableCode,
          timeoutMs: 6000,
          onLog: (msg) => {
            const entry: ConsoleLogEntry = {
              type: msg.method === 'warn' ? 'warn' : msg.method === 'error' ? 'error' : 'info',
              content: msg.text,
              timestamp: now(),
              failure: msg.method === 'error' || classifyLogLine(msg.method, msg.args) === 'fail',
            };
            logs.push(entry);
            setOutputLogs([...logs]);
          },
        });

        if (outcome.returnValue !== undefined) {
          appendLog('info', `↳ Return: ${formatConsoleArg(outcome.returnValue)}`);
        }

        if (outcome.report.timedOut) {
          const timeoutEntry: ConsoleLogEntry = {
            type: 'error',
            content: 'Execution timed out after 6000ms (terminated runaway worker thread to prevent tab freeze)',
            timestamp: now(),
            failure: true,
          };
          logs.push(timeoutEntry);
          setOutputLogs([...logs]);
          setExecutionStatus('error');
        } else {
          if (logs.length === 0) {
            if (outcome.report.lines.length > 0) {
              for (const line of outcome.report.lines) {
                const isFail = line.startsWith('[error]') || line.startsWith('[fail]');
                appendLog(isFail ? 'error' : 'info', line.replace(/^\[(log|info|warn|error)\]\s*/, ''));
              }
            } else if (outcome.report.errorCount > 0 || outcome.report.failCount > 0) {
              appendLog('error', outcome.report.summary || 'Execution failed with errors');
            } else {
              appendLog(
                'info',
                '(Code executed successfully with no console outputs. Uncomment the test lines at the bottom to view results!)'
              );
            }
          }
          const hasError = logs.some((l) => l.failure) || outcome.report.errorCount > 0 || outcome.report.failCount > 0;
          setExecutionStatus(hasError ? 'error' : 'success');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        const errorEntry: ConsoleLogEntry = {
          type: 'error',
          content: errorMsg,
          timestamp: now(),
          failure: true,
        };
        logs.push(errorEntry);
        setOutputLogs([...logs]);
        setExecutionStatus('error');
      } finally {
        setIsRunning(false);
      }
      return;
    }

    const libraries = await loadSandboxLibrariesForCode(executableCode, currentCard?.track);
    const scope = createSandboxScope({
      console: customConsole,
      mount,
      reactDOM: customReactDOM,
      cardId: currentCard?.id,
      libraries,
    });

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction(...scope.names, executableCode);
      let runTimer: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise((_, reject) => {
        runTimer = setTimeout(
          () => reject(new Error('Execution timed out after 6000ms. Check for infinite loops or unresolved promises.')),
          6000
        );
      });
      const result = await Promise.race([fn(...scope.values), timeoutPromise]);
      clearTimeout(runTimer);

      if (result !== undefined) {
        if (React.isValidElement(result) || typeof result === 'function') {
          mount(result);
        } else {
          appendLog('info', `↳ Return: ${formatConsoleArg(result)}`);
        }
      }

      if (logs.length === 0) {
        appendLog(
          'info',
          '(Code executed successfully with no console outputs. Uncomment the test lines at the bottom to view results!)'
        );
      }

      const hasError = logs.some((l) => l.failure);
      setExecutionStatus(hasError ? 'error' : 'success');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? `${err.name}: ${err.message}${err.stack ? `\n${err.stack.split('\n').slice(0, 3).join('\n')}` : ''}`
          : String(err);

      const errorEntry: ConsoleLogEntry = {
        type: 'error',
        content: errorMsg,
        timestamp: now(),
        failure: true,
      };
      logs.push(errorEntry);
      setOutputLogs([...logs]);
      setExecutionStatus('error');
    } finally {
      scope.cleanup();
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    executionStatus,
    setExecutionStatus,
    outputLogs,
    setOutputLogs,
    isOutputOpen,
    setIsOutputOpen,
    mountedComponent,
    setMountedComponent,
    isPreviewLive,
    setIsPreviewLive,
    previewRunTrigger,
    setPreviewRunTrigger,
    appendConsoleLog,
    handleRunCode,
  };
}
