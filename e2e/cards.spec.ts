import { test, expect } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
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

let workerPage: Page | null = null;

test.afterAll(async () => {
  if (workerPage && !workerPage.isClosed()) {
    await workerPage.close();
  }
  workerPage = null;
});

/**
 * Opens the app in Practice Arena view with exactly one active card and the given code pre-loaded
 * through the draft autosave (so the CodeMirror editor never has to be driven), then submits it for evaluation.
 * Reuses a single page per worker so the 6.5 MB production bundle is not cold-started 1,700+ times.
 */
async function submitCard(page: Page, id: string, code: string): Promise<{ verdict: string; tests: string }> {
  await page.evaluate(
    ({ id, code, DECK_KEY, DRAFT_PREFIX }) => {
      const win = window as unknown as {
        __baseDeck?: { topics: Array<{ id: string; status: string }>; enabledPacks?: string[] };
        __E2E_FAST_EVAL?: boolean;
      };
      win.__E2E_FAST_EVAL = true;
      if (!win.__baseDeck) {
        win.__baseDeck = JSON.parse(localStorage.getItem(DECK_KEY) as string);
      }
      const deck = win.__baseDeck!;
      deck.enabledPacks = ['algorithms-advanced']; // optional packs are hidden by default; the smoke test covers every card
      for (const t of deck.topics) t.status = t.id === id ? 'active' : 'locked';
      localStorage.clear();
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_catalog_tour_seen', '1');
      localStorage.setItem('leitner_arena_tour_seen', '1');
      localStorage.setItem('leitner_backup_advisory_seen', '1');
      localStorage.setItem(DECK_KEY, JSON.stringify(deck));
      localStorage.setItem(DRAFT_PREFIX + id, code);
      window.dispatchEvent(new Event('leitner:sync-storage'));
    },
    { id, code, DECK_KEY, DRAFT_PREFIX }
  );
  const verdict = page.getByText(VERDICT);
  await expect(verdict).toHaveCount(0);
  await page.getByRole('button', { name: /Submit Final Answer/ }).click();
  await expect(verdict.first()).toBeVisible();
  // Compile failures (TS cards) have no harness summary, so don't wait for one.
  const testsBadge = page.getByText(/^Tests:/).first();
  const tests = (await testsBadge.isVisible()) ? ((await testsBadge.textContent()) ?? '') : '';
  return { verdict: ((await verdict.first().textContent()) ?? '').trim(), tests: tests.trim() };
}

async function runCardSubmission(
  browser: Browser,
  id: string,
  code: string,
  expectedVerdict: 'PASSED' | 'NEEDS REVISION'
): Promise<void> {
  if (!workerPage || workerPage.isClosed()) {
    workerPage = await browser.newPage();
    await workerPage.goto('/?view=practice');
    await expect(workerPage.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
  }
  try {
    const { verdict, tests } = await submitCard(workerPage, id, code);
    expect(verdict, `harness said: ${tests}`).toBe(expectedVerdict);
  } catch (err) {
    await workerPage.close().catch(() => {});
    workerPage = null;
    throw err;
  }
}

test.describe('seed cards in the production build', () => {
  for (const card of cards) {
    const reference = card.referenceSolution ?? card.solution ?? '';

    test(`${card.id}: the reference solution PASSES`, async ({ browser }) => {
      await runCardSubmission(browser, card.id, reference, 'PASSED');
    });

    test(`${card.id}: an empty solution FAILS`, async ({ browser }) => {
      await runCardSubmission(browser, card.id, '// intentionally empty', 'NEEDS REVISION');
    });
  }
});
