// @vitest-environment jsdom
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import seed from '../data/topics.json';
import { runHarness } from './runner';
import type { TopicItem } from './leitner';

// Production React builds have no React.act. This runs DOM-driven cards through the flushSync fallback.
const topics = seed as unknown as TopicItem[];
const ids = [
  'hook-use-previous',
  'hook-fetch-cleanup',
  'hook-use-debounce',
  'controlled-vs-uncontrolled-input',
  'context-provider-consumer',
  'modal-portal-focus',
  'tabs-accordion-compound',
  'typeahead-autocomplete',
  'infinite-scroll-list',
  'use-previous-latest-ref',
];

describe('DOM tools without React.act (production build behaviour)', () => {
  beforeAll(() => {
    (globalThis as { __FORCE_FALLBACK_ACT?: boolean }).__FORCE_FALLBACK_ACT = true;
  });
  afterAll(() => {
    delete (globalThis as { __FORCE_FALLBACK_ACT?: boolean }).__FORCE_FALLBACK_ACT;
  });

  it.each(ids)('%s passes with the fallback act', async (id) => {
    const t = topics.find((x) => x.id === id)!;
    const r = await runHarness(t, t.referenceSolution!, 'js', 20000);
    expect({ id, summary: r.summary, bad: r.lines.filter((l) => /FAIL|error/i.test(l)) }).toMatchObject({
      summary: expect.stringMatching(/^[1-9]\d* passed, 0 failed$/),
    });
  }, 30000);
});
