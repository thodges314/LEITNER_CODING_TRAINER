import React from 'react';
import {
  Layers,
  Timer,
  Clock,
  Database,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Zap,
  X,
} from 'lucide-react';
import { DifficultyBadge } from '../DifficultyBadge';
import {
  intervalForBox,
  difficultyOf,
  DIFFICULTY_LABELS,
  getTrackMeta,
} from '../../lib/leitner';
import type { TopicItem, SpacedAlgorithm } from '../../lib/leitner';

export type PopoverType = 'track' | 'difficulty' | 'tier' | 'complexity' | 'streak' | 'timer' | null;

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

export interface PracticeHeaderProps {
  currentCard: TopicItem;
  trackMeta: ReturnType<typeof getTrackMeta>;
  theme?: 'dark' | 'apple-gsos';
  algorithm?: SpacedAlgorithm;
  activeDeckSize?: number;
  activePopover: PopoverType;
  setActivePopover: React.Dispatch<React.SetStateAction<PopoverType>>;
  inspectedTier: number;
  setInspectedTier: (tier: number) => void;
  indicatorsHeaderRef: React.RefObject<HTMLDivElement | null>;
  timeRemaining: number;
  formatTimer: (seconds: number) => string;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;
  timedMode: boolean;
  configuredDuration: number;
  setTimeRemaining: (time: number) => void;
  setTimeExpiredToast: (toast: string | null) => void;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  currentCard,
  trackMeta,
  theme = 'dark',
  algorithm = 'leitner',
  activeDeckSize,
  activePopover,
  setActivePopover,
  inspectedTier,
  setInspectedTier,
  indicatorsHeaderRef,
  timeRemaining,
  formatTimer,
  isTimerRunning,
  setIsTimerRunning,
  timedMode,
  configuredDuration,
  setTimeRemaining,
  setTimeExpiredToast,
}) => {
  const currentDiff = difficultyOf(currentCard);
  const diffLabel = DIFFICULTY_LABELS[currentDiff];
  const maxTier = algorithm === 'graduated-interval' ? 9 : 5;

  return (
    <div className="glass-panel arena-glass-header">
      <div ref={indicatorsHeaderRef} className="arena-indicators-bar">
        <div className="arena-indicators-group">
          {/* 1. Track Badge with Dropdown */}
          <div className="arena-popover-anchor">
            <span
              className={`badge arena-track-badge arena-track-${currentCard.track} ${
                activePopover === 'track' ? 'arena-track-badge-active' : ''
              }`}
              onClick={() => setActivePopover((prev) => (prev === 'track' ? null : 'track'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePopover((prev) => (prev === 'track' ? null : 'track'));
                }
              }}
            >
              {trackMeta.label}
            </span>

            {activePopover === 'track' && (
              <div className="arena-popover-panel">
                <div className="arena-popover-header">
                  <div className="arena-popover-header-title">
                    <Layers size={13} color="var(--accent-cyan)" />
                    <span>Topic: {trackMeta.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(null);
                    }}
                    className="arena-popover-close-btn"
                    aria-label="Close track details"
                  >
                    <X size={12} />
                  </button>
                </div>
                <p className="arena-popover-desc">
                  Focus domain for this challenge. Drills in <strong>{trackMeta.label}</strong> test idiomatic implementations, core architectural patterns, and boundary invariants.
                </p>
              </div>
            )}
          </div>

          {/* 2. Difficulty Level Badge with Dropdown */}
          <div className="arena-popover-anchor">
            <div
              className={`arena-difficulty-trigger ${
                activePopover === 'difficulty' ? 'arena-difficulty-trigger-active' : ''
              }`}
              onClick={() => setActivePopover((prev) => (prev === 'difficulty' ? null : 'difficulty'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePopover((prev) => (prev === 'difficulty' ? null : 'difficulty'));
                }
              }}
            >
              <DifficultyBadge card={currentCard} disableTooltip />
            </div>

            {activePopover === 'difficulty' && (
              <div className="arena-popover-panel arena-popover-panel-wide">
                <div className="arena-popover-header">
                  <span className="arena-popover-header-title">
                    Difficulty: Level {currentDiff} of 5 ({diffLabel})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(null);
                    }}
                    className="arena-popover-close-btn"
                    aria-label="Close difficulty info"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="arena-difficulty-list">
                  {([
                    { level: 1, label: DIFFICULTY_LABELS[1] },
                    { level: 2, label: DIFFICULTY_LABELS[2] },
                    { level: 3, label: DIFFICULTY_LABELS[3] },
                    { level: 4, label: DIFFICULTY_LABELS[4] },
                    { level: 5, label: DIFFICULTY_LABELS[5] },
                  ] as const).map((lvl) => {
                    const isCurrentLevel = currentDiff === lvl.level;
                    return (
                      <div
                        key={lvl.level}
                        className={`arena-difficulty-row ${
                          isCurrentLevel ? 'arena-difficulty-row-active' : ''
                        }`}
                      >
                        <div className="arena-difficulty-left">
                          <span className={`arena-difficulty-dots arena-difficulty-dots-${lvl.level}`}>
                            {'●'.repeat(lvl.level)}
                          </span>
                          <span
                            className={
                              isCurrentLevel
                                ? 'arena-difficulty-label-active'
                                : 'arena-difficulty-label-inactive'
                            }
                          >
                            {lvl.label}
                          </span>
                        </div>
                        {isCurrentLevel && (
                          <span className="arena-difficulty-badge-current">
                            Current Card
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="arena-popover-desc">
                  Curated difficulty rating. Challenges are scaled from Level 1 warm-ups up to Level 5 expert patterns.
                </p>
              </div>
            )}
          </div>

          {/* 3. Leitner Box / Tier Progression Badges with Dropdown */}
          <div className="arena-popover-anchor">
            <div
              className="arena-tier-boxes-container"
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
                const stateClass = isCurrent
                  ? `arena-tier-box-btn-current arena-box-bg-${Math.min(9, b)}`
                  : isPast
                  ? 'arena-tier-box-btn-past'
                  : 'arena-tier-box-btn-future';

                return (
                  <div
                    key={b}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedTier(b);
                      setActivePopover('tier');
                    }}
                    className={`arena-tier-box-btn ${stateClass}`}
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
                  className="arena-tier-box-btn arena-tier-box-btn-wide arena-tier-box-btn-current arena-box-bg-9"
                >
                  T{currentCard.box}
                </div>
              )}
            </div>

            {activePopover === 'tier' && (() => {
              const effectiveTier = inspectedTier || currentCard.box;
              const interval = intervalForBox(effectiveTier, algorithm, activeDeckSize);
              const tierMeta =
                algorithm === 'graduated-interval'
                  ? TIER_METADATA[Math.min(9, effectiveTier)]
                  : BOX_METADATA[Math.min(5, effectiveTier)];

              return (
                <div className="arena-popover-panel arena-popover-panel-wide">
                  <div className="arena-popover-header">
                    <div className="arena-popover-header-title">
                      <span
                        className={`arena-tier-dot ${
                          algorithm === 'graduated-interval'
                            ? 'arena-tier-dot-graduated'
                            : 'arena-tier-dot-leitner'
                        }`}
                      />
                      <span>
                        {algorithm === 'graduated-interval' ? '9-Stage Interval Engine' : 'Classic 5-Box Leitner'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopover(null);
                      }}
                      className="arena-popover-close-btn"
                      aria-label="Close tier details"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="arena-tier-summary-row">
                    <span className={`arena-tier-badge-chip arena-box-bg-${Math.min(9, effectiveTier)}`}>
                      {algorithm === 'graduated-interval' ? `Tier ${effectiveTier}` : `Box ${effectiveTier}`}
                    </span>
                    <span className="arena-tier-interval-info">
                      Interval: <strong className="arena-tier-interval-strong">+{interval} review{interval === 1 ? '' : 's'}</strong>
                    </span>
                  </div>

                  <p className="arena-tier-desc-text">
                    {tierMeta?.desc || 'Review intervals expand exponentially as recall is consolidated.'}
                  </p>

                  <div className="arena-tier-inspector-divider">
                    <div className="arena-tier-inspector-title">
                      Inspect All Intervals:
                    </div>
                    <div className="arena-tier-pills-row">
                      {Array.from({ length: maxTier }, (_, i) => i + 1).map((t) => {
                        const isSelected = effectiveTier === t;
                        const isActual = currentCard.box === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setInspectedTier(t)}
                            className={`arena-tier-pill-btn ${isSelected ? 'arena-tier-pill-selected' : ''} ${
                              isActual ? 'arena-tier-pill-actual' : ''
                            }`}
                          >
                            T{t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 4. Target Complexity Badges with Popover */}
          {(currentCard.targetTime || currentCard.targetSpace) && (
            <div className="arena-popover-anchor">
              <span
                className={`arena-complexity-badge ${
                  activePopover === 'complexity' ? 'arena-complexity-badge-active' : ''
                }`}
                onClick={() => setActivePopover((prev) => (prev === 'complexity' ? null : 'complexity'))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePopover((prev) => (prev === 'complexity' ? null : 'complexity'));
                  }
                }}
              >
                {currentCard.targetTime && (
                  <span className="arena-complexity-part">
                    <Clock size={11} color="var(--accent-cyan)" />
                    {currentCard.targetTime}
                  </span>
                )}
                {currentCard.targetTime && currentCard.targetSpace && (
                  <span className="arena-complexity-sep">·</span>
                )}
                {currentCard.targetSpace && (
                  <span className="arena-complexity-part">
                    <Database size={11} color="var(--accent-cyan)" />
                    {currentCard.targetSpace}
                  </span>
                )}
              </span>

              {activePopover === 'complexity' && (
                <div className="arena-popover-panel arena-popover-panel-wide">
                  <div className="arena-popover-header">
                    <div className="arena-popover-header-title">
                      <Clock size={13} color="var(--accent-cyan)" />
                      <span>Target Complexity Bounds</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopover(null);
                      }}
                      className="arena-popover-close-btn"
                      aria-label="Close complexity details"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="arena-complexity-cards-row">
                    {currentCard.targetTime && (
                      <div className="arena-complexity-card-item">
                        <div className="arena-complexity-card-label">Time Complexity</div>
                        <div className="arena-complexity-card-val">
                          {currentCard.targetTime}
                        </div>
                      </div>
                    )}
                    {currentCard.targetSpace && (
                      <div className="arena-complexity-card-item">
                        <div className="arena-complexity-card-label">Space Complexity</div>
                        <div className="arena-complexity-card-val">
                          {currentCard.targetSpace}
                        </div>
                      </div>
                    )}
                  </div>
                  {currentCard.complexityExplanation && (
                    <p className="arena-complexity-explanation">
                      {currentCard.complexityExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. Streak Retention Pill with Popover */}
          <div className="arena-popover-anchor">
            <span
              className={`arena-streak-badge ${
                currentCard.streak > 0 ? 'arena-streak-badge-positive' : ''
              } ${activePopover === 'streak' ? 'arena-streak-badge-active' : ''}`}
              onClick={() => setActivePopover((prev) => (prev === 'streak' ? null : 'streak'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePopover((prev) => (prev === 'streak' ? null : 'streak'));
                }
              }}
            >
              <Flame
                size={12}
                color={currentCard.streak > 0 ? 'var(--accent-amber)' : 'var(--text-dim)'}
              />
              {currentCard.streak} streak
            </span>

            {activePopover === 'streak' && (
              <div className="arena-popover-panel">
                <div className="arena-popover-header">
                  <div className="arena-popover-header-title">
                    <Flame size={13} color="var(--accent-amber)" />
                    <span>Retention Streak: {currentCard.streak}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(null);
                    }}
                    className="arena-popover-close-btn"
                    aria-label="Close streak details"
                  >
                    <X size={12} />
                  </button>
                </div>
                <p className="arena-streak-desc">
                  Consecutive successful recalls without reset. In Leitner spacing, clean answers advance your card to higher tiers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stopwatch & Auto-Submit Countdown Timer */}
        <div className="arena-popover-anchor">
          <div className={`arena-timer-container ${activePopover === 'timer' ? 'arena-timer-active' : ''}`}>
            <div
              className="arena-timer-click-area"
              onClick={() => setActivePopover((prev) => (prev === 'timer' ? null : 'timer'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePopover((prev) => (prev === 'timer' ? null : 'timer'));
                }
              }}
            >
              <Timer
                size={16}
                color={timeRemaining <= 120 ? 'var(--accent-rose)' : 'var(--text-secondary)'}
              />
              <span
                className={`arena-timer-value ${timeRemaining <= 120 ? 'arena-timer-value-urgent' : ''}`}
              >
                {formatTimer(timeRemaining)}
              </span>
              <span className="arena-timer-auto-tag">
                <Zap size={10} color={theme === 'apple-gsos' ? '#B45309' : '#fbbf24'} /> Auto-submits on 00:00
              </span>
            </div>

            <button
              className="btn btn-outline arena-timer-control-btn"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              className="btn btn-outline arena-timer-control-btn"
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
            <div className="arena-popover-panel arena-popover-panel-right arena-popover-panel-wide">
              <div className="arena-popover-header">
                <div className="arena-popover-header-title">
                  <Timer size={14} color="var(--accent-amber)" />
                  <span>Stopwatch & Auto-Submit</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopover(null);
                  }}
                  className="arena-popover-close-btn"
                  aria-label="Close timer details"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="arena-popover-body">
                <p>
                  ⚡ <strong className="arena-tier-interval-strong">Auto-Submission:</strong> When the countdown reaches <strong>00:00</strong>, your code buffer is automatically submitted for test execution and AI evaluation.
                </p>
                <p>
                  ⏱️ <strong className="arena-tier-interval-strong">Duration:</strong> Configured for {Math.round(configuredDuration / 60)} minutes. You can adjust the default duration in Settings (⚙️).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="arena-card-h1">
        {currentCard.title}
      </h1>
    </div>
  );
};
