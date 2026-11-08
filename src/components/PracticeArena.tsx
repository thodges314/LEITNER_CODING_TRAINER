import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { graphql } from 'cm6-graphql';
import rainbowBrackets from 'rainbowbrackets';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { createTsHoverExtension } from './practice/tsHoverExtension';
import { resolveExecutionModeForCard, setPreferredExecutionMode } from '../lib/editorSettings';
import { loadDraft, saveDraft, clearDraft } from '../lib/drafts';
import {
  getTrackMeta,
  isReactComponentCard,
  getCardInputLanguage,
} from '../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../lib/leitner';
import { evaluateCodeSubmission } from '../lib/ai';
import type { EvaluationResult } from '../lib/ai';
import { EvaluationPanel } from './EvaluationPanel';
import { CheckCircle, Info } from 'lucide-react';
import { detectRedundantScopeInput } from '../utils/cardPromptTypes';
import type { RedundantScopeWarning } from '../utils/cardPromptTypes';
import { runHarness } from '../lib/runner';
import { terminateActiveWorker } from '../lib/workerClient';
import { extractHarnessContracts } from '../lib/harnessContracts';
import { getStarterSnippet } from './practice/starterSnippet';
import { formatCode } from '../lib/formatter';
import { MarkdownContent } from './MarkdownContent';
import { isTsOnlyCard } from '../lib/tsOnly';
import type { AppTheme } from '../lib/theme';

import { ReinforcementBanner } from './practice/ReinforcementBanner';
import { PracticeHeader } from './practice/PracticeHeader';
import type { PopoverType } from './practice/PracticeHeader';
import { ContractTable } from './practice/ContractTable';
import { EditorToolbar, EditorActionControls } from './practice/EditorToolbar';
import { ConsoleRunnerDrawer } from './practice/ConsoleRunnerDrawer';
import { ComponentPreviewPane } from './practice/ComponentPreviewPane';
import { SocraticClarificationAssistant } from './practice/SocraticClarificationAssistant';
import { useLegacyComponentPopup } from '../hooks/useLegacyComponentPopup';
import { useTimedPractice } from '../hooks/useTimedPractice';
import { usePracticeCodeExecution } from '../hooks/usePracticeCodeExecution';

interface PracticeArenaProps {
  currentCard: TopicItem | null;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm?: SpacedAlgorithm;
  onCommitReview: (passed: boolean) => void;
  onRecordReview?: (passed: boolean) => void;
  onOverrideReview?: (passed: boolean) => void;
  onSkipCard: () => void;
  onRemoveFromDeck?: (topic: TopicItem) => void;
  onOpenDeckView: () => void;
  onOpenSettings?: (section?: 'ai') => void;
  isReinforcement?: boolean;
  onFinishReinforcement?: () => void;
  theme?: AppTheme;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  currentCard,
  totalCompletedReviews,
  activeDeckSize,
  algorithm = 'leitner',
  onCommitReview,
  onRecordReview,
  onOverrideReview,
  onSkipCard,
  onRemoveFromDeck,
  onOpenDeckView,
  onOpenSettings,
  isReinforcement,
  onFinishReinforcement,
  theme = 'dark',
}) => {
  const [activeCardId, setActiveCardId] = useState(() => currentCard?.id);
  const [cardSnapshot, setCardSnapshot] = useState<TopicItem | null>(() => currentCard);
  const [reviewsSnapshot, setReviewsSnapshot] = useState(() => totalCompletedReviews);

  if (currentCard && currentCard.id !== activeCardId) {
    setActiveCardId(currentCard.id);
    setCardSnapshot(currentCard);
    setReviewsSnapshot(totalCompletedReviews);
  }
  const [code, setCode] = useState(() =>
    isReinforcement ? getStarterSnippet(currentCard) : (loadDraft(currentCard?.id) ?? getStarterSnippet(currentCard))
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

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

  const {
    legacyPopupWindow,
    isLegacyPoppedOut,
    handleLegacyPopOut,
    handleLegacyDockBack,
  } = useLegacyComponentPopup(currentCard, theme);

  const {
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
  } = usePracticeCodeExecution({
    currentCard,
    code,
    executionMode,
    isTsTrack,
  });

  const actionsRef = useRef<{
    handleRunCode: () => Promise<void>;
    handleSubmit: () => Promise<void>;
    handleFormatCode: () => Promise<void>;
  }>({
    handleRunCode: () => Promise.resolve(),
    handleSubmit: () => Promise.resolve(),
    handleFormatCode: () => Promise.resolve(),
  });

  const handleTimeExpiredSubmit = useCallback(() => {
    void actionsRef.current.handleSubmit();
  }, []);

  const {
    timedMode,
    configuredDuration,
    timeRemaining,
    setTimeRemaining,
    isTimerRunning,
    setIsTimerRunning,
    timeExpiredToast,
    setTimeExpiredToast,
    formatTimer,
  } = useTimedPractice(Boolean(evalResult), isEvaluating, handleTimeExpiredSubmit);

  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatToast, setFormatToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [scopeWarning, setScopeWarning] = useState<RedundantScopeWarning | null>(null);
  const [dismissedScopeKinds, setDismissedScopeKinds] = useState<Record<string, boolean>>({});

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
    if (!currentCard || isReinforcement || isEvaluating || evalResult) return;
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
  }, [code, currentCard, isReinforcement, isEvaluating, evalResult]);

  if (currentCard?.id !== prevCardId) {
    setPrevCardId(currentCard?.id);
    setShowSolution(false);
    setShowHarness(true);
    setActivePopover(null);
    setIsPreviewLive(false);
    setMountedComponent(null);
    setScopeWarning(null);
    setDismissedScopeKinds({});
    if (currentCard) setInspectedTier(currentCard.box);
    setExecutionMode(resolveExecutionModeForCard(currentCard));
  }

  // Sync active card prompt types into the TypeScript language service when in TS mode
  useEffect(() => {
    if (executionMode !== 'ts' || !currentCard || getCardInputLanguage(currentCard) !== 'javascript') return;
    let cancelled = false;
    void import('../utils/typeChecker').then(({ setActiveCardPromptTypes }) => {
      if (!cancelled) {
        setActiveCardPromptTypes(currentCard.promptSeed, currentCard.track);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [executionMode, currentCard]);

  // Autofocus editor on mount and card switch
  useEffect(() => {
    if (editorRef.current?.view) {
      editorRef.current.view.focus();
    }
    return () => {
      terminateActiveWorker();
    };
  }, [currentCard?.id]);

  // Format code with Prettier standalone
  const handleFormatCode = async () => {
    if (!code.trim() || isFormatting) return;
    setIsFormatting(true);
    try {
      const inputLang = getCardInputLanguage(currentCard);
      const modeOrLang = inputLang === 'javascript' ? executionMode === 'ts' : inputLang;
      const res = await formatCode(code, modeOrLang);
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
    const inputLang = getCardInputLanguage(currentCard);
    const langExt =
      inputLang === 'html'
        ? html()
        : inputLang === 'sql'
          ? sql()
          : inputLang === 'graphql'
            ? graphql()
            : javascript({ jsx: true, typescript: executionMode === 'ts' });
    const list = [
      langExt,
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
    if (executionMode === 'ts' && inputLang !== 'sql' && inputLang !== 'html' && inputLang !== 'graphql') {
      list.push(createTsHoverExtension());
    }
    return list;
  }, [executionMode, currentCard]);

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
      if (!isReinforcement) {
        onRecordReview?.(res.passed);
      }
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
          topic={cardSnapshot || currentCard}
          submittedCode={code}
          result={evalResult}
          totalCompletedReviews={reviewsSnapshot}
          activeDeckSize={activeDeckSize}
          algorithm={algorithm}
          onOverrideVerdict={(passed) => {
            if (!isReinforcement) {
              onOverrideReview?.(passed);
            }
          }}
          onCommit={(passed) => {
            clearDraft(currentCard.id);
            if (isReinforcement) {
              handleFinishDrill();
            } else {
              onCommitReview(passed);
              setEvalResult(null);
              setShowSolution(false);
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
          onOpenSettings={onOpenSettings}
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
            setScopeWarning(null);
            setDismissedScopeKinds({});
          }}
        />

        {scopeWarning && !evalResult && (
          <div
            role="status"
            data-testid="preloaded-scope-popup"
            className="arena-scope-warning-popup"
          >
            <div className="arena-scope-warning-content">
              <Info size={15} className="arena-scope-warning-icon" />
              <span>{scopeWarning.message}</span>
            </div>
            <button
              type="button"
              className="arena-scope-warning-dismiss"
              onClick={() => {
                setDismissedScopeKinds((prev) => ({ ...prev, [scopeWarning.kind]: true }));
                setScopeWarning(null);
              }}
            >
              Got it
            </button>
          </div>
        )}

        {/* CodeMirror 6 Editor with Rainbow Brackets & Cold-Start Mode */}
        <div className="cm-theme-container" data-tour="editor" onKeyDown={handleEditorKeyDown}>
          <CodeMirror
            ref={editorRef}
            value={code}
            height="380px"
            theme={theme === 'apple-gsos' ? 'light' : 'dark'}
            basicSetup={cmBasicSetup}
            extensions={extensions}
            onChange={(val) => {
              setCode(val);
              const warning = detectRedundantScopeInput(val, currentCard);
              if (warning && !dismissedScopeKinds[warning.kind]) {
                setScopeWarning(warning);
              } else {
                setScopeWarning(null);
              }}
            }
            editable={!evalResult}
            readOnly={Boolean(evalResult)}
            placeholder={
              getCardInputLanguage(currentCard) === 'html'
                ? '<!-- Write your HTML markup here...\n     Press [Tab] for 2-space indentation.\n     Autoclosing tags and quotes are enabled. -->'
                : getCardInputLanguage(currentCard) === 'sql'
                  ? '-- Write your SQL query here...\n-- Press [Tab] for 2-space indentation.'
                  : getCardInputLanguage(currentCard) === 'graphql'
                    ? '# Write your GraphQL query or schema here...\n# Press [Tab] for 2-space indentation.'
                    : '// Type your solution from scratch without autocomplete or hints...\n// Press [Tab] for 2-space indentation.\n// Bracket pair colorization and autoclosing brackets/quotes are enabled.'
            }
            autoFocus
          />
        </div>

        {/* Mode Selector Bar & Primary Action Controls */}
        <div data-tour="actions">
          <EditorActionControls
            evalResult={evalResult}
            executionMode={executionMode}
            inputLanguage={getCardInputLanguage(currentCard)}
            isTsTrack={isTsTrack}
            tsOnlyNotice={tsOnlyNotice}
            onSwitchExecutionMode={handleSwitchExecutionMode}
            onSkip={handleSkip}
            onRemoveFromDeck={onRemoveFromDeck && currentCard ? () => onRemoveFromDeck(currentCard) : undefined}
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
