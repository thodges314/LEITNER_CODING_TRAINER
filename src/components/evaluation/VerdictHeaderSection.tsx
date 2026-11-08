import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Sparkles,
  Check,
} from 'lucide-react';
import type { TopicItem } from '../../lib/leitner';
import type { EvaluationResult } from '../../lib/ai';
import { summarizeVerdict } from '../../lib/verdict';
import { getThemeColors } from '../../styles/colors';
import type { AppTheme } from '../../lib/theme';

export interface VerdictHeaderSectionProps {
  theme?: AppTheme;
  topic: TopicItem;
  result: EvaluationResult;
  effectiveVerdict: boolean;
  setEffectiveVerdict: (verdict: boolean) => void;
  onOverrideVerdict?: (passed: boolean) => void;
  overrideNotice: string | null;
  setOverrideNotice: (notice: string | null) => void;
  isReinforcement?: boolean;
}

export const VerdictHeaderSection: React.FC<VerdictHeaderSectionProps> = ({
  theme,
  topic,
  result,
  effectiveVerdict,
  setEffectiveVerdict,
  onOverrideVerdict,
  overrideNotice,
  setOverrideNotice,
  isReinforcement,
}) => {
  const isLight = theme === 'apple-gsos';
  const palette = useMemo(() => getThemeColors(theme), [theme]);
  const verdict = summarizeVerdict(result);
  const isOverridden = effectiveVerdict !== result.passed;
  const [showComplexityExplanation, setShowComplexityExplanation] = useState(false);

  return (
    <div
      className="eval-verdict-banner"
      data-verdict={effectiveVerdict ? 'passed' : 'failed'}
    >
      <div className="eval-verdict-header">
        <div className="eval-verdict-title-group">
          {effectiveVerdict ? (
            <CheckCircle2 size={32} color={palette.accentSecondary} />
          ) : (
            <XCircle size={32} color={palette.accentHighlight} />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="eval-verdict-title">
                {isReinforcement
                  ? (effectiveVerdict ? 'PATTERN REPLICATED!' : 'NEEDS REVISION (DRILL)')
                  : (effectiveVerdict ? 'PASSED' : 'NEEDS REVISION')}
              </span>
              {isReinforcement && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: isLight ? 'rgba(107, 70, 193, 0.12)' : 'rgba(168, 85, 247, 0.2)',
                    border: isLight ? '1px solid rgba(107, 70, 193, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)',
                    color: 'var(--accent-purple)',
                    fontSize: '11px',
                  }}
                >
                  Reinforcement Drill
                </span>
              )}
              {isOverridden && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.2)',
                    border: isLight ? '1px solid rgba(217, 119, 6, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                    color: 'var(--accent-warning)',
                    fontSize: '11px',
                  }}
                >
                  Human Override Active
                </span>
              )}
              {result.evaluationSource === 'heuristic-mock' && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: isLight ? 'var(--bg-surface)' : 'rgba(148, 163, 184, 0.1)',
                    color: isLight ? 'var(--text-secondary)' : 'var(--text-muted)',
                    border: isLight ? '1px solid var(--border-medium)' : 'none',
                    fontSize: '11px',
                  }}
                >
                  {result.harness?.ran ? 'Offline (harness-graded)' : 'Offline (unverified)'}
                </span>
              )}
              {result.harness?.ran && (
                <span
                  className="badge"
                  style={{
                    backgroundColor: result.harness.passed
                      ? (isLight ? 'rgba(34, 153, 85, 0.14)' : 'rgba(52, 211, 153, 0.15)')
                      : (isLight ? 'rgba(221, 51, 34, 0.12)' : 'rgba(239, 68, 68, 0.15)'),
                    color: result.harness.passed
                      ? 'var(--accent-success)'
                      : 'var(--accent-danger)',
                    border: result.harness.passed
                      ? (isLight ? '1px solid rgba(34, 153, 85, 0.4)' : 'none')
                      : (isLight ? '1px solid rgba(221, 51, 34, 0.4)' : 'none'),
                    fontSize: '11px',
                  }}
                >
                  Tests: {result.harness.summary}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Topic: <strong style={{ color: 'var(--text-primary)' }}>{topic.title}</strong>
            </p>
          </div>
        </div>

        {/* Complexity Badges */}
        {(topic.targetTime || topic.targetSpace) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                className="badge"
                onClick={() => topic.complexityExplanation && setShowComplexityExplanation((prev) => !prev)}
                style={{
                  backgroundColor: isLight ? 'rgba(68, 85, 170, 0.12)' : 'rgba(56, 189, 248, 0.1)',
                  border: isLight
                    ? '1.5px solid var(--accent-primary)'
                    : (showComplexityExplanation
                      ? '1px solid rgba(56, 189, 248, 0.5)'
                      : '1px solid rgba(56, 189, 248, 0.25)'),
                  color: 'var(--accent-cyan)',
                  padding: '6px 10px',
                  cursor: topic.complexityExplanation ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                role={topic.complexityExplanation ? 'button' : undefined}
                tabIndex={topic.complexityExplanation ? 0 : undefined}
                onKeyDown={(e) => {
                  if (topic.complexityExplanation && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setShowComplexityExplanation((prev) => !prev);
                  }
                }}
              >
                <Clock size={13} color="var(--accent-cyan)" />
                <span>
                  Time: <strong>{result.timeComplexity || 'O(n)'}</strong>
                  {topic.targetTime && (
                    <span style={{ fontSize: '11px', color: isLight ? 'var(--text-primary)' : undefined, opacity: isLight ? 0.9 : 0.85, marginLeft: '6px' }}>
                      (Goal: {topic.targetTime})
                    </span>
                  )}
                </span>
              </div>

              <div
                className="badge"
                onClick={() => topic.complexityExplanation && setShowComplexityExplanation((prev) => !prev)}
                style={{
                  backgroundColor: isLight ? 'rgba(109, 40, 217, 0.12)' : 'rgba(168, 85, 247, 0.1)',
                  border: isLight
                    ? '1.5px solid var(--accent-purple)'
                    : (showComplexityExplanation
                      ? '1px solid rgba(168, 85, 247, 0.5)'
                      : '1px solid rgba(168, 85, 247, 0.25)'),
                  color: 'var(--accent-purple)',
                  padding: '6px 10px',
                  cursor: topic.complexityExplanation ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                role={topic.complexityExplanation ? 'button' : undefined}
                tabIndex={topic.complexityExplanation ? 0 : undefined}
                onKeyDown={(e) => {
                  if (topic.complexityExplanation && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setShowComplexityExplanation((prev) => !prev);
                  }
                }}
              >
                <Database size={13} color="var(--accent-purple)" />
                <span>
                  Space: <strong>{result.spaceComplexity || 'O(1)'}</strong>
                  {topic.targetSpace && (
                    <span style={{ fontSize: '11px', color: isLight ? 'var(--text-primary)' : undefined, opacity: isLight ? 0.9 : 0.85, marginLeft: '6px' }}>
                      (Goal: {topic.targetSpace})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Expandable Explanation Box */}
            {showComplexityExplanation && topic.complexityExplanation && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: isLight ? 'var(--bg-card)' : 'rgba(15, 23, 42, 0.95)',
                  border: isLight ? '1.5px solid var(--border-ui)' : '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: isLight ? '3px 3px 0px rgba(28, 28, 28, 0.2)' : 'none',
                  fontSize: '12px',
                  color: isLight ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: '1.45',
                  maxWidth: '500px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <Sparkles size={12} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600, color: isLight ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why this complexity target:
                  </span>
                </div>
                {topic.complexityExplanation}
              </div>
            )}
          </div>
        )}
      </div>

      {verdict.aiOverruledTests && (
        <div
          role="note"
          data-testid="ai-disagrees-note"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(245, 158, 11, 0.10)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
          }}
        >
          <strong>Your code passed all of the card&apos;s tests, but the AI reviewer marked it as needing revision.</strong> The
          tests are the objective check and the reviewer can be wrong (for example about newer JavaScript features). Read its
          critique, and if you disagree, use the override below.
        </div>
      )}

      {/* Human Override Toggle Controls */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} data-testid="verdict-summary">
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Result:{' '}
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: result.passed
                  ? 'var(--accent-success)'
                  : 'var(--accent-danger)',
              }}
            >
              {result.passed ? 'Pass' : 'Fail'}
            </span>
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {verdict.tests === 'not-run'
              ? 'Tests could not run'
              : `Tests ${verdict.tests}${result.harness?.summary ? ` (${result.harness.summary})` : ''}`}
            {verdict.reviewer ? ` · AI reviewer: ${verdict.reviewer === 'pass' ? 'pass' : 'needs revision'}` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {overrideNotice && (
            <span
              role="status"
              data-testid="override-saved-notice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-success)',
                backgroundColor: isLight ? 'rgba(34, 197, 94, 0.12)' : 'rgba(16, 185, 129, 0.18)',
                border: isLight ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.45)',
                padding: '3px 8px',
                borderRadius: '4px',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <Check size={13} strokeWidth={2.5} />
              <span>{overrideNotice}</span>
            </span>
          )}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={effectiveVerdict !== result.passed}
              onChange={(e) => {
                const next = e.target.checked ? !result.passed : result.passed;
                setEffectiveVerdict(next);
                onOverrideVerdict?.(next);
                setOverrideNotice(next ? 'Saved: Marked as Passed' : 'Saved: Marked as Failed');
              }}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--accent-amber)',
                cursor: 'pointer',
              }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              {result.passed
                ? 'Override this verdict (Mark as Failed)'
                : 'Override this verdict (Mark as Passed)'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
