import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface SeedCard {
  id: string;
  title: string;
  referenceSolution?: string;
  solution?: string;
}
// Read at collection time (Playwright runs from the repo root); avoids JSON import attributes under ESM.
const cards: SeedCard[] = JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/topics.json'), 'utf8'));

const DECK_KEY = 'leitner_coding_deck';
const DRAFT_PREFIX = 'leitner_draft:';
const VERDICT = /^(PASSED|NEEDS REVISION)$/;

/**
 * Opens the app with exactly one active card and the given code pre-loaded through the draft autosave
 * (so the CodeMirror editor never has to be driven), then submits it for evaluation.
 * Offline grading is harness-based, so the verdict shown is the harness verdict.
 */
async function submitCard(page: Page, id: string, code: string): Promise<{ verdict: string; tests: string }> {
  await page.goto('/');
  await page.evaluate(
    ({ id, code, DECK_KEY, DRAFT_PREFIX }) => {
      const deck = JSON.parse(localStorage.getItem(DECK_KEY) as string);
      deck.enabledPacks = ['algorithms-advanced']; // optional packs are hidden by default; the smoke test covers every card
      for (const t of deck.topics) t.status = t.id === id ? 'active' : 'locked';
      localStorage.setItem(DECK_KEY, JSON.stringify(deck));
      localStorage.setItem(DRAFT_PREFIX + id, code);
    },
    { id, code, DECK_KEY, DRAFT_PREFIX }
  );
  await page.reload();
  await page.getByRole('button', { name: /Submit Final Answer/ }).click();
  const verdict = page.getByText(VERDICT);
  await expect(verdict.first()).toBeVisible();
  // Compile failures (TS cards) have no harness summary, so don't wait for one.
  const testsBadge = page.getByText(/^Tests:/).first();
  const tests = (await testsBadge.isVisible()) ? ((await testsBadge.textContent()) ?? '') : '';
  return { verdict: ((await verdict.first().textContent()) ?? '').trim(), tests: tests.trim() };
}

test.describe('seed cards in the production build', () => {
  for (const card of cards) {
    const reference = card.referenceSolution ?? card.solution ?? '';

    test(`${card.id}: the reference solution PASSES`, async ({ page }) => {
      const { verdict, tests } = await submitCard(page, card.id, reference);
      expect(verdict, `harness said: ${tests}`).toBe('PASSED');
    });

    test(`${card.id}: an empty solution FAILS`, async ({ page }) => {
      const { verdict } = await submitCard(page, card.id, '// intentionally empty');
      expect(verdict).toBe('NEEDS REVISION');
    });
  }
});
