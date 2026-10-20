import { describe, it, expect } from 'vitest';
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
    expect(body.trim()).toBe(c.testHarness!.trim());
    expect(body.split('\n').filter((l) => l.trim().startsWith('//'))).toEqual([]);
    expect(body).toContain('await $test.run("Target in the right half"');
  });

  it('for a React card, the checks are live and no generic harness template is appended', () => {
    const c = card('progress-bar');
    const body = afterMarker(getStarterSnippet(c));
    expect(body.trim()).toBe(c.testHarness!.trim());
    expect(body).not.toContain('// mount(Harness);');
    expect(body).not.toContain('Inline Component / Hook Test Harness');
  });

  it('a card without a harness gets only the clean implementation buffer', () => {
    const c = { ...card('binary-search-exact'), testHarness: '' };
    const snippet = getStarterSnippet(c);
    expect(snippet).toContain('// Write your implementation below');
    expect(snippet).not.toContain('// Test runner example:');
  });

  it('is empty for no card', () => {
    expect(getStarterSnippet(null)).toBe('');
  });
});