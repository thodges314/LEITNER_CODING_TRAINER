// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraft, clearAllDrafts, loadDraft, saveDraft } from './drafts';

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
  it('clears all drafts without wiping unrelated keys', () => {
    saveDraft('c1', 'code1');
    saveDraft('c2', 'code2');
    localStorage.setItem('other_key', 'val');
    clearAllDrafts();
    expect(loadDraft('c1')).toBeNull();
    expect(loadDraft('c2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('val');
  });
  it('ignores a missing card id', () => {
    saveDraft(undefined, 'x');
    expect(loadDraft(undefined)).toBeNull();
  });
});
