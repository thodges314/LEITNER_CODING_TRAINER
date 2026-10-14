// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraft, loadDraft, saveDraft } from './drafts';

describe('drafts', () => {
  beforeEach(() => localStorage.clear());
  it('saves, loads and clears per card', () => {
    expect(loadDraft('a')).toBeNull();
    saveDraft('a', 'const x = 1;');
    saveDraft('b', '');
    expect(loadDraft('a')).toBe('const x = 1;');
    expect(loadDraft('b')).toBe(''); // an intentionally emptied buffer is kept
    clearDraft('a');
    expect(loadDraft('a')).toBeNull();
  });
  it('ignores a missing card id', () => {
    saveDraft(undefined, 'x');
    expect(loadDraft(undefined)).toBeNull();
  });
});
