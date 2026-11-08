import React from 'react';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';
import { intervalForBox } from '../../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../../lib/leitner';

export interface SpacingTransitionFooterProps {
  topic: TopicItem;
  effectiveVerdict: boolean;
  totalCompletedReviews: number;
  activeDeckSize?: number;
  algorithm: SpacedAlgorithm;
  isReinforcement?: boolean;
  onRetry: () => void;
  onCommit: (passed: boolean) => void;
  onFinishReinforcement?: () => void;
}

export const SpacingTransitionFooter: React.FC<SpacingTransitionFooterProps> = ({
  topic,
  effectiveVerdict,
  totalCompletedReviews,
  activeDeckSize,
  algorithm,
  isReinforcement,
  onRetry,
  onCommit,
  onFinishReinforcement,
}) => {
  const previewBox = effectiveVerdict
    ? (algorithm === 'graduated-interval' ? topic.box + 1 : Math.min(5, topic.box + 1))
    : (algorithm === 'graduated-interval' ? Math.max(1, Math.floor(topic.box / 2)) : 1);
  const previewStreak = effectiveVerdict ? topic.streak + 1 : 0;
  const previewInterval = effectiveVerdict ? intervalForBox(previewBox, algorithm, activeDeckSize) : 0;
  const previewNextTrial = totalCompletedReviews + 1 + previewInterval;
  const tierName = algorithm === 'graduated-interval' ? 'Tier' : 'Box';

  if (isReinforcement) {
    return (
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--accent-purple)', display: 'block', fontWeight: 600 }}>
              Reinforcement Practice (No Stat Impact)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Card scheduled at <strong>{tierName} {topic.box}</strong> • Due trial <strong>#{topic.nextEligibleTrial}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                (This drill reinforces the solution pattern before moving on)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!effectiveVerdict && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onRetry}
              style={{ fontSize: '13.5px', padding: '10px 20px', fontWeight: 600 }}
            >
              <RotateCcw size={15} /> Try Again
            </button>
          )}
          <button
            type="button"
            className={effectiveVerdict ? 'btn btn-success' : 'btn btn-outline'}
            onClick={onFinishReinforcement || (() => onCommit(effectiveVerdict))}
            style={{
              fontSize: '13.5px',
              padding: '10px 20px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {effectiveVerdict ? (
              <>
                <Check size={16} /> Continue to Next Card
              </>
            ) : (
              <>
                <ArrowRight size={16} /> Skip Drill & Continue
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '18px 20px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
            Deck Spacing Transition
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>
              {tierName} {topic.box}
            </span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: effectiveVerdict ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              }}
            >
              {tierName} {previewBox} {algorithm === 'leitner' && previewBox === 5 ? '(Mastered)' : ''}
            </span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: '6px' }}>
              {effectiveVerdict
                ? `(+${previewInterval} reviews spacing • Due Trial #${previewNextTrial})`
                : algorithm === 'graduated-interval'
                ? `(half-tier setback to Tier ${previewBox} • Immediate Drill Next)`
                : `(reset to Box 1 • Immediate Drill Next)`}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
            Streak
          </span>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
            {topic.streak} → {previewStreak}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={effectiveVerdict ? 'btn btn-success' : 'btn btn-primary'}
        onClick={() => onCommit(effectiveVerdict)}
        style={{ fontSize: '13.5px', padding: '10px 20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {effectiveVerdict ? (
          <>
            <Check size={16} /> Continue to Next Card
          </>
        ) : (
          <>
            <ArrowRight size={16} /> Practice the Pattern
          </>
        )}
      </button>
    </div>
  );
};

