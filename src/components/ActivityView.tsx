import React, { useState } from 'react';
import { lastDays, summarizeDays } from '../lib/dailyStats';
import type { DailyStats } from '../lib/dailyStats';
import type { AppTheme } from '../lib/theme';

interface ActivityViewProps {
  stats?: DailyStats;
  theme?: AppTheme;
  /** Number of days shown, ending today. */
  days?: number;
}

const W = 280;
const H = 176;
const PAD = { top: 10, right: 34, bottom: 20, left: 24 };

const formatDay = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * The fourth view of the stats widget: scored reviews per day (bars) and the share that passed (line) over the last
 * weeks. Plain SVG. The data is the per-day log in the deck state, so history starts on the day logging began.
 */
export const ActivityView: React.FC<ActivityViewProps> = ({ stats, theme, days = 30 }) => {
  const [now] = useState(() => Date.now());
  const isLight = theme === 'apple-gsos';
  const points = lastDays(stats, now, days);
  const summary = summarizeDays(points);
  const pct = summary.accuracy === null ? 0 : Math.round(summary.accuracy * 100);

  const barColor = isLight ? '#0284c7' : '#38bdf8';
  const lineColor = isLight ? '#047857' : '#34d399';
  const axisColor = isLight ? '#6B6A5F' : '#64748b';

  const description =
    summary.reviews === 0
      ? `No reviews in the last ${days} days.`
      : `Last ${days} days: ${plural(summary.reviews, 'review')} on ${plural(summary.activeDays, 'day')}, ${pct}% passed.`;

  if (summary.reviews === 0) {
    return (
      <div
        data-testid="activity-view"
        style={{ padding: '24px', textAlign: 'center', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '260px' }}
      >
        <div data-testid="activity-empty">
          Your review activity will appear here after your first scored review. It is kept from that day on, so the graph fills in as you practice.
        </div>
      </div>
    );
  }

  const maxReviews = Math.max(4, ...points.map((p) => p.reviews));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / points.length;
  const barW = Math.max(2, slot * 0.62);
  const x = (i: number) => PAD.left + slot * i + slot / 2;
  const yReviews = (n: number) => PAD.top + plotH - (n / maxReviews) * plotH;
  const yAccuracy = (a: number) => PAD.top + plotH - a * plotH;
  const reviewed = points.map((p, i) => ({ p, i })).filter(({ p }) => p.reviews > 0);
  const line = reviewed.map(({ p, i }) => `${x(i).toFixed(1)},${yAccuracy(p.passes / p.reviews).toFixed(1)}`).join(' ');

  return (
    <div data-testid="activity-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div data-testid="activity-summary" style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>{plural(summary.reviews, 'review')}</strong> · {plural(summary.activeDays, 'active day')} ·{' '}
        <strong style={{ color: lineColor }}>{pct}%</strong> passed
      </div>
      <svg data-testid="stats-chart-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description} style={{ overflow: 'visible' }}>
        <title>{description}</title>
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={axisColor} strokeOpacity={0.5} />
        <text x={PAD.left - 5} y={PAD.top + 4} textAnchor="end" fontSize="9" fill={axisColor}>{maxReviews}</text>
        <text x={PAD.left - 5} y={PAD.top + plotH} textAnchor="end" fontSize="9" fill={axisColor}>0</text>
        <text x={W - PAD.right + 5} y={PAD.top + 4} fontSize="9" fill={lineColor}>100%</text>
        <text x={W - PAD.right + 5} y={PAD.top + plotH} fontSize="9" fill={lineColor}>0%</text>

        {points.map((p, i) => (
          <rect
            key={p.date}
            data-testid="activity-bar"
            data-date={p.date}
            data-reviews={p.reviews}
            x={x(i) - barW / 2}
            y={p.reviews > 0 ? yReviews(p.reviews) : PAD.top + plotH - 1}
            width={barW}
            height={p.reviews > 0 ? PAD.top + plotH - yReviews(p.reviews) : 1}
            rx={1}
            fill={barColor}
            fillOpacity={p.reviews > 0 ? 0.55 : 0.25}
          >
            <title>
              {p.reviews > 0
                ? `${formatDay(p.date)}: ${plural(p.reviews, 'review')}, ${p.passes} passed (${Math.round((p.passes / p.reviews) * 100)}%)`
                : `${formatDay(p.date)}: no reviews`}
            </title>
          </rect>
        ))}

        {reviewed.length > 1 && <polyline points={line} fill="none" stroke={lineColor} strokeWidth={1.75} strokeLinejoin="round" />}
        {reviewed.map(({ p, i }) => (
          <circle key={p.date} cx={x(i)} cy={yAccuracy(p.passes / p.reviews)} r={2.6} fill={lineColor} />
        ))}

        <text x={x(0)} y={H - 5} textAnchor="start" fontSize="9" fill={axisColor}>{formatDay(points[0].date)}</text>
        <text x={x(points.length - 1)} y={H - 5} textAnchor="end" fontSize="9" fill={axisColor}>{formatDay(points[points.length - 1].date)}</text>
      </svg>
      <div style={{ display: 'flex', gap: '12px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
        <span><span style={{ color: barColor }}>■</span> reviews per day</span>
        <span><span style={{ color: lineColor }}>●</span> share passed</span>
      </div>
    </div>
  );
};
