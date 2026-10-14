import { DIFFICULTY_LABELS, difficultyOf } from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';

const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];

/** Five pips + label, e.g. ●●●○○ Intermediate. */
export const DifficultyBadge: React.FC<{ card: Pick<TopicItem, 'difficulty'>; showLabel?: boolean }> = ({
  card,
  showLabel = true,
}) => {
  const d = difficultyOf(card);
  const color = COLORS[d - 1];
  return (
    <span
      title={`Difficulty ${d}/5 — ${DIFFICULTY_LABELS[d]}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color }}
    >
      <span aria-hidden="true" style={{ letterSpacing: '1px' }}>
        {'●'.repeat(d)}
        <span style={{ opacity: 0.25 }}>{'●'.repeat(5 - d)}</span>
      </span>
      {showLabel && <span>{DIFFICULTY_LABELS[d]}</span>}
    </span>
  );
};
