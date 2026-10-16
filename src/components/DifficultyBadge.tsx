import { DIFFICULTY_LABELS, difficultyOf } from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';

const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];

/** Five pips + label, e.g. Diff: ●●●○○ Intermediate. */
export const DifficultyBadge: React.FC<{
  card: Pick<TopicItem, 'difficulty'>;
  showLabel?: boolean;
  showPrefix?: boolean;
}> = ({
  card,
  showLabel = true,
  showPrefix,
}) => {
  const d = difficultyOf(card);
  const color = COLORS[d - 1];
  const shouldShowPrefix = showPrefix !== undefined ? showPrefix : showLabel;

  return (
    <span
      title={`Difficulty: Level ${d} of 5 (${DIFFICULTY_LABELS[d]})\n• 1: Warm-up\n• 2: Easy\n• 3: Medium\n• 4: Hard\n• 5: Expert`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11.5px',
        color,
        cursor: 'help',
      }}
    >
      {shouldShowPrefix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px' }}>
          Diff:
        </span>
      )}
      <span aria-hidden="true" style={{ letterSpacing: '1.5px', fontSize: '10px' }}>
        {'●'.repeat(d)}
        <span style={{ opacity: 0.25 }}>{'●'.repeat(5 - d)}</span>
      </span>
      {showLabel && <span style={{ fontWeight: 600 }}>{DIFFICULTY_LABELS[d]}</span>}
    </span>
  );
};
