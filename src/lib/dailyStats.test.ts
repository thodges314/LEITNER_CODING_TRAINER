import { describe, expect, it } from 'vitest';
import { DAILY_STATS_KEEP_DAYS, lastDays, localDateKey, recordDailyStat, updateDailyStatVerdict, sanitizeDailyStats, summarizeDays } from './dailyStats';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('localDateKey', () => {
  it('uses the local calendar date, zero padded', () => {
    expect(localDateKey(at(2026, 3, 5))).toBe('2026-03-05');
    expect(localDateKey(new Date(2026, 9, 18, 23, 59).getTime())).toBe('2026-10-18');
    expect(localDateKey(new Date(2026, 0, 1, 0, 0).getTime())).toBe('2026-01-01');
  });
});

describe('recordDailyStat', () => {
  it('starts a day, then counts reviews and passes on the same day', () => {
    let s = recordDailyStat(undefined, at(2026, 10, 18, 9), true);
    expect(s).toEqual({ '2026-10-18': { reviews: 1, passes: 1 } });
    s = recordDailyStat(s, at(2026, 10, 18, 20), false);
    s = recordDailyStat(s, at(2026, 10, 18, 21), true);
    expect(s).toEqual({ '2026-10-18': { reviews: 3, passes: 2 } });
  });
  it('keeps days separate and does not change the input', () => {
    const before = { '2026-10-17': { reviews: 2, passes: 1 } };
    const after = recordDailyStat(before, at(2026, 10, 18), false);
    expect(after).toEqual({ '2026-10-17': { reviews: 2, passes: 1 }, '2026-10-18': { reviews: 1, passes: 0 } });
    expect(before).toEqual({ '2026-10-17': { reviews: 2, passes: 1 } });
  });
  it('drops days older than the keep window and keeps the boundary day', () => {
    const now = at(2026, 10, 18);
    const old = localDateKey(now - (DAILY_STATS_KEEP_DAYS + 5) * 86_400_000);
    const edge = localDateKey(now - DAILY_STATS_KEEP_DAYS * 86_400_000);
    const s = recordDailyStat({ [old]: { reviews: 1, passes: 1 }, [edge]: { reviews: 2, passes: 2 } }, now, true);
    expect(Object.keys(s)).toContain(edge);
    expect(Object.keys(s)).not.toContain(old);
  });
});

describe('updateDailyStatVerdict', () => {
  it('updates pass count when a verdict is overridden without changing reviews count', () => {
    const time = at(2026, 10, 18, 12);
    let s = recordDailyStat(undefined, time, false);
    expect(s).toEqual({ '2026-10-18': { reviews: 1, passes: 0 } });
    s = updateDailyStatVerdict(s, time, true);
    expect(s).toEqual({ '2026-10-18': { reviews: 1, passes: 1 } });
    s = updateDailyStatVerdict(s, time, false);
    expect(s).toEqual({ '2026-10-18': { reviews: 1, passes: 0 } });
  });
});

describe('sanitizeDailyStats', () => {
  it('keeps valid entries and drops bad keys and impossible counts', () => {
    expect(
      sanitizeDailyStats({
        '2026-10-18': { reviews: 3, passes: 2 },
        '2026-10-17': { reviews: 2, passes: 3 }, // more passes than reviews
        '18/10/2026': { reviews: 1, passes: 1 }, // not an ISO date
        '2026-10-16': { reviews: 1.5, passes: 1 }, // not an integer
        '2026-10-15': { reviews: 0, passes: 0 }, // empty day
        '2026-10-14': 'x',
      })
    ).toEqual({ '2026-10-18': { reviews: 3, passes: 2 } });
  });
  it('returns undefined for junk or an empty result', () => {
    expect(sanitizeDailyStats(undefined)).toBeUndefined();
    expect(sanitizeDailyStats([])).toBeUndefined();
    expect(sanitizeDailyStats('nope')).toBeUndefined();
    expect(sanitizeDailyStats({})).toBeUndefined();
    expect(sanitizeDailyStats({ bad: { reviews: 1, passes: 1 } })).toBeUndefined();
  });
});

describe('lastDays', () => {
  it('returns exactly N consecutive days, oldest first, zero-filled', () => {
    const days = lastDays({ '2026-10-17': { reviews: 4, passes: 3 } }, at(2026, 10, 18), 4);
    expect(days).toEqual([
      { date: '2026-10-15', reviews: 0, passes: 0 },
      { date: '2026-10-16', reviews: 0, passes: 0 },
      { date: '2026-10-17', reviews: 4, passes: 3 },
      { date: '2026-10-18', reviews: 0, passes: 0 },
    ]);
  });
  it('crosses month and year boundaries and works without any data', () => {
    expect(lastDays(undefined, at(2027, 1, 2), 4).map((d) => d.date)).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
  });
  it('never skips or repeats a date over a daylight-saving change', () => {
    const dates = lastDays(undefined, at(2026, 11, 3), 10).map((d) => d.date);
    expect(new Set(dates).size).toBe(10);
    expect(dates[0]).toBe('2026-10-25');
    expect(dates[9]).toBe('2026-11-03');
  });
});

describe('summarizeDays', () => {
  it('totals the window and computes accuracy and active days', () => {
    const s = summarizeDays([
      { date: 'a', reviews: 4, passes: 3 },
      { date: 'b', reviews: 0, passes: 0 },
      { date: 'c', reviews: 6, passes: 3 },
    ]);
    expect(s).toEqual({ reviews: 10, passes: 6, accuracy: 0.6, activeDays: 2 });
  });
  it('has no accuracy when there were no reviews', () => {
    expect(summarizeDays([{ date: 'a', reviews: 0, passes: 0 }])).toEqual({ reviews: 0, passes: 0, accuracy: null, activeDays: 0 });
    expect(summarizeDays([])).toEqual({ reviews: 0, passes: 0, accuracy: null, activeDays: 0 });
  });
});
