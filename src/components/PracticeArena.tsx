import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import rainbowBrackets from 'rainbowbrackets';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { createTsHoverExtension } from './practice/tsHoverExtension';
import { resolveExecutionModeForCard, setPreferredExecutionMode } from '../lib/editorSettings';
import { loadDraft, saveDraft, clearDraft } from '../lib/drafts';
import ReactDOM from 'react-dom/client';
import {
  getTrackMeta,
  isReactComponentCard,
} from '../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../lib/leitner';
import { evaluateCodeSubmission } from '../lib/ai';
import type { EvaluationResult } from '../lib/ai';
import { EvaluationPanel } from './EvaluationPanel';
import { CheckCircle } from 'lucide-react';
import { transpileForExecution, runHarness, createSandboxScope } from '../lib/runner';
import { extractHarnessContracts } from '../lib/harnessContracts';
import { formatConsoleArg, formatAssertionFailure } from './practice/consoleFormat';
import type { ConsoleLogEntry } from './practice/consoleFormat';
import { getStarterSnippet } from './practice/starterSnippet';
import { formatCode } from '../lib/formatter';
import { getTimedModeEnabled, getTimedModeDuration } from '../lib/timedMode';
import { MarkdownContent } from './MarkdownContent';
import { isTsOnlyCard } from '../lib/tsOnly';

import { ReinforcementBanner } from './practice/ReinforcementBanner';
import { PracticeHeader } from './practice/PracticeHeader';
import type { PopoverType } from './practice/PracticeHeader';
import { ContractTable } from './practice/ContractTable';
import { EditorToolbar, EditorActionControls } from './practice/EditorToolbar';
import { ConsoleRunnerDrawer } from './practice/ConsoleRunnerDrawer';
import { ComponentPreviewPane } from './practice/ComponentPreviewPane';
import { SocraticClarificationAssistant } from './practice/SocraticClarificationAssistant';

interface PracticeArenaProps {
  currentCard: TopicItem | null;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm?: SpacedAlgorithm;
  onCommitReview: (passed: boolean) => void;
  onSkipCard: () => void;
  onOpenDeckView: () => void;
  onOpenSettings?: () => void;
  isReinforcement?: boolean;
  onFinishReinforcement?: () => void;
  theme?: 'dark' | 'apple-gsos';
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  currentCard,
  totalCompletedReviews,
  activeDeckSize,
  algorithm = 'leitner',
  onCommitReview,
  onSkipCard,
  onOpenDeckView,
  onOpenSettings,
  isReinforcement,
  onFinishReinforcement,
  theme = 'dark',
}) => {
  const [code, setCode] = useState(() =>
    isReinforcement ? getStarterSnippet(currentCard) : (loadDraft(currentCard?.id) ?? getStarterSnippet(currentCard))
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  // Live React component mounting state
  const [mountedComponent, setMountedComponent] = useState<{
    element: React.ReactElement;
    key: number;
  } | null>(null);

  // Track whether the live preview has been initialized via Run Code / Test
  const [isPreviewLive, setIsPreviewLive] = useState<boolean>(false);
  const [previewRunTrigger, setPreviewRunTrigger] = useState<number>(0);

  // Pop-out state for legacy Component Preview / Hook Test box
  const [legacyPopupWindow, setLegacyPopupWindow] = useState<Window | null>(null);
  const isLegacyPoppedOut = Boolean(legacyPopupWindow && !legacyPopupWindow.closed);

  const handleLegacyPopOut = useCallback(() => {
    if (legacyPopupWindow && !legacyPopupWindow.closed) {
      legacyPopupWindow.focus();
      return;
    }

    const w = 640;
    const h = 540;
    const left = typeof window.screenX === 'number' ? window.screenX + Math.max(0, (window.outerWidth - w) / 2) : 100;
    const top = typeof window.screenY === 'number' ? window.screenY + Math.max(0, (window.outerHeight - h) / 2) : 100;

    const popup = (() => {
      try {
        return window.open(
          'about:blank',
          'leitner_legacy_component_preview',
          `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
      } catch {
        return null;
      }
    })();

    if (!popup) return;

    try {
      popup.document.title = `Component Preview: ${currentCard?.title || 'Hook Test'} — Leitner`;
      popup.document.head.innerHTML = '';
      for (const el of Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))) {
        popup.document.head.appendChild(el.cloneNode(true));
      }
      popup.document.body.style.margin = '0';
      popup.document.body.style.padding = '16px';
      popup.document.body.style.backgroundColor = theme === 'apple-gsos' ? '#ffffff' : '#030712';
      popup.document.body.style.color = theme === 'apple-gsos' ? '#0f172a' : '#cbd5e1';
      popup.document.body.style.fontFamily = getComputedStyle(document.body).fontFamily;
      popup.document.body.style.boxSizing = 'border-box';
      popup.document.body.style.height = '100vh';
      popup.document.body.style.display = 'flex';
      popup.document.body.style.flexDirection = 'column';

      popup.addEventListener('beforeunload', () => {
        setLegacyPopupWindow(null);
      });
    } catch {
      // Ignore
    }

    setLegacyPopupWindow(popup);
  }, [currentCard, theme, legacyPopupWindow]);

  const handleLegacyDockBack = useCallback(() => {
    if (legacyPopupWindow && !legacyPopupWindow.closed) {
      legacyPopupWindow.close();
    }
    setLegacyPopupWindow(null);
  }, [legacyPopupWindow]);

  // Clean up legacy popup window on unmount
  useEffect(() => {
    return () => {
      if (legacyPopupWindow && !legacyPopupWindow.closed) {
        legacyPopupWindow.close();
      }
    };
  }, [legacyPopupWindow]);

  // Heartbeat to detect popup closure via OS close button
  useEffect(() => {
    if (!legacyPopupWindow) return;
    const timer = setInterval(() => {
      if (legacyPopupWindow.closed) {
        setLegacyPopupWindow(null);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [legacyPopupWindow]);

  // Execution mode: JS (Fast) vs TS (Strict Type Check)
  const [executionMode, setExecutionMode] = useState<'js' | 'ts'>(() =>
    resolveExecutionModeForCard(currentCard)
  );

  const isTsTrack = isTsOnlyCard(currentCard);
  const [tsOnlyNoticeFor, setTsOnlyNoticeFor] = useState<string | null>(null);
  const tsOnlyNotice = tsOnlyNoticeFor !== null && tsOnlyNoticeFor === currentCard?.id;

  useEffect(() => {
    if (!tsOnlyNoticeFor) return undefined;
    const timer = setTimeout(() => setTsOnlyNoticeFor(null), 4000);
    return () => clearTimeout(timer);
  }, [tsOnlyNoticeFor]);

  const handleSwitchExecutionMode = (mode: 'js' | 'ts') => {
    if (isTsTrack && mode === 'js') {
      setTsOnlyNoticeFor(currentCard?.id ?? null);
      return;
    }
    setExecutionMode(mode);
    if (!isTsTrack) {
      setPreferredExecutionMode(mode);
    }
  };

  // Countdown stopwatch (supports Timed Recall Mode with auto-start and auto-submit)
  const timedMode = getTimedModeEnabled();
  const configuredDuration = getTimedModeDuration();
  const [timeRemaining, setTimeRemaining] = useState(configuredDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(timedMode);
  const [timeExpiredToast, setTimeExpiredToast] = useState<string | null>(null);
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatToast, setFormatToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [outputLogs, setOutputLogs] = useState<ConsoleLogEntry[]>([]);
  const [isOutputOpen, setIsOutputOpen] = useState(false);

  // Reveal canonical solution state
  const [showSolution, setShowSolution] = useState(false);
  const [showHarness, setShowHarness] = useState(true);
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [inspectedTier, setInspectedTier] = useState<number>(currentCard?.box || 1);
  const indicatorsHeaderRef = useRef<HTMLDivElement>(null);
  const [prevCardId, setPrevCardId] = useState(currentCard?.id);

  // Close active indicator popover on outside click or escape
  useEffect(() => {
    if (!activePopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (indicatorsHeaderRef.current && !indicatorsHeaderRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopover(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover]);

  // Autosave the editor buffer (debounced)
  useEffect(() => {
    if (!currentCard || isReinforcement) return;
    const starter = getStarterSnippet(currentCard);
    const trimmed = code.trim();
    if (!trimmed || code === starter) {
      clearDraft(currentCard.id);
      return;
    }
    const timer = setTimeout(() => {
      saveDraft(currentCard.id, code);
    }, 300);
    return () => clearTimeout(timer);
  }, [code, currentCard, isReinforcement]);

  if (currentCard?.id !== prevCardId) {
    setPrevCardId(currentCard?.id);
    setShowSolution(false);
    setShowHarness(true);
    setActivePopover(null);
    setIsPreviewLive(false);
    setMountedComponent(null);
    if (currentCard) setInspectedTier(currentCard.box);
    setExecutionMode(resolveExecutionModeForCard(currentCard));
  }

  // Autofocus editor on mount and card switch
  useEffect(() => {
    if (editorRef.current?.view) {
      editorRef.current.view.focus();
    }
  }, [currentCard?.id]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format code with Prettier standalone
  const handleFormatCode = async () => {
    if (!code.trim() || isFormatting) return;
    setIsFormatting(true);
    try {
      const res = await formatCode(code, executionMode === 'ts');
      if (res.success && res.code !== code) {
        setCode(res.code);
        setFormatToast({ message: 'Formatted with Prettier', type: 'success' });
      } else if (!res.success) {
        setFormatToast({
          message: `Format error: ${res.error?.split('\n')[0] ?? 'Syntax error'}`,
          type: 'error',
        });
      } else {
        setFormatToast({ message: 'Already formatted', type: 'success' });
      }
    } finally {
      setIsFormatting(false);
      setTimeout(() => setFormatToast(null), 3500);
    }
  };

  // CodeMirror 6 setup
  const cmBasicSetup = useMemo(
    () => ({
      lineNumbers: true,
      highlightActiveLineGutter: true,
      highlightSpecialChars: true,
      history: true,
      foldGutter: false,
      drawSelection: true,
      dropCursor: true,
      allowMultipleSelections: true,
      indentOnInput: true,
      bracketMatching: true,
      closeBrackets: true,
      closeBracketsKeymap: true,
      autocompletion: false,
      completionKeymap: false,
      rectangularSelection: true,
      crosshairCursor: false,
      highlightActiveLine: true,
      highlightSelectionMatches: true,
      tabSize: 2,
    }),
    []
  );

  const extensions = useMemo(() => {
    const list = [
      javascript({ jsx: true, typescript: executionMode === 'ts' }),
      rainbowBrackets(),
      EditorView.lineWrapping,
      keymap.of([indentWithTab]),
      EditorView.theme({
        '&': {
          fontFamily: 'var(--font-mono) !important',
        },
        '.cm-content, .cm-line, .cm-line *': {
          fontFamily: 'var(--font-mono) !important',
          fontVariantLigatures: 'normal !important',
          fontFeatureSettings: '"calt" 1, "liga" 1, "zero" 1 !important',
          letterSpacing: 'normal !important',
          textRendering: 'optimizeLegibility !important',
        },
      }),
    ];
    if (executionMode === 'ts') {
      list.push(createTsHoverExtension());
    }
    return list;
  }, [executionMode]);

  const actionsRef = useRef<{
    handleRunCode: () => Promise<void>;
    handleSubmit: () => Promise<void>;
    handleFormatCode: () => Promise<void>;
  }>({
    handleRunCode: () => Promise.resolve(),
    handleSubmit: () => Promise.resolve(),
    handleFormatCode: () => Promise.resolve(),
  });

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

  // Async Execution Handler with AsyncFunction and captured console
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

    const transpiled = await transpileForExecution(code, executionMode);
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

    const scope = createSandboxScope({
      console: customConsole,
      mount,
      reactDOM: customReactDOM,
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

  const handleSubmit = async () => {
    setIsPreviewLive(true);
    setPreviewRunTrigger((c) => c + 1);
    if (!currentCard || !code.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setShowSolution(false);
    try {
      const harness = await runHarness(currentCard, code, executionMode);
      const res = await evaluateCodeSubmission(currentCard, code, harness, executionMode);
      setEvalResult(res);
      setShowSolution(!res.passed);
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    actionsRef.current = {
      handleRunCode,
      handleSubmit,
      handleFormatCode,
    };
  });

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          void actionsRef.current.handleSubmit();
        } else {
          void actionsRef.current.handleRunCode();
        }
      } else if (
        (e.shiftKey && e.altKey && (e.key === 'f' || e.key === 'F')) ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F'))
      ) {
        e.preventDefault();
        void actionsRef.current.handleFormatCode();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (!evalResult && !isEvaluating) {
              setTimeExpiredToast('⏰ Time expired! Your buffer is being automatically submitted for evaluation...');
              setTimeout(() => {
                void actionsRef.current.handleSubmit();
              }, 120);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, timedMode, evalResult, isEvaluating]);

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        void handleSubmit();
      } else {
        void handleRunCode();
      }
    } else if (
      (e.shiftKey && e.altKey && (e.key === 'f' || e.key === 'F')) ||
      ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      void handleFormatCode();
    }
  };

  const handleFinishDrill = () => {
    clearDraft(currentCard?.id);
    setEvalResult(null);
    setShowSolution(false);
    setCode('');
    setOutputLogs([]);
    setExecutionStatus('idle');
    setIsPreviewLive(false);
    setMountedComponent(null);
    onFinishReinforcement?.();
  };

  const handleSkip = () => {
    clearDraft(currentCard?.id);
    setIsPreviewLive(false);
    setMountedComponent(null);
    setShowSolution(false);
    onSkipCard();
  };

  if (!currentCard) {
    return (
      <div className="glass-panel arena-empty-state">
        <CheckCircle size={48} className="arena-empty-state-icon" />
        <h3 className="arena-empty-state-title">
          No Active Cards in Rotation
        </h3>
        <p className="arena-empty-state-desc">
          All cards are currently locked or there are no cards in the deck. Head to the Catalog Dashboard to unlock cards or create new topics.
        </p>
        <button className="btn btn-primary" onClick={onOpenDeckView}>
          Open Deck Catalog
        </button>
      </div>
    );
  }

  const isComponentProblem = isReactComponentCard(currentCard);
  const trackMeta = getTrackMeta(currentCard.track);

  const contractCases = currentCard.testCases && currentCard.testCases.length > 0
    ? currentCard.testCases
    : extractHarnessContracts(currentCard.testHarness);

  return (
    <div className="arena-container">
      {/* Reinforcement Drill Banner */}
      <ReinforcementBanner
        isReinforcement={isReinforcement}
        timeExpiredToast={timeExpiredToast}
        onFinishReinforcement={handleFinishDrill}
        onDismissTimeToast={() => setTimeExpiredToast(null)}
      />

      {/* Top Header Card with Badges and Popovers */}
      <PracticeHeader
        currentCard={currentCard}
        trackMeta={trackMeta}
        theme={theme}
        algorithm={algorithm}
        activeDeckSize={activeDeckSize}
        activePopover={activePopover}
        setActivePopover={setActivePopover}
        inspectedTier={inspectedTier}
        setInspectedTier={setInspectedTier}
        indicatorsHeaderRef={indicatorsHeaderRef}
        timeRemaining={timeRemaining}
        formatTimer={formatTimer}
        isTimerRunning={isTimerRunning}
        setIsTimerRunning={setIsTimerRunning}
        timedMode={timedMode}
        configuredDuration={configuredDuration}
        setTimeRemaining={setTimeRemaining}
        setTimeExpiredToast={setTimeExpiredToast}
      />

      {/* Prompt Seed Instructions */}
      <div data-tour="problem" className="prompt-seed-box" style={{ position: 'relative' }}>
        <SocraticClarificationAssistant
          key={currentCard.id}
          topic={currentCard}
          currentCode={code}
          theme={theme}
          onOpenSettings={onOpenSettings}
        />
        <MarkdownContent text={currentCard.promptSeed} />
      </div>

      {/* Target Contract (Input vs Expected Output) */}
      <ContractTable
        contractCases={contractCases}
        showHarness={showHarness}
        onToggleShowHarness={() => setShowHarness((prev) => !prev)}
      />

      {/* AI Evaluation Result Panel */}
      {evalResult && (
        <EvaluationPanel
          theme={theme}
          topic={currentCard}
          submittedCode={code}
          result={evalResult}
          totalCompletedReviews={totalCompletedReviews}
          activeDeckSize={activeDeckSize}
          algorithm={algorithm}
          onCommit={(passed) => {
            clearDraft(currentCard.id);
            if (isReinforcement) {
              handleFinishDrill();
            } else {
              onCommitReview(passed);
              setEvalResult(null);
              setShowSolution(false);
              setCode('');
              setOutputLogs([]);
              setExecutionStatus('idle');
              setIsPreviewLive(false);
              setMountedComponent(null);
            }
          }}
          onRetry={() => {
            setEvalResult(null);
            setShowSolution(false);
          }}
          showSolution={showSolution}
          onToggleShowSolution={() => setShowSolution((prev) => !prev)}
          isReinforcement={isReinforcement}
          onFinishReinforcement={handleFinishDrill}
          executionMode={executionMode}
        />
      )}

      {/* Blank-Buffer Editor Area */}
      <div className="glass-panel arena-editor-panel">
        <EditorToolbar
          evalResult={evalResult}
          formatToast={formatToast}
          isFormatting={isFormatting}
          code={code}
          onFormatCode={handleFormatCode}
          onResetStarter={() => {
            clearDraft(currentCard?.id);
            setCode(getStarterSnippet(currentCard));
            setIsPreviewLive(false);
            setMountedComponent(null);
          }}
          onClearBuffer={() => setCode('')}
        />

        {/* CodeMirror 6 Editor with Rainbow Brackets & Cold-Start Mode */}
        <div className="cm-theme-container" data-tour="editor" onKeyDown={handleEditorKeyDown}>
          <CodeMirror
            ref={editorRef}
            value={code}
            height="380px"
            theme={theme === 'apple-gsos' ? 'light' : 'dark'}
            basicSetup={cmBasicSetup}
            extensions={extensions}
            onChange={(val) => setCode(val)}
            editable={!evalResult}
            readOnly={Boolean(evalResult)}
            placeholder="// Type your solution from scratch without autocomplete or hints...
// Press [Tab] for 2-space indentation.
// Bracket pair colorization and autoclosing brackets/quotes are enabled."
            autoFocus
          />
        </div>

        {/* Mode Selector Bar & Primary Action Controls */}
        <div data-tour="actions">
          <EditorActionControls
            evalResult={evalResult}
            executionMode={executionMode}
            isTsTrack={isTsTrack}
            tsOnlyNotice={tsOnlyNotice}
            onSwitchExecutionMode={handleSwitchExecutionMode}
            onSkip={handleSkip}
            onRunCode={handleRunCode}
            onSubmit={handleSubmit}
            isEvaluating={isEvaluating}
            isRunning={isRunning}
            code={code}
            isReinforcement={isReinforcement}
          />
        </div>

        {/* Test Runner & Live Preview Container */}
        <div
          className={`arena-output-grid ${
            isComponentProblem ? 'arena-output-grid-split' : 'arena-output-grid-single'
          }`}
        >
          <ConsoleRunnerDrawer
            isOutputOpen={isOutputOpen}
            setIsOutputOpen={setIsOutputOpen}
            isRunning={isRunning}
            executionStatus={executionStatus}
            outputLogs={outputLogs}
            onClearLogs={() => {
              setOutputLogs([]);
              setExecutionStatus('idle');
            }}
            theme={theme}
          />

          {isComponentProblem && (
            <ComponentPreviewPane
              currentCard={currentCard}
              code={code}
              executionMode={executionMode}
              theme={theme}
              isPreviewLive={isPreviewLive}
              previewRunTrigger={previewRunTrigger}
              appendConsoleLog={appendConsoleLog}
              mountedComponent={mountedComponent}
              isLegacyPoppedOut={isLegacyPoppedOut}
              legacyPopupWindow={legacyPopupWindow}
              handleLegacyPopOut={handleLegacyPopOut}
              handleLegacyDockBack={handleLegacyDockBack}
              setMountedComponent={setMountedComponent}
              setIsOutputOpen={setIsOutputOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
};
