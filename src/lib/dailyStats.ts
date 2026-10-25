/**
 * A tiny per-day activity log: how many scored reviews were done on each local calendar day and how many passed.
 * About 20 bytes per active day, kept for DAILY_STATS_KEEP_DAYS, so a graph can show weeks of history (the 20-entry
 * recentReviews list cannot). Keys are local dates, `YYYY-MM-DD`.
 */
export interface DailyStat {
  reviews: number;
  passes: number;
}
export type DailyStats = Record<string, DailyStat>;

export const DAILY_STATS_KEEP_DAYS = 400;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** The local calendar date of a timestamp as `YYYY-MM-DD`. */
export function localDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Returns a new log with one more review counted on the day of `timestamp`; days older than the keep window are dropped. */
export function recordDailyStat(stats: DailyStats | undefined, timestamp: number, passed: boolean): DailyStats {
  const key = localDateKey(timestamp);
  const cutoff = localDateKey(timestamp - DAILY_STATS_KEEP_DAYS * DAY_MS);
  const next: DailyStats = {};
  for (const [date, stat] of Object.entries(stats ?? {})) {
    if (date >= cutoff) next[date] = stat;
  }
  const today = next[key] ?? { reviews: 0, passes: 0 };
  next[key] = { reviews: today.reviews + 1, passes: today.passes + (passed ? 1 : 0) };
  return next;
}

/** Updates the pass count of the day of `timestamp` when a review verdict is overridden. */
export function updateDailyStatVerdict(stats: DailyStats | undefined, timestamp: number, newPassed: boolean): DailyStats {
  const key = localDateKey(timestamp);
  const next: DailyStats = { ...(stats ?? {}) };
  const today = next[key];
  if (today) {
    const nextPasses = Math.max(0, Math.min(today.reviews, today.passes + (newPassed ? 1 : -1)));
    next[key] = { ...today, passes: nextPasses };
  }
  return next;
}

/** Validates a stored or imported log: bad keys and impossible counts are dropped. Returns undefined when nothing is left. */
export function sanitizeDailyStats(raw: unknown): DailyStats | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: DailyStats = {};
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!DATE_KEY.test(date) || !value || typeof value !== 'object') continue;
    const { reviews, passes } = value as Partial<DailyStat>;
    if (!Number.isInteger(reviews) || !Number.isInteger(passes)) continue;
    if ((reviews as number) < 1 || (passes as number) < 0 || (passes as number) > (reviews as number)) continue;
    out[date] = { reviews: reviews as number, passes: passes as number };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export interface DayPoint {
  date: string;
  reviews: number;
  passes: number;
}

/** The last `days` calendar days ending on the day of `endTimestamp` (oldest first), with zeros for days without reviews. */
export function lastDays(stats: DailyStats | undefined, endTimestamp: number, days: number): DayPoint[] {
  const points: DayPoint[] = [];
  const end = new Date(endTimestamp);
  for (let i = days - 1; i >= 0; i--) {
    // step by calendar days (not 24h) so daylight-saving changes never skip or repeat a date
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i, 12);
    const date = localDateKey(d.getTime());
    const stat = stats?.[date];
    points.push({ date, reviews: stat?.reviews ?? 0, passes: stat?.passes ?? 0 });
  }
  return points;
}

export interface DaysSummary {
  reviews: number;
  passes: number;
  /** Share of reviews that passed (0..1), or null when there were no reviews. */
  accuracy: number | null;
  activeDays: number;
}

export function summarizeDays(points: DayPoint[]): DaysSummary {
  let reviews = 0;
  let passes = 0;
  let activeDays = 0;
  for (const p of points) {
    reviews += p.reviews;
    passes += p.passes;
    if (p.reviews > 0) activeDays++;
  }
  return { reviews, passes, accuracy: reviews > 0 ? passes / reviews : null, activeDays };
}
