// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getTimedModeEnabled,
  setTimedModeEnabled,
  getTimedModeDuration,
  setTimedModeDuration,
  DEFAULT_TIMED_DURATION,
} from './timedMode';

describe('timedMode', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to disabled and 10 minutes (600s)', () => {
    expect(getTimedModeEnabled()).toBe(false);
    expect(getTimedModeDuration()).toBe(DEFAULT_TIMED_DURATION);
  });

  it('toggles enabled state and persists to localStorage', () => {
    setTimedModeEnabled(true);
    expect(getTimedModeEnabled()).toBe(true);
    setTimedModeEnabled(false);
    expect(getTimedModeEnabled()).toBe(false);
  });

  it('stores and retrieves custom durations', () => {
    setTimedModeDuration(5 * 60);
    expect(getTimedModeDuration()).toBe(300);
    setTimedModeDuration(15 * 60);
    expect(getTimedModeDuration()).toBe(900);
  });
});
