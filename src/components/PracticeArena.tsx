import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import {
  TRACK_METADATA,
  intervalForBox,
} from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';
import { evaluateCodeSubmission } from '../lib/ai';
import type { EvaluationResult } from '../lib/ai';
import { EvaluationPanel } from './EvaluationPanel';
import {
  Timer,
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
} from 'lucide-react';

interface PracticeArenaProps {
  currentCard: TopicItem | null;
  totalCompletedReviews: number;
  onCommitReview: (passed: boolean) => void;
  onSkipCard: () => void;
  onOpenDeckView: () => void;
}

const INITIAL_TIME = 10 * 60; // 600 seconds

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  currentCard,
  totalCompletedReviews,
  onCommitReview,
  onSkipCard,
  onOpenDeckView,
}) => {
  const [code, setCode] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  // 10-minute countdown stopwatch
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Plain Tab key handling: inserts 2 spaces without unfocusing or autocompleting
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      // Re-position cursor after the 2 spaces
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentCard || !code.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateCodeSubmission(currentCard, code);
      setEvalResult(res);
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCommit = (passed: boolean) => {
    onCommitReview(passed);
    setEvalResult(null);
    setCode('');
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

  const trackMeta = TRACK_METADATA[currentCard.track];
  const linesCount = code.split('\n').length;
  const charsCount = code.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Track Badge */}
            <span
              className="badge"
              style={{
                backgroundColor: trackMeta.bg,
                border: `1px solid ${trackMeta.border}`,
                color: trackMeta.color,
                fontWeight: 600,
                fontSize: '12px',
                padding: '4px 10px',
              }}
            >
              {trackMeta.label}
            </span>

            {/* Leitner Box Progression Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((b) => {
                const isCurrent = currentCard.box === b;
                const isPast = currentCard.box > b;
                return (
                  <div
                    key={b}
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
                        ? `var(--box-${b})`
                        : isPast
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isCurrent ? '#090c12' : isPast ? '#f1f5f9' : 'var(--text-dim)',
                      border: isCurrent ? '1px solid white' : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}
                    title={`Box ${b} (+${intervalForBox(b)} reviews)`}
                  >
                    B{b}
                  </div>
                );
              })}
            </div>

            {/* Streak Badge */}
            <div
              className="badge"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                padding: '4px 8px',
              }}
            >
              <Flame size={13} />
              <span>Streak: {currentCard.streak}</span>
            </div>

            {/* Global Trial Spacing Info */}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Eligible at trial: <strong>#{currentCard.nextEligibleTrial}</strong> (Current: #{totalCompletedReviews})
            </span>
          </div>

          {/* 10-Minute Countdown Stopwatch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
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
            <button
              className="btn btn-outline"
              style={{ padding: '4px 6px', fontSize: '11px', height: '26px' }}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              title={isTimerRunning ? 'Pause timer' : 'Start 10m timer'}
              aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '4px 6px', fontSize: '11px', height: '26px' }}
              onClick={() => {
                setIsTimerRunning(false);
                setTimeRemaining(INITIAL_TIME);
              }}
              title="Reset timer to 10:00"
              aria-label="Reset timer"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {currentCard.title}
        </h1>

        {/* Prompt Seed Instructions */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-editor)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap',
          }}
        >
          {currentCard.promptSeed}
        </div>

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
          topic={currentCard}
          submittedCode={code}
          result={evalResult}
          totalCompletedReviews={totalCompletedReviews}
          onCommit={handleCommit}
          onRetry={() => setEvalResult(null)}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Terminal size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Cold-Start Buffer</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              (No autocomplete • No ghost text • Pure recall)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>{linesCount} lines</span>
            <span>{charsCount} chars</span>
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

        {/* The Hard-Disabled Plain HTML Textarea */}
        <textarea
          ref={textareaRef}
          className="code-buffer"
          rows={16}
          placeholder="// Type your solution from scratch without autocomplete or hints...
// Press [Tab] for 2-space indentation.
// Focus on boundary conditions and invariants."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          // Mandatory Hard-Disabled Attributes from specification
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          style={{ minHeight: '340px' }}
        />

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onSkipCard}
            disabled={isEvaluating}
            style={{ fontSize: '13px' }}
          >
            <SkipForward size={15} /> Skip Card
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isEvaluating || !code.trim()}
            style={{ fontSize: '14px', padding: '10px 22px' }}
          >
            {isEvaluating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Evaluating Code with AI...
              </>
            ) : (
              <>
                <Send size={16} /> Submit for AI Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
