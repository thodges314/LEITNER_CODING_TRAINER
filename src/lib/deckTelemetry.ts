import { localDateKey } from './dailyStats';
import type { DailyStats } from './dailyStats';

export interface ReviewHistoryEntry {
  topicId: string;
  passed: boolean;
  box: number;
  previousBox?: number;
  trial: number;
  timestamp?: number;
}

export interface Rolling24HourStats {
  attempted: number;
  promoted: number;
  demoted: number;
}

/**
 * Computes review velocity metrics for a rolling 24-hour window:
 * - attempted: total reviews completed in the last 24h
 * - promoted: reviews resulting in an advancement to a higher box/tier (box > previousBox)
 * - demoted: reviews resulting in a drop to a lower box/tier (box < previousBox)
 */
export function computeRolling24HourStats(
  recentReviews?: ReviewHistoryEntry[],
  dailyStats?: DailyStats,
  now: number = Date.now()
): Rolling24HourStats {
  const windowStart = now - 24 * 60 * 60 * 1000;

  if (Array.isArray(recentReviews) && recentReviews.length > 0) {
    const inWindow = recentReviews.filter(
      (r) => typeof r.timestamp === 'number' && r.timestamp >= windowStart
    );

    if (inWindow.length > 0) {
      let promoted = 0;
      let demoted = 0;
      for (const r of inWindow) {
        if (r.previousBox !== undefined) {
          if (r.box > r.previousBox) {
            promoted++;
          } else if (r.box < r.previousBox) {
            demoted++;
          }
        } else {
          // Graceful fallback for legacy entries where previousBox was not stored:
          // Only count as promoted if passed and ended above Box 1; never assume demotion without previousBox.
          if (r.passed && r.box > 1) {
            promoted++;
          }
        }
      }
      return {
        attempted: inWindow.length,
        promoted,
        demoted,
      };
    }
  }

  // Graceful fallback to dailyStats for current calendar day if recentReviews has no timestamped entries.
  // dailyStats does not record previousBox, so failed Box 1 cards are not counted as demotions.
  const todayKey = localDateKey(now);
  const todayStat = dailyStats?.[todayKey];
  if (todayStat && todayStat.reviews > 0) {
    const legacyDemoted = Array.isArray(recentReviews)
      ? recentReviews.filter((r) => r.previousBox !== undefined && r.box < r.previousBox).length
      : 0;
    return {
      attempted: todayStat.reviews,
      promoted: todayStat.passes,
      demoted: legacyDemoted,
    };
  }

  return { attempted: 0, promoted: 0, demoted: 0 };
}
