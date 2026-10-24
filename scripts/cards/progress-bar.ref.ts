interface ProgressBarProps {
  value?: number | null;
  max?: number;
  label?: string;
}

function ProgressBar({ value, max = 100, label = 'Progress' }: ProgressBarProps): JSX.Element {
  const indeterminate = value === undefined || value === null;
  const clamped = indeterminate ? 0 : Math.min(max, Math.max(0, value));
  const pct = (clamped / max) * 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : clamped}
      data-indeterminate={indeterminate ? 'true' : undefined}
    >
      <div data-fill style={indeterminate ? undefined : { width: `${pct}%` }} />
      {!indeterminate && <span>{Math.round(pct)}%</span>}
    </div>
  );
}
