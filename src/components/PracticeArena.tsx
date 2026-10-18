import { DifficultyBadge } from './DifficultyBadge';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import rainbowBrackets from 'rainbowbrackets';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { loadDraft, saveDraft, clearDraft } from '../lib/drafts';
import ReactDOM from 'react-dom/client';
import {
  getTrackMeta,
  intervalForBox,
  DIFFICULTY_LABELS,
  difficultyOf,
  isReactComponentCard,
} from '../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../lib/leitner';
import { shortcutAttrs } from '../lib/shortcuts';
import { evaluateCodeSubmission } from '../lib/ai';
import type { EvaluationResult } from '../lib/ai';
import { EvaluationPanel } from './EvaluationPanel';
import {
  Timer,
  Clock,
  Database,
  Play,
  Pause,
  RotateCcw,
  Send,
  SkipForward,
  Flame,
  CheckCircle,
  Terminal,
  Eraser,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  Trash2,
  Code2,
  Layers,
  FlaskConical,
  Sparkles,
  Zap,
  X,
  ExternalLink,
  Minimize2,
} from 'lucide-react';
import { transpileForExecution, runHarness, createSandboxScope } from '../lib/runner';
import { extractHarnessContracts } from '../lib/harnessContracts';
import { formatConsoleArg, formatAssertionFailure } from './practice/consoleFormat';
import type { ConsoleLogEntry } from './practice/consoleFormat';
import { ReactTestErrorBoundary } from './practice/ReactTestErrorBoundary';
import { getStarterSnippet } from './practice/starterSnippet';
import { formatCode } from '../lib/formatter';
import { getTimedModeEnabled, getTimedModeDuration } from '../lib/timedMode';
import { ReactPreview } from './ReactPreview';

const TIER_METADATA: Record<number, { level: string; desc: string }> = {
  1: { level: 'Initial Encounter', desc: 'Immediate reinforcement (+1 review) to anchor core pattern.' },
  2: { level: 'Early Expansion', desc: 'Short spacing interval (+3 reviews) to cement syntax and fundamentals.' },
  3: { level: 'Active Consolidation', desc: 'Consolidates invariant retrieval (+7 reviews) into medium-term memory.' },
  4: { level: 'Intermediate Retention', desc: 'Tests memory resilience (+16 reviews) against interference.' },
  5: { level: 'Proficient Recall', desc: 'Established long-term recall (+35 reviews) of patterns and edge cases.' },
  6: { level: 'Advanced Fluency', desc: 'Smooth, instinctive cold-start implementation (+75 reviews).' },
  7: { level: 'Deep Automaticity', desc: 'Effortless retrieval under timed pressure (+165 reviews).' },
  8: { level: 'Permanent Retention', desc: 'Durable long-term retention (+360 reviews).' },
  9: { level: 'Muscle Memory', desc: 'Fully internalized muscle memory (+800 reviews).' },
};

const BOX_METADATA: Record<number, { level: string; desc: string }> = {
  1: { level: 'Unlearned / Rotation', desc: 'Immediate rotation (+1 review) for newly encountered topics.' },
  2: { level: 'Familiar', desc: 'Review every 4 cards (+4 reviews) to build familiarity.' },
  3: { level: 'Practiced', desc: 'Review every 10 cards (+10 reviews) for retention.' },
  4: { level: 'Competent', desc: 'Review every 22 cards (+22 reviews) for mastery confidence.' },
  5: { level: 'Mastered', desc: 'Long-term mastery (+45 reviews) milestone.' },
};

interface PracticeArenaProps {
  currentCard: TopicItem | null;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm?: SpacedAlgorithm;
  onCommitReview: (passed: boolean) => void;
  onSkipCard: () => void;
  onOpenDeckView: () => void;
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
    currentCard?.track === 'typescript-patterns' ? 'ts' : 'js'
  );

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
  type PopoverType = 'track' | 'difficulty' | 'tier' | 'complexity' | 'streak' | 'timer' | null;
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

  // Autosave the editor buffer (debounced) so a frozen tab or reload never loses work.
  // Never save drafts during an isolated reinforcement drill or when code is empty/matches starter.
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

  // CodeMirror 6 setup: autocomplete and IntelliSense are STRICTLY disabled for cold-start recall.
  // Bracket matching and autoclosing of brackets and quotes are enabled.
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
      autocompletion: false, // Explicitly disabled
      completionKeymap: false, // Explicitly disabled
      rectangularSelection: true,
      crosshairCursor: false,
      highlightActiveLine: true,
      highlightSelectionMatches: true,
      tabSize: 2,
    }),
    []
  );

  // CodeMirror extensions: JS/TS language support, Rainbow Brackets (Path B), tab indentation, and Fira Code ligatures
  const extensions = useMemo(() => {
    return [
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
  }, [executionMode]);

  // Keep a ref to the latest action handlers updated in an effect (not during render)
  const actionsRef = useRef<{
    handleRunCode: () => Promise<void>;
    handleSubmit: () => Promise<void>;
    handleFormatCode: () => Promise<void>;
  }>({
    handleRunCode: () => Promise.resolve(),
    handleSubmit: () => Promise.resolve(),
    handleFormatCode: () => Promise.resolve(),
  });

  // Toggle comments on the bottom test runner block
  const handleToggleTestComments = () => {
    if (!code.includes('// Test runner example:')) return;
    const parts = code.split('// Test runner example:\n');
    if (parts.length < 2) return;
    const header = parts[0] + '// Test runner example:\n';
    const testPart = parts[1];
    const lines = testPart.split('\n');
    const allCommented = lines.every((l) => l.trim() === '' || l.startsWith('//'));
    const toggledLines = lines.map((l) => {
      if (allCommented) {
        return l.replace(/^\/\/\s?/, '');
      } else {
        return l.trim().length > 0 ? `// ${l}` : '//';
      }
    });
    setCode(header + toggledLines.join('\n'));
  };

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
      // Async IIFE execution engine with React, ReactDOM, mount, native hooks, mock fetch and `dom` tools
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
      // Catch and display runtime syntax, reference, and async errors cleanly in readable red text
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
      // Run the card's test harness headlessly; its result decides pass/fail.
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

  // Sync latest handlers into actionsRef inside an effect (after render)
  useEffect(() => {
    actionsRef.current = {
      handleRunCode,
      handleSubmit,
      handleFormatCode,
    };
  });

  // Global window shortcut listener as fallback (Cmd+Enter, Cmd+Shift+Enter, Shift+Alt+F)
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

  // Timer interval (runs after actionsRef is synchronized)
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

  const handleCommit = (passed: boolean) => {
    clearDraft(currentCard?.id);
    if (isReinforcement) {
      handleFinishDrill();
      return;
    }
    onCommitReview(passed);
    setEvalResult(null);
    setShowSolution(false);
    setCode('');
    setOutputLogs([]);
    setExecutionStatus('idle');
    setIsPreviewLive(false);
    setMountedComponent(null);
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
      <div
        className="glass-panel"
        style={{
          padding: '48px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '40px auto',
        }}
      >
        <CheckCircle size={48} color="#34d399" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          No Active Cards in Rotation
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
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
  const errorCount = outputLogs.filter((l) => l.failure).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Reinforcement Drill Banner */}
      {isReinforcement && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#c084fc',
                boxShadow: '0 0 8px #c084fc',
              }}
            />
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#e9d5ff' }}>
              Immediate Reinforcement Drill
            </span>
            <span style={{ fontSize: '12.5px', color: '#c084fc' }}>
              Solidify pattern memory before moving on. This drill has zero effect on tier, box, or streak stats.
            </span>
          </div>
          {onFinishReinforcement && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleFinishDrill}
              style={{ fontSize: '12px', padding: '4px 10px', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#e9d5ff' }}
            >
              Skip Drill →
            </button>
          )}
        </div>
      )}

      {/* Time Expired Toast */}
      {timeExpiredToast && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: theme === 'apple-gsos' ? '#FFFBEB' : 'rgba(245, 158, 11, 0.15)',
            border: theme === 'apple-gsos' ? '1.5px solid #D97706' : '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: theme === 'apple-gsos' ? '2px 2px 0px rgba(28, 28, 28, 0.15)' : 'none',
            color: theme === 'apple-gsos' ? '#92400E' : '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }}>
            <span>{timeExpiredToast}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setTimeExpiredToast(null)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderColor: theme === 'apple-gsos' ? '#1C1C1C' : 'rgba(245, 158, 11, 0.4)',
              color: theme === 'apple-gsos' ? '#1C1C1C' : '#fbbf24',
              backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'transparent',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div ref={indicatorsHeaderRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* 1. Track Badge with Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span
                className="badge"
                onClick={() => setActivePopover((prev) => (prev === 'track' ? null : 'track'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'track' ? null : 'track'));
                  }
                }}
                style={{
                  backgroundColor: trackMeta.bg,
                  border: activePopover === 'track' ? `1px solid ${trackMeta.color}` : `1px solid ${trackMeta.border}`,
                  color: trackMeta.color,
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {trackMeta.label}
              </span>

              {activePopover === 'track' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '0',
                    zIndex: 100,
                    width: '300px',
                    backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                    border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.12)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={13} color={trackMeta.color} />
                      <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12px' }}>
                        Track: {trackMeta.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                      style={{ background: 'none', border: 'none', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      aria-label="Close track info"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', margin: 0 }}>
                    Focus domain for this challenge. Drills in <strong style={{ color: 'var(--text-primary)' }}>{trackMeta.label}</strong> test idiomatic implementations, core architectural patterns, and boundary invariants.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Difficulty Badge with Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                onClick={() => setActivePopover((prev) => (prev === 'difficulty' ? null : 'difficulty'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'difficulty' ? null : 'difficulty'));
                  }
                }}
                style={{
                  padding: '3px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: activePopover === 'difficulty' ? (theme === 'apple-gsos' ? '1px solid #1C1C1C' : '1px solid rgba(56, 189, 248, 0.4)') : '1px solid transparent',
                  backgroundColor: activePopover === 'difficulty' ? (theme === 'apple-gsos' ? '#E8E7DF' : 'rgba(56, 189, 248, 0.08)') : 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <DifficultyBadge card={currentCard} disableTooltip />
              </div>

              {activePopover === 'difficulty' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '0',
                    zIndex: 100,
                    width: '280px',
                    backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                    border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.12)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12px' }}>
                      Difficulty: Level {difficultyOf(currentCard)} of 5 ({DIFFICULTY_LABELS[difficultyOf(currentCard)]})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                      style={{ background: 'none', border: 'none', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      aria-label="Close difficulty info"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                    {[
                      { level: 1, label: DIFFICULTY_LABELS[1], color: '#34d399' },
                      { level: 2, label: DIFFICULTY_LABELS[2], color: '#a3e635' },
                      { level: 3, label: DIFFICULTY_LABELS[3], color: '#fbbf24' },
                      { level: 4, label: DIFFICULTY_LABELS[4], color: '#fb923c' },
                      { level: 5, label: DIFFICULTY_LABELS[5], color: '#f87171' },
                    ].map((lvl) => {
                      const isCurrentLevel = difficultyOf(currentCard) === lvl.level;
                      return (
                        <div
                          key={lvl.level}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            backgroundColor: isCurrentLevel ? (theme === 'apple-gsos' ? '#F2F1EA' : 'rgba(255, 255, 255, 0.08)') : 'transparent',
                            border: isCurrentLevel ? `1px solid ${lvl.color}` : '1px solid transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: lvl.color, fontSize: '10px', letterSpacing: '1px' }}>
                              {'●'.repeat(lvl.level)}
                            </span>
                            <span style={{ color: isCurrentLevel ? (theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9') : 'var(--text-muted)', fontWeight: isCurrentLevel ? 600 : 400 }}>
                              {lvl.label}
                            </span>
                          </div>
                          {isCurrentLevel && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: lvl.color }}>
                              Current Card
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Leitner Box / Tier Progression Badges with Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActivePopover((prev) => (prev === 'tier' ? null : 'tier'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'tier' ? null : 'tier'));
                  }
                }}
              >
                {(algorithm === 'graduated-interval'
                  ? Array.from({ length: Math.max(5, Math.min(9, currentCard.box)) }, (_, i) => i + 1)
                  : [1, 2, 3, 4, 5]
                ).map((b) => {
                  const isCurrent = currentCard.box === b;
                  const isPast = currentCard.box > b;

                  return (
                    <div
                      key={b}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedTier(b);
                        setActivePopover('tier');
                      }}
                      style={{
                        width: '28px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        backgroundColor: isCurrent
                          ? `var(--box-${Math.min(9, b)})`
                          : isPast
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: isCurrent ? '#090c12' : isPast ? '#f1f5f9' : 'var(--text-dim)',
                        border: isCurrent ? '1px solid white' : '1px solid transparent',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {algorithm === 'graduated-interval' ? `T${b}` : `B${b}`}
                    </div>
                  );
                })}
                {algorithm === 'graduated-interval' && currentCard.box > 9 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedTier(currentCard.box);
                      setActivePopover('tier');
                    }}
                    style={{
                      width: '32px',
                      height: '24px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--box-9)',
                      color: '#090c12',
                      border: '1px solid white',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    T{currentCard.box}
                  </div>
                )}
              </div>

              {activePopover === 'tier' && (() => {
                const effectiveTier = inspectedTier || currentCard.box;
                const isCurrent = currentCard.box === effectiveTier;
                const isPast = currentCard.box > effectiveTier;
                const interval = intervalForBox(effectiveTier, algorithm, activeDeckSize);
                const tierMeta =
                  algorithm === 'graduated-interval'
                    ? TIER_METADATA[Math.min(9, effectiveTier)]
                    : BOX_METADATA[Math.min(5, effectiveTier)];

                return (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '0',
                      zIndex: 100,
                      width: '330px',
                      backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                      backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                      border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.12)',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: 'var(--text-primary)',
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: `var(--box-${Math.min(9, effectiveTier)})`,
                            color: '#090c12',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          {algorithm === 'graduated-interval' ? `T${effectiveTier}` : `B${effectiveTier}`}
                        </span>
                        <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12.5px' }}>
                          {tierMeta?.level || 'Retention Spacing'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                        style={{ background: 'none', border: 'none', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        aria-label="Close tier details"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '11px',
                          backgroundColor: isCurrent
                            ? (theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.15)')
                            : isPast
                            ? (theme === 'apple-gsos' ? 'rgba(34, 153, 85, 0.14)' : 'rgba(52, 211, 153, 0.15)')
                            : (theme === 'apple-gsos' ? '#F2F1EA' : 'rgba(148, 163, 184, 0.12)'),
                          color: isCurrent
                            ? (theme === 'apple-gsos' ? '#1D4ED8' : '#38bdf8')
                            : isPast
                            ? (theme === 'apple-gsos' ? '#15803D' : '#34d399')
                            : 'var(--text-muted)',
                          border: isCurrent
                            ? (theme === 'apple-gsos' ? '1px solid rgba(68, 85, 170, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)')
                            : isPast
                            ? (theme === 'apple-gsos' ? '1px solid rgba(34, 153, 85, 0.4)' : '1px solid rgba(52, 211, 153, 0.35)')
                            : (theme === 'apple-gsos' ? '1px solid #B8B7AD' : '1px solid rgba(148, 163, 184, 0.25)'),
                        }}
                      >
                        {isCurrent ? 'Current Level' : isPast ? 'Mastered / Passed' : 'Upcoming Level'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Interval: <strong style={{ color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9' }}>+{interval} review{interval === 1 ? '' : 's'}</strong>
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', margin: '0 0 10px 0' }}>
                      {tierMeta?.desc}
                    </p>

                    {/* Quick Tier Inspector Buttons */}
                    <div style={{ borderTop: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        Inspect other {algorithm === 'graduated-interval' ? 'tiers' : 'boxes'}:
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(algorithm === 'graduated-interval' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5]).map((tierNum) => (
                          <button
                            key={tierNum}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedTier(tierNum);
                            }}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: effectiveTier === tierNum
                                ? (theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid #38bdf8')
                                : (theme === 'apple-gsos' ? '1px solid #B8B7AD' : '1px solid rgba(255, 255, 255, 0.1)'),
                              backgroundColor: effectiveTier === tierNum
                                ? (theme === 'apple-gsos' ? '#4455AA' : 'rgba(56, 189, 248, 0.2)')
                                : (theme === 'apple-gsos' ? '#F2F1EA' : 'rgba(255, 255, 255, 0.04)'),
                              color: effectiveTier === tierNum
                                ? '#ffffff'
                                : (theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)'),
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: effectiveTier === tierNum ? 700 : 500,
                            }}
                          >
                            {algorithm === 'graduated-interval' ? `T${tierNum}` : `B${tierNum}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 4. Target Complexity Goal Badge (No browser mouseover, click-only) */}
            {(currentCard.targetTime || currentCard.targetSpace) && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  className="badge complexity-badge-chip"
                  onClick={() => setActivePopover((prev) => (prev === 'complexity' ? null : 'complexity'))}
                  style={{
                    backgroundColor: activePopover === 'complexity'
                      ? 'rgba(56, 189, 248, 0.18)'
                      : 'rgba(56, 189, 248, 0.08)',
                    border: activePopover === 'complexity'
                      ? '1px solid rgba(56, 189, 248, 0.5)'
                      : '1px solid rgba(56, 189, 248, 0.25)',
                    color: 'var(--text-secondary)',
                    padding: '4px 8px',
                    fontSize: '11.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivePopover((prev) => (prev === 'complexity' ? null : 'complexity'));
                    }
                  }}
                  aria-expanded={activePopover === 'complexity'}
                  aria-haspopup="dialog"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} color={theme === 'apple-gsos' ? '#ffffff' : '#38bdf8'} />
                    <span>Time:</span>
                    <strong style={{ color: theme === 'apple-gsos' ? '#ffffff' : 'var(--accent-cyan)' }}>{currentCard.targetTime || 'O(1)'}</strong>
                  </span>

                  {currentCard.targetSpace && (
                    <>
                      <span style={{ opacity: theme === 'apple-gsos' ? 0.8 : 0.4, color: theme === 'apple-gsos' ? '#ffffff' : undefined }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Database size={11} color={theme === 'apple-gsos' ? '#ffffff' : '#c084fc'} />
                        <span>Space:</span>
                        <strong style={{ color: theme === 'apple-gsos' ? '#ffffff' : 'var(--accent-purple)' }}>{currentCard.targetSpace}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Floating Complexity Explanation Card */}
                {activePopover === 'complexity' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '0',
                      zIndex: 100,
                      width: '320px',
                      backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                      backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                      border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(56, 189, 248, 0.12)',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: 'var(--text-primary)',
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={13} color="var(--accent-cyan)" />
                        <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12px' }}>
                          Target Complexity Goals
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopover(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                        }}
                        aria-label="Close complexity details"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: currentCard.complexityExplanation ? '10px' : '0',
                        padding: '6px 8px',
                        backgroundColor: theme === 'apple-gsos' ? '#F2F1EA' : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        border: theme === 'apple-gsos' ? '1px solid #B8B7AD' : '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color={theme === 'apple-gsos' ? '#1D4ED8' : '#38bdf8'} />
                        <span style={{ color: theme === 'apple-gsos' ? '#555555' : 'var(--text-muted)', fontSize: '11px' }}>Time:</span>
                        <strong style={{ color: theme === 'apple-gsos' ? '#1D4ED8' : 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                          {currentCard.targetTime || 'O(1)'}
                        </strong>
                      </div>
                      {currentCard.targetSpace && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Database size={12} color={theme === 'apple-gsos' ? '#6D28D9' : '#c084fc'} />
                          <span style={{ color: theme === 'apple-gsos' ? '#555555' : 'var(--text-muted)', fontSize: '11px' }}>Space:</span>
                          <strong style={{ color: theme === 'apple-gsos' ? '#6D28D9' : 'var(--accent-purple)', fontFamily: 'monospace' }}>
                            {currentCard.targetSpace}
                          </strong>
                        </div>
                      )}
                    </div>

                    {currentCard.complexityExplanation ? (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-primary)',
                          lineHeight: '1.45',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: theme === 'apple-gsos' ? '#555555' : 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Why this complexity target:
                        </span>
                        {currentCard.complexityExplanation}
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Aim for these asymptotic targets in your cold-start implementation.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. Streak Badge with Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                className="badge streak-badge-chip"
                onClick={() => setActivePopover((prev) => (prev === 'streak' ? null : 'streak'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'streak' ? null : 'streak'));
                  }
                }}
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  color: '#f97316',
                  border: activePopover === 'streak' ? '1px solid #f97316' : '1px solid rgba(249, 115, 22, 0.3)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Flame size={13} />
                <span>Streak: {currentCard.streak}</span>
              </div>

              {activePopover === 'streak' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '0',
                    zIndex: 100,
                    width: '300px',
                    backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                    border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(249, 115, 22, 0.4)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(249, 115, 22, 0.12)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={14} color="#f97316" />
                      <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12px' }}>
                        Streak & Progression
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                      style={{ background: 'none', border: 'none', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      aria-label="Close streak details"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                    <strong style={{ color: theme === 'apple-gsos' ? '#C2410C' : '#f97316', fontSize: '15px' }}>
                      {currentCard.streak}
                    </strong>
                    <span style={{ color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-secondary)', fontSize: '11.5px' }}>
                      consecutive correct recall{currentCard.streak === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-secondary)', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <li>
                      <strong style={{ color: theme === 'apple-gsos' ? '#15803D' : '#34d399' }}>Pass:</strong> Increases streak (+1) and advances this card to {algorithm === 'graduated-interval' ? 'Tier' : 'Box'} {Math.min(algorithm === 'graduated-interval' ? 9 : 5, currentCard.box + 1)} with longer spacing.
                    </li>
                    <li>
                      <strong style={{ color: theme === 'apple-gsos' ? '#B91C1C' : '#f87171' }}>Missing Invariants:</strong> Resets streak to 0 and drops this card to Tier 1 for immediate reinforcement.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 6. Stopwatch Timer with Auto-Submit Indicator & Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                border: activePopover === 'timer' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-medium)',
              }}
            >
              <div
                onClick={() => setActivePopover((prev) => (prev === 'timer' ? null : 'timer'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'timer' ? null : 'timer'));
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Timer
                  size={16}
                  color={timeRemaining <= 120 ? '#fb7185' : 'var(--text-secondary)'}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: timeRemaining <= 120 ? '#fb7185' : 'var(--text-primary)',
                    minWidth: '48px',
                  }}
                >
                  {formatTimer(timeRemaining)}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: theme === 'apple-gsos' ? '#B45309' : '#fbbf24',
                    backgroundColor: theme === 'apple-gsos' ? 'rgba(217, 119, 6, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                    border: theme === 'apple-gsos' ? '1px solid #D97706' : '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Zap size={10} color={theme === 'apple-gsos' ? '#B45309' : '#fbbf24'} /> Auto-submits on 00:00
                </span>
              </div>

              <button
                className="btn btn-outline"
                style={{ padding: '4px 6px', fontSize: '11px', height: '26px' }}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
              >
                {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '4px 6px', fontSize: '11px', height: '26px' }}
                onClick={() => {
                  setIsTimerRunning(timedMode);
                  setTimeRemaining(configuredDuration);
                  setTimeExpiredToast(null);
                }}
                aria-label="Reset timer"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Timer Popover */}
            {activePopover === 'timer' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: '0',
                  left: 'auto',
                  zIndex: 100,
                  width: '310px',
                  backgroundColor: theme === 'apple-gsos' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.96)',
                  backdropFilter: theme === 'apple-gsos' ? 'none' : 'blur(12px)',
                  border: theme === 'apple-gsos' ? '1.5px solid #1C1C1C' : '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  boxShadow: theme === 'apple-gsos' ? '3px 3px 0px rgba(28, 28, 28, 0.25)' : '0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.12)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: theme === 'apple-gsos' ? '1px solid #DDDCD4' : '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Timer size={14} color={theme === 'apple-gsos' ? '#B45309' : '#fbbf24'} />
                    <span style={{ fontWeight: 600, color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9', fontSize: '12px' }}>
                      Stopwatch & Auto-Submit
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                    style={{ background: 'none', border: 'none', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    aria-label="Close timer details"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-secondary)', fontSize: '11.5px' }}>
                  <p style={{ margin: 0 }}>
                    ⚡ <strong style={{ color: theme === 'apple-gsos' ? '#B45309' : '#fbbf24' }}>Auto-Submission:</strong> When the countdown reaches <strong>00:00</strong>, your code buffer is automatically submitted for test execution and AI evaluation.
                  </p>
                  <p style={{ margin: 0 }}>
                    ⏱️ <strong style={{ color: theme === 'apple-gsos' ? '#1C1C1C' : '#f1f5f9' }}>Duration:</strong> Configured for {Math.round(configuredDuration / 60)} minutes. You can adjust the default duration in Settings (⚙️).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {currentCard.title}
        </h1>

        {/* Prompt Seed Instructions */}
        <div
          className="prompt-seed-box"
          style={{
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-editor)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {currentCard.promptSeed}
        </div>

        {/* Target Contract (Input vs Expected Output) */}
        {(() => {
          const contractCases =
            currentCard.testCases && currentCard.testCases.length > 0
              ? currentCard.testCases
              : extractHarnessContracts(currentCard.testHarness);

          if (!contractCases || contractCases.length === 0) return null;

          return (
            <div
              className="contract-table-container"
              data-tour="contract"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                overflow: 'hidden',
              }}
            >
              <div
                className="contract-table-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-table-header-bar)',
                  borderBottom: showHarness ? '1px solid rgba(56, 189, 248, 0.15)' : 'none',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlaskConical size={14} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                    Target Contract: Input vs Expected Output
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {contractCases.length} {contractCases.length === 1 ? 'case' : 'cases'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHarness((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                  title={showHarness ? 'Collapse contract table' : 'Expand contract table'}
                  aria-label={showHarness ? 'Collapse contract table' : 'Expand contract table'}
                >
                  <span>{showHarness ? 'Hide' : 'Show'}</span>
                  {showHarness ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showHarness && (
                <div
                  className="contract-table-body"
                  style={{
                    overflowX: 'auto',
                    backgroundColor: 'var(--bg-table-body)',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr
                        className="contract-table-th"
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        <th style={{ padding: '8px 12px', width: '28%' }}>Test Case / Scenario</th>
                        <th style={{ padding: '8px 12px', width: '42%' }}>Target Input / Call Signature</th>
                        <th style={{ padding: '8px 12px', width: '30%' }}>Expected Output / Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractCases.map((tc, idx) => {
                        const isError =
                          tc.expected.toLowerCase().includes('throw') ||
                          tc.expected.toLowerCase().includes('error') ||
                          tc.expected.toLowerCase().includes('reject');

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderBottom:
                                idx < contractCases.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                            }}
                          >
                            <td
                              className="contract-table-td"
                              style={{
                                padding: '8px 12px',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                                verticalAlign: 'top',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  className="test-case-circle"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--badge-test-case-bg)',
                                    color: 'var(--badge-test-case-text)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span>{tc.description || `Case #${idx + 1}`}</span>
                              </div>
                            </td>
                            <td
                              className="contract-table-td"
                              style={{
                                padding: '8px 12px',
                                verticalAlign: 'top',
                              }}
                            >
                              <code
                                style={{
                                  fontFamily: '"Fira Code", "JetBrains Mono", Menlo, monospace',
                                  fontSize: '11.5px',
                                  backgroundColor: theme === 'apple-gsos' ? '#F2F1EA' : 'rgba(0, 0, 0, 0.45)',
                                  color: theme === 'apple-gsos' ? '#1C1C1C' : '#93c5fd',
                                  border: theme === 'apple-gsos' ? '1px solid #B8B7AD' : 'none',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  fontVariantLigatures: 'normal',
                                  fontFeatureSettings: '"calt" 1, "liga" 1',
                                }}
                              >
                                {tc.input}
                              </code>
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                verticalAlign: 'top',
                              }}
                            >
                              <code
                                style={{
                                  fontFamily: '"Fira Code", "JetBrains Mono", Menlo, monospace',
                                  fontSize: '11.5px',
                                  backgroundColor: isError
                                    ? (theme === 'apple-gsos' ? 'rgba(221, 51, 34, 0.12)' : 'rgba(239, 68, 68, 0.15)')
                                    : (theme === 'apple-gsos' ? 'rgba(34, 153, 85, 0.14)' : 'rgba(16, 185, 129, 0.15)'),
                                  color: isError
                                    ? (theme === 'apple-gsos' ? '#B91C1C' : '#f87171')
                                    : (theme === 'apple-gsos' ? '#15803D' : '#34d399'),
                                  border: isError
                                    ? (theme === 'apple-gsos' ? '1px solid rgba(221, 51, 34, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)')
                                    : (theme === 'apple-gsos' ? '1px solid rgba(34, 153, 85, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)'),
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  fontWeight: 600,
                                  fontVariantLigatures: 'normal',
                                  fontFeatureSettings: '"calt" 1, "liga" 1',
                                }}
                              >
                                {tc.expected}
                              </code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tags */}
        {currentCard.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currentCard.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Results (if already evaluated) */}
      {evalResult && (
        <EvaluationPanel
          theme={theme}
          topic={currentCard}
          submittedCode={code}
          result={evalResult}
          totalCompletedReviews={totalCompletedReviews}
          activeDeckSize={activeDeckSize}
          algorithm={algorithm}
          onCommit={handleCommit}
          onRetry={() => {
            setEvalResult(null);
            setShowSolution(false);
          }}
          showSolution={showSolution}
          onToggleShowSolution={() => setShowSolution((prev) => !prev)}
          isReinforcement={isReinforcement}
          onFinishReinforcement={handleFinishDrill}
        />
      )}

      {/* Blank-Buffer Editor Area */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Terminal size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{evalResult ? 'Your Submitted Answer (locked)' : 'Cold-Start Buffer'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap', ...(evalResult ? { pointerEvents: 'none' as const, opacity: 0.4 } : {}) }}>
            {formatToast && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor:
                    formatToast.type === 'success'
                      ? 'rgba(52, 211, 153, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  color: formatToast.type === 'success' ? '#34d399' : '#f87171',
                  border: `1px solid ${
                    formatToast.type === 'success'
                      ? 'rgba(52, 211, 153, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`,
                }}
              >
                {formatToast.message}
              </span>
            )}

            {/* Quick Toggle Test Snippet Comments */}
            {code.includes('// Test runner example:') && (
              <button
                type="button"
                onClick={handleToggleTestComments}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  padding: '2px 4px',
                }}
                title="Toggle commented / uncommented status of test runner lines"
              >
                <Code2 size={12} /> Toggle Test Comments
              </button>
            )}

            {/* Auto-format code button */}
            <button
              type="button"
              onClick={handleFormatCode}
              disabled={isFormatting || !code.trim()}
              {...shortcutAttrs('format')}
              style={{
                background: 'none',
                border: 'none',
                color: isFormatting ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: isFormatting ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                transition: 'color 0.15s ease',
              }}
            >
              <Sparkles size={12} color={isFormatting ? 'var(--accent-cyan)' : '#a78bfa'} />
              {isFormatting ? 'Formatting...' : 'Format'}
            </button>

            {/* Reset to starter snippet */}
            <button
              type="button"
              onClick={() => {
                clearDraft(currentCard?.id);
                setCode(getStarterSnippet(currentCard));
                setIsPreviewLive(false);
                setMountedComponent(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
              }}
              title="Reset code editor to starter template"
            >
              <RotateCcw size={12} /> Reset
            </button>

            {/* Clear buffer */}
            {code.length > 0 && (
              <button
                type="button"
                onClick={() => setCode('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                }}
                title="Clear code buffer"
              >
                <Eraser size={12} /> Clear
              </button>
            )}
          </div>
        </div>

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

        {/* Mode Selector Bar: JS (Fast) vs TS (Strict Type Check) */}
        <div
          style={{
            ...(evalResult ? { pointerEvents: 'none' as const, opacity: 0.4 } : {}),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Mode:
            </span>
            <div
              className="mode-toggle-group"
              style={{
                display: 'inline-flex',
                borderRadius: '6px',
                backgroundColor: theme === 'apple-gsos' ? '#DDDCD4' : 'rgba(0, 0, 0, 0.4)',
                padding: '2px',
                border: theme === 'apple-gsos' ? '1px solid #1C1C1C' : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={() => setExecutionMode('js')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: theme === 'apple-gsos' && executionMode === 'js' ? '1px solid #1C1C1C' : '1px solid transparent',
                  fontSize: '11.5px',
                  fontWeight: executionMode === 'js' ? 700 : 500,
                  backgroundColor: executionMode === 'js'
                    ? (theme === 'apple-gsos' ? '#4455AA' : 'rgba(56, 189, 248, 0.2)')
                    : 'transparent',
                  color: executionMode === 'js'
                    ? (theme === 'apple-gsos' ? '#ffffff' : '#38bdf8')
                    : (theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-dim)'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: theme === 'apple-gsos' && executionMode === 'js' ? '1px 1px 0px #1C1C1C' : 'none',
                }}
                title="Fast transpilation (Sucrase) without strict compile-time type-checking"
              >
                JS (Fast)
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('ts')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: theme === 'apple-gsos' && executionMode === 'ts' ? '1px solid #1C1C1C' : '1px solid transparent',
                  fontSize: '11.5px',
                  fontWeight: executionMode === 'ts' ? 700 : 500,
                  backgroundColor: executionMode === 'ts'
                    ? (theme === 'apple-gsos' ? '#4455AA' : 'rgba(49, 120, 198, 0.25)')
                    : 'transparent',
                  color: executionMode === 'ts'
                    ? (theme === 'apple-gsos' ? '#ffffff' : '#60a5fa')
                    : (theme === 'apple-gsos' ? '#1C1C1C' : 'var(--text-dim)'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: theme === 'apple-gsos' && executionMode === 'ts' ? '1px 1px 0px #1C1C1C' : 'none',
                }}
                title="Full TypeScript compiler type-checking (strict checks, interfaces, generics)"
              >
                TS (Strict Type Check)
              </button>
            </div>
          </div>
        </div>

        {!evalResult && (
          <>
        {/* Action Controls Bar */}
        <div data-tour="actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSkip}
            disabled={isEvaluating || isRunning}
            style={{ fontSize: '13px' }}
          >
            <SkipForward size={15} /> Skip Card
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* Secondary Button: Run Code / Test */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRunCode}
              disabled={!code.trim() || isEvaluating || isRunning}
              style={{ fontSize: '14px', padding: '10px 18px', gap: '6px' }}
              {...shortcutAttrs('run')}
            >
              {isRunning ? (
                <>
                  <Loader2 size={15} className="animate-spin" color="#38bdf8" /> Running...
                </>
              ) : (
                <>
                  <Play size={15} color="#38bdf8" /> Run Code / Test
                </>
              )}
            </button>

            {/* Primary Button: Submit Final Answer (the scored attempt) / Check My Practice (drill, no score) */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isEvaluating || isRunning || !code.trim()}
              style={{ fontSize: '14px', padding: '10px 22px' }}
              {...shortcutAttrs('submit')}
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Checking your answer...
                </>
              ) : (
                <>
                  <Send size={16} /> {isReinforcement ? 'Check My Practice' : 'Submit Final Answer'}
                </>
              )}
            </button>
          </div>
        </div>
          </>
        )}

        {!evalResult && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }} data-testid="submit-help">
            {isReinforcement
              ? 'Practice drill: nothing here changes your score. Retype the solution, then check it.'
              : 'Run Code / Test checks your code without scoring it. Submit Final Answer is your scored attempt.'}
          </p>
        )}

        {/* Test Runner & Live Preview Container */}
        <div
          style={{
            marginTop: '12px',
            display: 'grid',
            gridTemplateColumns: isComponentProblem
              ? 'repeat(auto-fit, minmax(420px, 1fr))'
              : '1fr',
            gap: '14px',
            alignItems: 'start',
          }}
        >
          {/* Dark Terminal / Console Output Container */}
          <div
            className="console-runner-container"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#030712',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Terminal Title Bar */}
            <div
              className="console-runner-header"
              onClick={() => setIsOutputOpen(!isOutputOpen)}
              style={{
                padding: '10px 14px',
                backgroundColor: '#080d1a',
                borderBottom: isOutputOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <Terminal size={15} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                  Console & Test Runner
                </span>

                {/* Status Indicators (Green / Red / Running / Ready) */}
                {isRunning ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    <Loader2 size={11} className="animate-spin" /> Running...
                  </span>
                ) : executionStatus === 'success' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#34d399',
                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 6px #10b981',
                      }}
                    />
                    Passed (0 Errors)
                  </span>
                ) : executionStatus === 'error' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#f87171',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        boxShadow: '0 0 6px #ef4444',
                      }}
                    />
                    Failed ({errorCount} Error{errorCount === 1 ? '' : 's'})
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#64748b',
                      }}
                    />
                    Ready
                  </span>
                )}

                {/* Log count badge */}
                {outputLogs.length > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      backgroundColor: errorCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.12)',
                      color: errorCount > 0 ? '#f87171' : '#38bdf8',
                      fontWeight: 600,
                    }}
                  >
                    {outputLogs.length} {outputLogs.length === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {outputLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOutputLogs([]);
                      setExecutionStatus('idle');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      padding: '2px 6px',
                    }}
                    title="Clear console output"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {isOutputOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
            </div>

            {/* Terminal Console Output Body */}
            {isOutputOpen && (
              <div
                className="console-runner-body"
                style={{
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  lineHeight: 1.6,
                  backgroundColor: theme === 'apple-gsos' ? '#FAFAFA' : '#030712',
                  color: theme === 'apple-gsos' ? '#1C1C1C' : '#cbd5e1',
                  borderTop: theme === 'apple-gsos' ? '1px solid #1C1C1C' : '1px solid rgba(255, 255, 255, 0.08)',
                  fontVariantLigatures: 'normal',
                  fontFeatureSettings: '"calt" 1, "liga" 1',
                }}
              >
                {outputLogs.length === 0 ? (
                  <div style={{ color: theme === 'apple-gsos' ? '#666666' : '#64748b', fontStyle: 'italic', fontSize: '12px', padding: '6px 2px' }}>
                    No output yet. Click 'Run Code / Test' (or Cmd+Enter) above to execute your solution and view test assertions or console.log outputs.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {outputLogs.map((log, index) => {
                      let textColor = theme === 'apple-gsos' ? '#1C1C1C' : '#e2e8f0';
                      let badgeBg = theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.15)';
                      let badgeColor = theme === 'apple-gsos' ? '#4455AA' : '#38bdf8';
                      let badgeLabel = 'LOG';
                      let rowBg = 'transparent';
                      let icon = null;

                      if (log.content.includes('FAIL')) {
                        textColor = '#DD3322';
                        badgeBg = 'rgba(221, 51, 34, 0.18)';
                        badgeColor = '#DD3322';
                        badgeLabel = 'FAIL';
                        rowBg = theme === 'apple-gsos' ? 'rgba(221, 51, 34, 0.08)' : 'rgba(239, 68, 68, 0.1)';
                        icon = <XCircle size={13} color="#DD3322" style={{ flexShrink: 0, marginTop: '3px' }} />;
                      } else if (log.type === 'error') {
                        textColor = '#DD3322';
                        badgeBg = 'rgba(221, 51, 34, 0.18)';
                        badgeColor = '#DD3322';
                        badgeLabel = 'ERROR';
                        rowBg = theme === 'apple-gsos' ? 'rgba(221, 51, 34, 0.08)' : 'rgba(239, 68, 68, 0.08)';
                        icon = <XCircle size={13} color="#DD3322" style={{ flexShrink: 0, marginTop: '3px' }} />;
                      } else if (log.type === 'warn') {
                        textColor = theme === 'apple-gsos' ? '#B45309' : '#fbbf24';
                        badgeBg = 'rgba(245, 158, 11, 0.2)';
                        badgeColor = '#D97706';
                        badgeLabel = 'WARN';
                        rowBg = 'rgba(245, 158, 11, 0.08)';
                        icon = <AlertTriangle size={13} color="#D97706" style={{ flexShrink: 0, marginTop: '3px' }} />;
                      } else if (log.type === 'info') {
                        textColor = theme === 'apple-gsos' ? '#4455AA' : '#38bdf8';
                        badgeBg = theme === 'apple-gsos' ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.15)';
                        badgeColor = theme === 'apple-gsos' ? '#4455AA' : '#38bdf8';
                        badgeLabel = 'INFO';
                      } else {
                        // Check if output includes test PASS indicator
                        if (log.content.includes('PASS')) {
                          textColor = theme === 'apple-gsos' ? '#1B7A43' : '#34d399';
                          badgeBg = 'rgba(34, 153, 85, 0.18)';
                          badgeColor = '#229955';
                          badgeLabel = 'PASS';
                        }
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: rowBg,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          <span style={{ color: '#475569', fontSize: '11px', flexShrink: 0, userSelect: 'none', marginTop: '2px' }}>
                            [{log.timestamp}]
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              userSelect: 'none',
                              flexShrink: 0,
                              letterSpacing: '0.03em',
                              marginTop: '2px',
                            }}
                          >
                            {badgeLabel}
                          </span>
                          {icon}
                          <span style={{ color: textColor, flex: 1, whiteSpace: 'pre-wrap' }}>
                            {log.content.includes(' | Expected: ') && log.content.includes(' | Received: ') ? (
                              (() => {
                                const [header, rest] = log.content.split(' | Expected: ');
                                const [expectedPart, receivedPart] = (rest || '').split(' | Received: ');
                                return (
                                  <span>
                                    <span style={{ fontWeight: 600 }}>{header}</span>
                                    <span style={{ color: '#94a3b8' }}> | Expected: </span>
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>{expectedPart}</span>
                                    <span style={{ color: '#94a3b8' }}> | Received: </span>
                                    <span style={{ color: '#f87171', fontWeight: 600 }}>{receivedPart}</span>
                                  </span>
                                );
                              })()
                            ) : (
                              log.content
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right-Side Box on React Component Problems: Live React Preview (if card has previewCode) or Legacy Component Preview */}
          {isComponentProblem && (
            currentCard?.previewCode ? (
              <ReactPreview
                card={currentCard}
                code={code}
                executionMode={executionMode}
                theme={theme}
                isLive={isPreviewLive}
                runTrigger={previewRunTrigger}
              />
            ) : (
              <div
              className="legacy-component-preview-container"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                backgroundColor: '#030712',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Title Bar */}
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#061320',
                  borderBottom: '1px solid rgba(6, 182, 212, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={15} color="#06b6d4" />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#f1f5f9' }}>
                    Component Preview / Hook Test {isLegacyPoppedOut ? '(Pop-out)' : ''}
                  </span>
                  {mountedComponent ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 6px #10b981',
                        }}
                      />
                      Live Mounted
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        color: 'var(--text-dim)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#64748b',
                        }}
                      />
                      Unmounted
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mountedComponent && (
                    <button
                      type="button"
                      onClick={() => setMountedComponent(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '2px 6px',
                      }}
                      title="Unmount and reset preview"
                    >
                      <RotateCcw size={12} /> Reset Mount
                    </button>
                  )}

                  {isLegacyPoppedOut ? (
                    <button
                      type="button"
                      onClick={handleLegacyDockBack}
                      data-testid="legacy-preview-title-dock-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '2px 6px',
                      }}
                      title="Dock preview back"
                    >
                      <Minimize2 size={12} /> Dock back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLegacyPopOut}
                      data-testid="legacy-preview-popout-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '2px 6px',
                      }}
                      title="Pop out component preview into separate window"
                    >
                      <ExternalLink size={12} /> Pop out
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Content Area */}
              <div
                style={{
                  padding: '16px',
                  minHeight: '200px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  backgroundColor: '#050a14',
                  color: '#cbd5e1',
                  fontSize: '13px',
                }}
              >
                {isLegacyPoppedOut && legacyPopupWindow ? (
                  <div
                    style={{
                      minHeight: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '8px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <Layers size={24} color="#06b6d4" />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                      Live Component Preview (Pop-out Active)
                    </div>
                    <div style={{ fontSize: '11.5px', maxWidth: '300px', lineHeight: 1.5 }}>
                      Component preview is currently rendering in an external window.
                    </div>
                    <button
                      type="button"
                      onClick={handleLegacyDockBack}
                      data-testid="legacy-preview-main-dock-btn"
                      className="btn btn-secondary"
                      style={{ fontSize: '11.5px', padding: '4px 10px', marginTop: '4px', gap: '4px' }}
                    >
                      <Minimize2 size={12} /> Dock back
                    </button>
                    {createPortal(
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                        <div
                          style={{
                            padding: '8px 12px',
                            backgroundColor: theme === 'apple-gsos' ? '#f1f5f9' : '#061320',
                            borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            borderRadius: '6px',
                          }}
                        >
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: theme === 'apple-gsos' ? '#0f172a' : '#f1f5f9' }}>
                            Live Component Preview / Hook Test (Pop-out)
                          </span>
                          <button
                            type="button"
                            onClick={handleLegacyDockBack}
                            data-testid="legacy-preview-popup-dock-btn"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '3px 8px', gap: '4px' }}
                          >
                            <Minimize2 size={11} /> Dock back
                          </button>
                        </div>
                        <ReactTestErrorBoundary
                          resetKey={mountedComponent?.key}
                          onError={(err) => {
                            appendConsoleLog('error', `React Render Exception: ${err.name}: ${err.message}`);
                            setIsOutputOpen(true);
                          }}
                        >
                          {mountedComponent ? (
                            <div key={mountedComponent.key} style={{ width: '100%' }}>
                              {mountedComponent.element}
                            </div>
                          ) : (
                            <div
                              style={{
                                height: '100%',
                                minHeight: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                padding: '24px 16px',
                                color: '#64748b',
                              }}
                            >
                              <Layers size={26} color="#0891b2" style={{ marginBottom: '8px', opacity: 0.7 }} />
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                                Ready to Preview
                              </div>
                              <div style={{ fontSize: '12px', maxWidth: '320px', lineHeight: 1.5, color: '#64748b' }}>
                                Run code to start live component preview.
                              </div>
                            </div>
                          )}
                        </ReactTestErrorBoundary>
                      </div>,
                      legacyPopupWindow.document.body
                    )}
                  </div>
                ) : (
                  <ReactTestErrorBoundary
                    resetKey={mountedComponent?.key}
                    onError={(err) => {
                      appendConsoleLog('error', `React Render Exception: ${err.name}: ${err.message}`);
                      setIsOutputOpen(true);
                    }}
                  >
                    {mountedComponent ? (
                      <div key={mountedComponent.key} style={{ width: '100%' }}>
                        {mountedComponent.element}
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          minHeight: '160px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '24px 16px',
                          color: '#64748b',
                        }}
                      >
                        <Layers size={26} color="#0891b2" style={{ marginBottom: '8px', opacity: 0.7 }} />
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                          Ready to Preview
                        </div>
                        <div style={{ fontSize: '12px', maxWidth: '320px', lineHeight: 1.5, color: '#64748b' }}>
                          Run code to start live component preview.
                        </div>
                      </div>
                    )}
                  </ReactTestErrorBoundary>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

