import React from 'react';
import { DIFFICULTY_LABELS, difficultyOf } from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';

/** Five pips + label, e.g. Diff: ●●●○○ Intermediate. */
export const DifficultyBadge: React.FC<{
  card: Pick<TopicItem, 'difficulty'>;
  showLabel?: boolean;
  showPrefix?: boolean;
  onClick?: () => void;
  disableTooltip?: boolean;
}> = ({
  card,
  showLabel = true,
  showPrefix,
  onClick,
  disableTooltip = true,
}) => {
  const d = difficultyOf(card);
  const shouldShowPrefix = showPrefix !== undefined ? showPrefix : showLabel;

  return (
    <span
      className={`difficulty-badge ${onClick ? 'is-interactive' : ''}`}
      data-difficulty={d}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={disableTooltip ? undefined : `Difficulty: Level ${d} of 5 (${DIFFICULTY_LABELS[d]})\n• 1: Warm-up\n• 2: Easy\n• 3: Medium\n• 4: Hard\n• 5: Expert`}
    >
      {shouldShowPrefix && <span className="difficulty-prefix">Diff:</span>}
      <span aria-hidden="true" className="difficulty-pips">
        {'●'.repeat(d)}<span className="difficulty-empty-pips">{'●'.repeat(5 - d)}</span>
      </span>
      {showLabel && <span className="difficulty-label">{DIFFICULTY_LABELS[d]}</span>}
    </span>
  );
};
