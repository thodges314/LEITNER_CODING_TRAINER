// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { commitCardReview, loadDeckState, parseDeckBackup } from './leitner';
import { localDateKey } from './dailyStats';

const firstActiveId = (state: ReturnType<typeof loadDeckState>) => state.topics.find((t) => t.status === 'active')!.id;

describe('daily stats in the deck state', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no log and counts each scored review on today', () => {
    const state = loadDeckState();
    expect(state.dailyStats).toBeUndefined();
    const id = firstActiveId(state);
    const today = localDateKey(Date.now());

    const afterPass = commitCardReview(state, id, true).nextState;
    expect(afterPass.dailyStats).toEqual({ [today]: { reviews: 1, passes: 1 } });

    const afterFail = commitCardReview(afterPass, id, false).nextState;
    expect(afterFail.dailyStats).toEqual({ [today]: { reviews: 2, passes: 1 } });
  });

  it('is saved and comes back after a reload', () => {
    const state = loadDeckState();
    const { nextState } = commitCardReview(state, firstActiveId(state), true);
    expect(loadDeckState().dailyStats).toEqual(nextState.dailyStats);
  });

  it('survives a backup export and import', () => {
    const state = loadDeckState();
    const { nextState } = commitCardReview(state, firstActiveId(state), true);
    const restored = parseDeckBackup(JSON.stringify(nextState));
    expect(restored.dailyStats).toEqual(nextState.dailyStats);
  });

  it('old backups without the field import fine, and junk in the field is cleaned out', () => {
    const state = loadDeckState();
    const old = JSON.parse(JSON.stringify(state));
    delete old.dailyStats;
    expect(parseDeckBackup(JSON.stringify(old)).dailyStats).toBeUndefined();

    old.dailyStats = { '2026-10-18': { reviews: 3, passes: 2 }, nonsense: { reviews: -1, passes: 9 } };
    expect(parseDeckBackup(JSON.stringify(old)).dailyStats).toEqual({ '2026-10-18': { reviews: 3, passes: 2 } });
  });
});
