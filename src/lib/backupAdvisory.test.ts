// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  BACKUP_ADVISORY_THRESHOLD,
  STORAGE_KEY_PROBLEMS_COMPLETED,
  STORAGE_KEY_ADVISORY_DISMISSED,
  getCompletedProblemsCount,
  hasSeenBackupAdvisory,
  recordProblemCompletion,
  markBackupAdvisorySeen,
  resetBackupAdvisoryState,
} from './backupAdvisory';

describe('backupAdvisory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts at 0 completed problems and not advised', () => {
    expect(getCompletedProblemsCount()).toBe(0);
    expect(hasSeenBackupAdvisory()).toBe(false);
  });

  it('increments problem completion count and triggers advisory exactly at threshold', () => {
    expect(BACKUP_ADVISORY_THRESHOLD).toBe(4);

    // 1st completion
    const step1 = recordProblemCompletion();
    expect(step1.count).toBe(1);
    expect(step1.shouldShowAdvisory).toBe(false);
    expect(getCompletedProblemsCount()).toBe(1);

    // 2nd completion
    const step2 = recordProblemCompletion();
    expect(step2.count).toBe(2);
    expect(step2.shouldShowAdvisory).toBe(false);

    // 3rd completion
    const step3 = recordProblemCompletion();
    expect(step3.count).toBe(3);
    expect(step3.shouldShowAdvisory).toBe(false);

    // 4th completion: should trigger advisory!
    const step4 = recordProblemCompletion();
    expect(step4.count).toBe(4);
    expect(step4.shouldShowAdvisory).toBe(true);

    // Once marked seen, subsequent completions do not re-trigger
    markBackupAdvisorySeen();
    expect(hasSeenBackupAdvisory()).toBe(true);

    const step5 = recordProblemCompletion();
    expect(step5.count).toBe(5);
    expect(step5.shouldShowAdvisory).toBe(false);
  });

  it('handles corrupted or non-numeric count gracefully', () => {
    localStorage.setItem(STORAGE_KEY_PROBLEMS_COMPLETED, 'invalid');
    expect(getCompletedProblemsCount()).toBe(0);

    const next = recordProblemCompletion();
    expect(next.count).toBe(1);
  });

  it('resetBackupAdvisoryState clears both storage keys', () => {
    localStorage.setItem(STORAGE_KEY_PROBLEMS_COMPLETED, '5');
    localStorage.setItem(STORAGE_KEY_ADVISORY_DISMISSED, '1');

    resetBackupAdvisoryState();
    expect(getCompletedProblemsCount()).toBe(0);
    expect(hasSeenBackupAdvisory()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY_PROBLEMS_COMPLETED)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY_ADVISORY_DISMISSED)).toBeNull();
  });
});
