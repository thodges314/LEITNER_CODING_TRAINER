// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { EditorToolbar, EditorActionControls } from './EditorToolbar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('EditorToolbar and EditorActionControls', () => {
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

  describe('EditorToolbar', () => {
    it('renders format and reset buttons and fires handlers', async () => {
      const handleFormat = vi.fn();
      const handleReset = vi.fn();

      await act(async () => {
        root?.render(
          <EditorToolbar
            evalResult={null}
            formatToast={null}
            isFormatting={false}
            code="const a = 1;"
            onFormatCode={handleFormat}
            onResetStarter={handleReset}
          />
        );
      });

      expect(container?.textContent).toContain('Cold-Start Buffer');

      const formatBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('Format')
      );
      const resetBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('Reset')
      );

      await act(async () => {
        formatBtn?.click();
        resetBtn?.click();
      });

      expect(handleFormat).toHaveBeenCalledTimes(1);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('shows locked state when evalResult is present', async () => {
      await act(async () => {
        root?.render(
          <EditorToolbar
            evalResult={{
              passed: true,
              critique: 'Good job',
              timeComplexity: 'O(n)',
              spaceComplexity: 'O(1)',
              invariantsMet: [],
              invariantsMissed: [],
            }}
            formatToast={null}
            isFormatting={false}
            code="const a = 1;"
            onFormatCode={vi.fn()}
            onResetStarter={vi.fn()}
          />
        );
      });

      expect(container?.textContent).toContain('Your Submitted Answer (locked)');
      expect(container?.querySelector('.arena-editor-actions-disabled')).toBeDefined();
    });
  });

  describe('EditorActionControls', () => {
    it('renders mode switch and triggers onSwitchExecutionMode', async () => {
      const handleSwitchMode = vi.fn();
      const handleRun = vi.fn();
      const handleSubmit = vi.fn();
      const handleSkip = vi.fn();

      await act(async () => {
        root?.render(
          <EditorActionControls
            evalResult={null}
            executionMode="js"
            isTsTrack={false}
            tsOnlyNotice={false}
            onSwitchExecutionMode={handleSwitchMode}
            onSkip={handleSkip}
            onRunCode={handleRun}
            onSubmit={handleSubmit}
            isEvaluating={false}
            isRunning={false}
            code="const ans = 42;"
            isReinforcement={false}
          />
        );
      });

      const tsBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('TS (Strict Type Check)')
      );
      await act(async () => {
        tsBtn?.click();
      });
      expect(handleSwitchMode).toHaveBeenCalledWith('ts');

      const runBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('Run Code / Test')
      );
      await act(async () => {
        runBtn?.click();
      });
      expect(handleRun).toHaveBeenCalledTimes(1);

      const submitBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('Submit Final Answer')
      );
      await act(async () => {
        submitBtn?.click();
      });
      expect(handleSubmit).toHaveBeenCalledTimes(1);

      const skipBtn = Array.from(container?.querySelectorAll('button') ?? []).find((b) =>
        b.textContent?.includes('Skip Card')
      );
      await act(async () => {
        skipBtn?.click();
      });
      expect(handleSkip).toHaveBeenCalledTimes(1);
    });
  });
});
