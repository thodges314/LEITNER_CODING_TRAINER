import React from 'react';
import {
  Terminal,
  Sparkles,
  RotateCcw,
  Eraser,
  Play,
  Send,
  SkipForward,
  FolderMinus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { shortcutAttrs } from '../../lib/shortcuts';
import type { EvaluationResult } from '../../lib/ai';

export interface EditorToolbarProps {
  evalResult: EvaluationResult | null;
  formatToast: { message: string; type: 'success' | 'error' } | null;
  isFormatting: boolean;
  code: string;
  onFormatCode: () => void;
  onResetStarter: () => void;
  onClearBuffer: () => void;
  onOpenInterviewStrategy?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  evalResult,
  formatToast,
  isFormatting,
  code,
  onFormatCode,
  onResetStarter,
  onClearBuffer,
  onOpenInterviewStrategy,
}) => {
  return (
    <>
      {/* Top Header of Editor Pane */}
      <div className="arena-editor-top-bar">
        <div className="arena-editor-label">
          <Terminal size={16} color="var(--accent-cyan)" />
          <span>{evalResult ? 'Your Submitted Answer (locked)' : 'Cold-Start Buffer'}</span>
        </div>

        <div className={`arena-editor-actions-group ${evalResult ? 'arena-editor-actions-disabled' : ''}`}>
          {formatToast && (
            <span
              className={`arena-format-toast ${
                formatToast.type === 'success'
                  ? 'arena-format-toast-success'
                  : 'arena-format-toast-error'
              }`}
            >
              {formatToast.message}
            </span>
          )}

          {/* Auto-format code button */}
          <button
            type="button"
            onClick={onFormatCode}
            disabled={isFormatting || !code.trim()}
            {...shortcutAttrs('format')}
            className="arena-editor-btn-text"
          >
            <Sparkles size={12} color={isFormatting ? 'var(--accent-cyan)' : 'var(--accent-purple)'} />
            {isFormatting ? 'Formatting...' : 'Format'}
          </button>

          {/* Reset to starter snippet */}
          <button
            type="button"
            onClick={onResetStarter}
            className="arena-editor-btn-muted"
            title="Reset code editor to starter template"
          >
            <RotateCcw size={12} /> Reset
          </button>

          {/* Clear buffer */}
          {code.length > 0 && (
            <button
              type="button"
              onClick={onClearBuffer}
              className="arena-editor-btn-muted"
              title="Clear code buffer"
            >
              <Eraser size={12} /> Clear
            </button>
          )}

          {/* Open Interview Strategy & AI Coach */}
          {onOpenInterviewStrategy && (
            <button
              type="button"
              onClick={onOpenInterviewStrategy}
              className="arena-editor-btn-text"
              title="Open Interview Prep Strategy & AI Coach (Review briefing, checklist & dialogue)"
              data-testid="arena-editor-strategy-btn"
            >
              <Sparkles size={12} color="var(--accent-purple)" />
              <span>Strategy</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export interface EditorActionControlsProps {
  evalResult: EvaluationResult | null;
  executionMode: 'js' | 'ts';
  isTsTrack: boolean;
  tsOnlyNotice: boolean;
  onSwitchExecutionMode: (mode: 'js' | 'ts') => void;
  onSkip: () => void;
  onRemoveFromDeck?: () => void;
  onRunCode: () => void;
  onSubmit: () => void;
  isEvaluating: boolean;
  isRunning: boolean;
  code: string;
  isReinforcement?: boolean;
}

export const EditorActionControls: React.FC<EditorActionControlsProps> = ({
  evalResult,
  executionMode,
  isTsTrack,
  tsOnlyNotice,
  onSwitchExecutionMode,
  onSkip,
  onRemoveFromDeck,
  onRunCode,
  onSubmit,
  isEvaluating,
  isRunning,
  code,
  isReinforcement,
}) => {
  return (
    <>
      {/* Mode Selector Bar: JS (Fast) vs TS (Strict Type Check) */}
      <div
        className={`arena-mode-selector-bar ${evalResult ? 'arena-mode-selector-disabled' : ''}`}
      >
        <div className="arena-mode-selector-inner">
          <span className="arena-mode-selector-label">
            Mode:
          </span>
          <div className="arena-mode-toggle-group">
            <button
              type="button"
              aria-disabled={isTsTrack}
              onClick={() => onSwitchExecutionMode('js')}
              className={`arena-mode-btn ${executionMode === 'js' ? 'arena-mode-btn-active' : ''} ${
                isTsTrack ? 'arena-mode-btn-disabled' : ''
              }`}
              title={
                isTsTrack
                  ? 'TypeScript Patterns track cards require TS mode'
                  : 'Fast transpilation (Sucrase) without strict compile-time type-checking'
              }
            >
              JS (Fast)
            </button>
            <button
              type="button"
              onClick={() => onSwitchExecutionMode('ts')}
              className={`arena-mode-btn ${executionMode === 'ts' ? 'arena-mode-btn-active' : ''}`}
              title={
                isTsTrack
                  ? 'TypeScript mode is required for TypeScript Patterns cards'
                  : 'Full TypeScript compiler type-checking (strict checks, interfaces, generics)'
              }
            >
              {isTsTrack ? 'TS (Strict • Required)' : 'TS (Strict Type Check)'}
            </button>
          </div>

          {tsOnlyNotice && (
            <span
              role="status"
              data-testid="ts-only-notice"
              className="arena-ts-notice-toast"
            >
              <AlertTriangle size={11} /> This is a TypeScript topic, so it only runs in TypeScript mode.
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Buttons: Skip, Remove From Deck, Run Code, Submit */}
      {!evalResult && (
        <>
          <div className="arena-controls-bar">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline arena-controls-btn-skip"
                onClick={onSkip}
                disabled={isEvaluating || isRunning}
              >
                <SkipForward size={15} /> Skip Card
              </button>

              {onRemoveFromDeck && (
                <button
                  type="button"
                  className="btn btn-outline arena-controls-btn-remove-deck"
                  onClick={onRemoveFromDeck}
                  disabled={isEvaluating || isRunning}
                  title="Remove this card from current deck"
                  data-testid="arena-remove-from-deck-btn"
                >
                  <FolderMinus size={15} /> Remove From Deck
                </button>
              )}
            </div>

            <div className="arena-controls-btn-group">
              {/* Secondary Button: Run Code / Test */}
              <button
                type="button"
                className="btn btn-secondary arena-controls-btn-run"
                onClick={onRunCode}
                disabled={!code.trim() || isEvaluating || isRunning}
                {...shortcutAttrs('run')}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={15} className="animate-spin" color="var(--accent-cyan)" /> Running...
                  </>
                ) : (
                  <>
                    <Play size={15} color="var(--accent-cyan)" /> Run Code / Test
                  </>
                )}
              </button>

              {/* Primary Button: Submit Final Answer */}
              <button
                type="button"
                className="btn btn-primary arena-controls-btn-submit"
                onClick={onSubmit}
                disabled={isEvaluating || isRunning || !code.trim()}
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
    </>
  );
};
