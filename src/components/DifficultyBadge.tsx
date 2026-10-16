import { DIFFICULTY_LABELS, difficultyOf } from '../lib/leitner';
import type { TopicItem } from '../lib/leitner';

const DARK_COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];
const LIGHT_COLORS = ['#15803D', '#4D7C0F', '#B45309', '#C2410C', '#DC2626'];

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
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'apple-gsos';
  const color = (isLight ? LIGHT_COLORS : DARK_COLORS)[d - 1];
  const shouldShowPrefix = showPrefix !== undefined ? showPrefix : showLabel;

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={disableTooltip ? undefined : `Difficulty: Level ${d} of 5 (${DIFFICULTY_LABELS[d]})\n• 1: Warm-up\n• 2: Easy\n• 3: Medium\n• 4: Hard\n• 5: Expert`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11.5px',
        color,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {shouldShowPrefix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px' }}>
          Diff:
        </span>
      )}
      <span aria-hidden="true" style={{ letterSpacing: '1.5px', fontSize: '10px' }}>
        {'●'.repeat(d)}
        <span style={{ opacity: isLight ? 0.35 : 0.25, color: isLight ? '#64748B' : undefined }}>{'●'.repeat(5 - d)}</span>
      </span>
      {showLabel && <span style={{ fontWeight: 600 }}>{DIFFICULTY_LABELS[d]}</span>}
    </span>
  );
};
