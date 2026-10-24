// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { ConsoleRunnerDrawer } from './ConsoleRunnerDrawer';
import type { ConsoleLogEntry } from './consoleFormat';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('ConsoleRunnerDrawer', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const sampleLogs: ConsoleLogEntry[] = [
    { type: 'log', content: 'twoSum([2, 7], 9) PASS', timestamp: '12:00:01' },
    { type: 'error', content: 'twoSum([1], 2) FAIL | Expected: throws Error | Received: null', timestamp: '12:00:02', failure: true },
  ];

  it('renders status, log entry count, and toggles open state', async () => {
    const handleToggle = vi.fn();

    await act(async () => {
      root?.render(
        <ConsoleRunnerDrawer
          isOutputOpen={false}
          setIsOutputOpen={handleToggle}
          isRunning={false}
          executionStatus="error"
          outputLogs={sampleLogs}
          onClearLogs={vi.fn()}
        />
      );
    });

    expect(container?.textContent).toContain('Console & Test Runner');
    expect(container?.textContent).toContain('Failed (1 Error)');
    expect(container?.textContent).toContain('2 entries');

    const header = container?.querySelector('.console-runner-header');
    await act(async () => {
      (header as HTMLElement)?.click();
    });
    expect(handleToggle).toHaveBeenCalled();
  });

  it('renders log items when open and handles clear logs', async () => {
    const handleClear = vi.fn();

    await act(async () => {
      root?.render(
        <ConsoleRunnerDrawer
          isOutputOpen={true}
          setIsOutputOpen={vi.fn()}
          isRunning={false}
          executionStatus="idle"
          outputLogs={sampleLogs}
          onClearLogs={handleClear}
        />
      );
    });

    const body = container?.querySelector('.console-runner-body');
    expect(body).toBeDefined();
    expect(body?.textContent).toContain('PASS');
    expect(body?.textContent).toContain('FAIL');

    const clearBtn = container?.querySelector('.console-clear-logs-btn') as HTMLButtonElement | null;
    expect(clearBtn).toBeDefined();
    await act(async () => {
      clearBtn?.click();
    });
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
