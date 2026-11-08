import { sanitizeDailyStats } from './dailyStats';
import {
  CURRENT_DECK_VERSION,
  migrateDeckState,
  migrateTrackId,
} from './deckMigrations';
import { isTrackType } from './trackMeta';
import type { TrackType } from './trackMeta';
import {
  normalizeFilter,
  normalizePresets,
  CARD_PACKS,
} from './practiceFilter';
import type { TopicItem, TestCaseItem, LeitnerDeckState } from './leitner';

export function exportDeckBackup(state: LeitnerDeckState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `leitner-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseTestCases(value: unknown): TestCaseItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cases = value
    .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
    .map((c) => ({
      input: String(c.input ?? ''),
      expected: String(c.expected ?? ''),
      description: optionalString(c.description),
    }));
  return cases.length > 0 ? cases : undefined;
}

/** Validates and normalizes a backup file, preserving every card field. */
export function parseDeckBackup(jsonText: string): LeitnerDeckState {
  const rawParsed = JSON.parse(jsonText);
  if (!rawParsed || !Array.isArray(rawParsed.topics)) {
    throw new Error('Invalid Leitner backup file: missing topics array.');
  }
  const parsed = migrateDeckState(rawParsed);
  const isGraduated = parsed.algorithm === 'graduated-interval';
  const validTopics: TopicItem[] = parsed.topics.map((item: TopicItem) => {
    const rawBox = Math.max(1, Math.floor(Number(item.box)) || 1);
    const box = isGraduated ? rawBox : Math.min(5, rawBox);
    return {
      id: String(item.id || `topic-${Math.random().toString(36).slice(2)}`),
      track: isTrackType(migrateTrackId(item.track)) ? (migrateTrackId(item.track) as TrackType) : 'algorithms',
      title: String(item.title || 'Untitled Topic'),
      box,
      streak: Math.max(0, Number(item.streak) || 0),
      nextEligibleTrial: Math.max(0, Number(item.nextEligibleTrial) || 0),
      status: item.status === 'locked' ? 'locked' : 'active',
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      difficulty: Number.isInteger(Number(item.difficulty)) && Number(item.difficulty) >= 1 && Number(item.difficulty) <= 5 ? Number(item.difficulty) : undefined,
      concept: optionalString(item.concept),
      pack: optionalString(item.pack),
      promptSeed: String(item.promptSeed || ''),
      starterCode: optionalString(item.starterCode),
      testHarness: optionalString(item.testHarness),
      solution: optionalString(item.solution),
      referenceSolution: optionalString(item.referenceSolution),
      testCases: parseTestCases(item.testCases),
      targetTime: optionalString(item.targetTime),
      targetSpace: optionalString(item.targetSpace),
      complexityExplanation: optionalString(item.complexityExplanation),
    };
  });

  return {
    deckVersion: CURRENT_DECK_VERSION,
    topics: validTopics,
    totalCompletedReviews: Number.isInteger(parsed.totalCompletedReviews) ? parsed.totalCompletedReviews : 0,
    lastReviewedTrack: isTrackType(migrateTrackId(parsed.lastReviewedTrack)) ? (migrateTrackId(parsed.lastReviewedTrack) as TrackType) : undefined,
    unlockedStageCount: Number.isInteger(parsed.unlockedStageCount) ? parsed.unlockedStageCount : 0,
    deletedSeedIds: Array.isArray(parsed.deletedSeedIds) ? parsed.deletedSeedIds.map(String) : [],
    practiceFilter: parsed.practiceFilter ? normalizeFilter(parsed.practiceFilter) : undefined,
    enabledPacks: Array.isArray(parsed.enabledPacks) ? parsed.enabledPacks.map(String).filter((p: string) => p in CARD_PACKS) : undefined,
    filterPresets: normalizePresets(parsed.filterPresets),
    algorithm: parsed.algorithm === 'graduated-interval' ? 'graduated-interval' : 'leitner',
    recentReviews: Array.isArray(parsed.recentReviews) ? parsed.recentReviews : undefined,
    dailyStats: sanitizeDailyStats(parsed.dailyStats),
  };
}
