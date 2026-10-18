import { describe, expect, it } from 'vitest';
import { DOUBLE_BACK_WINDOW_MS, decideBack } from './backNavigation';

describe('decideBack', () => {
  it('Back from a problem goes to the deck without a hint', () => {
    expect(decideBack('practice', null, 10_000)).toEqual({ exit: false, hint: false });
  });
  it('Back on the deck stays and hints that another Back leaves', () => {
    expect(decideBack('dashboard', null, 10_000)).toEqual({ exit: false, hint: true });
  });
  it('a second Back within the window leaves the app, from either view', () => {
    expect(decideBack('dashboard', 10_000, 10_000 + DOUBLE_BACK_WINDOW_MS - 1)).toEqual({ exit: true });
    expect(decideBack('practice', 10_000, 10_500)).toEqual({ exit: true });
  });
  it('a second Back after the window is treated as a fresh first Back', () => {
    expect(decideBack('dashboard', 10_000, 10_000 + DOUBLE_BACK_WINDOW_MS)).toEqual({ exit: false, hint: true });
  });
});
