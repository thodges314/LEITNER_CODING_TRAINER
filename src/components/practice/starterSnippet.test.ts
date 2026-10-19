import { describe, expect, it } from 'vitest';
import seed from '../../data/topics.json';
import type { TopicItem } from '../../lib/leitner';
import { getStarterSnippet, IMPLEMENTATION_GAP_LINES } from './starterSnippet';

const cards = seed as unknown as TopicItem[];
const card = (id: string) => cards.find((t) => t.id === id) as TopicItem;
const MARKER = '// Test runner example:\n';
const afterMarker = (snippet: string) => snippet.slice(snippet.indexOf(MARKER) + MARKER.length);

describe('starter snippet: the card checks are live code', () => {
  it('starts with the implementation comment, a large blank gap for the answer, and then the marker', () => {
    const snippet = getStarterSnippet(card('binary-search-exact'));
    const lines = snippet.split('\n');
    expect(lines[0]).toBe('// Write your implementation below');
    const markerAt = lines.indexOf('// Test runner example:');
    expect(markerAt - 1).toBe(IMPLEMENTATION_GAP_LINES); // blank lines in between
    expect(lines.slice(1, markerAt).every((l) => l === '')).toBe(true);
    expect(IMPLEMENTATION_GAP_LINES).toBeGreaterThanOrEqual(10);
  });

  it('contains the card harness exactly, uncommented', () => {
    const c = card('binary-search-exact');
    const body = afterMarker(getStarterSnippet(c));
    expect(body).toBe(c.testHarness!.trim());
    expect(body.split('\n').filter((l) => l.trim().startsWith('//'))).toEqual([]);
    expect(body).toContain('await $test.run("Target in the right half"');
  });

  it('for a React card, the checks are live and only the generic Harness template stays commented', () => {
    const c = card('progress-bar');
    const body = afterMarker(getStarterSnippet(c));
    expect(body.startsWith(c.testHarness!.trim())).toBe(true);
    const generic = body.slice(c.testHarness!.trim().length);
    expect(generic).toContain('// mount(Harness);');
    expect(generic.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('//'))).toEqual([]);
  });

  it('a card without a harness still gets only a commented hint', () => {
    const body = afterMarker(getStarterSnippet({ ...card('binary-search-exact'), testHarness: '' }));
    expect(body.trim().length).toBeGreaterThan(0);
    expect(body.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('//'))).toEqual([]);
  });

  it('is empty for no card', () => {
    expect(getStarterSnippet(null)).toBe('');
  });
});
