import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The answer flow: Run/Test is free, Submit Final Answer is the one scored attempt, and after a result there is
// exactly one obvious next step. A failed attempt leads to a practice drill (no score impact).
const topics: Array<{ id: string; referenceSolution?: string; solution?: string }> = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/data/topics.json'), 'utf8')
);
const CARD = 'binary-search-exact';
const reference = topics.find((t) => t.id === CARD)?.referenceSolution ?? '';

async function openCardWithDraft(page: Page, draft: string) {
  await page.goto('/');
  const welcomeBtn = page.getByRole('button', { name: /Start practicing/i });
  if (await welcomeBtn.isVisible()) await welcomeBtn.click();
  // Make CARD the only active card, and plant the editor draft for it.
  await page.evaluate(
    ({ id, draft }) => {
      const stored = localStorage.getItem('leitner_coding_deck');
      if (stored) {
        const deck = JSON.parse(stored);
        for (const t of deck.topics) t.status = t.id === id ? 'active' : 'locked';
        localStorage.setItem('leitner_coding_deck', JSON.stringify(deck));
      }
      localStorage.setItem('leitner_draft:' + id, draft);
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    },
    { id: CARD, draft }
  );
  await page.reload();
  await expect(page.getByText(/Binary Search/i).first()).toBeVisible();
}

const submit = (page: Page) => page.getByRole('button', { name: /Submit Final Answer|Check My Practice/ });

test.describe('answer flow', () => {
  test('while answering: Run is free, Submit is the final answer', async ({ page }) => {
    await openCardWithDraft(page, reference);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Run Code \/ Test/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Skip Card/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit & Retest|Commit/ })).toHaveCount(0);
  });

  test('a correct answer shows one next step: Continue to Next Card', async ({ page }) => {
    await openCardWithDraft(page, reference);
    await submit(page).click();
    await expect(page.getByText('PASSED', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('verdict-summary')).toContainText('Tests passed');
    await expect(page.getByTestId('ai-disagrees-note')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Continue to Next Card/ })).toBeVisible();
    // the answering controls are gone and the editor is locked
    await expect(page.getByRole('button', { name: /Submit Final Answer|Check My Practice|Run Code \/ Test|Skip Card/ })).toHaveCount(0);
    await expect(page.getByText('Your Submitted Answer (locked)')).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit & Retest|Practice Again|Commit/ })).toHaveCount(0);
  });

  test('submitting registers result immediately in localStorage and override checkbox updates it immediately', async ({ page }) => {
    await openCardWithDraft(page, reference);
    await submit(page).click();
    await expect(page.getByTestId('verdict-summary')).toContainText('Tests passed', { timeout: 15000 });

    // Verify localStorage has saved review immediately without clicking through
    const savedDeckState = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner_coding_deck');
      return raw ? JSON.parse(raw) : null;
    });
    expect(savedDeckState.totalCompletedReviews).toBeGreaterThan(0);
    const lastReview = savedDeckState.recentReviews?.[savedDeckState.recentReviews.length - 1];
    expect(lastReview?.passed).toBe(true);

    // Toggle override checkbox (Mark as Failed)
    const overrideCheckbox = page.getByRole('checkbox');
    await overrideCheckbox.check();
    await expect(page.getByTestId('override-saved-notice')).toBeVisible();
    await expect(page.getByTestId('override-saved-notice')).toContainText('Saved: Marked as Failed');

    // Verify localStorage was updated immediately
    const overriddenDeckState = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner_coding_deck');
      return raw ? JSON.parse(raw) : null;
    });
    const overriddenReview = overriddenDeckState.recentReviews?.[overriddenDeckState.recentReviews.length - 1];
    expect(overriddenReview?.passed).toBe(false);
  });

  test('a wrong answer: one next step, failed checks named, the solution shown once and not pasted into the critique', async ({ page }) => {
    await openCardWithDraft(page, '// intentionally broken\nfunction binarySearch() { return -1; }');
    await submit(page).click();
    await expect(page.getByText('NEEDS REVISION').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Practice the Pattern/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit & Retest|Commit|Submit Final Answer|Run Code \/ Test|Skip Card/ })).toHaveCount(0);
    await expect(page.getByText(/Failed checks:/)).toBeVisible();
    await expect(page.getByTestId('verdict-summary')).toContainText('Tests failed');
    // the critique does not contain the pasted solution or raw markdown
    await expect(page.getByText('### Canonical Reference Pattern')).toHaveCount(0);
    // the solution is available in the one Reveal panel (open after a failure)
    await expect(page.getByText(/let l = 0/).first()).toBeVisible();
    await expect(page.getByText('Your Submitted Answer (locked)')).toBeVisible();
  });

  test('the drill: Check My Practice, then Try Again or Skip Drill after a miss', async ({ page }) => {
    await openCardWithDraft(page, '// intentionally broken\nfunction binarySearch() { return -1; }');
    await submit(page).click();
    await page.getByRole('button', { name: /Practice the Pattern/ }).click();

    // now in the unscored drill
    await expect(page.getByRole('button', { name: /Check My Practice/ })).toBeVisible({ timeout: 10000 });

    // miss it again: two choices only
    await page.locator('.cm-content').click();
    await page.keyboard.type('function binarySearch() { return -1; }');
    await page.getByRole('button', { name: /Check My Practice/ }).click();
    await expect(page.getByRole('button', { name: /Try Again/ })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Skip Drill & Continue/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Practice Again|Edit & Try Again|Edit & Retest/ })).toHaveCount(0);

    // Try Again unlocks the editor
    await page.getByRole('button', { name: /Try Again/ }).click();
    await expect(page.getByRole('button', { name: /Check My Practice/ })).toBeVisible();
  });
});
