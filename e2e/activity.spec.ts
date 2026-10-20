import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The Activity view (4th mode of the stats widget) is fed by the per-day review log.
const topics: Array<{ id: string; referenceSolution?: string }> = JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/topics.json'), 'utf8'));
const CARD = 'binary-search-exact';
const reference = topics.find((t) => t.id === CARD)?.referenceSolution ?? '';

async function openCard(page: Page, draft: string) {
  await page.goto('/');
  const welcomeBtn = page.getByRole('button', { name: /Start practicing/i });
  if (await welcomeBtn.isVisible()) await welcomeBtn.click();
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

const openActivity = async (page: Page) => {
  await page.getByRole('button', { name: /Deck Catalog/ }).click();
  await page.getByTestId('stats-mode-activity').click();
  await expect(page.getByTestId('activity-view')).toBeVisible();
};

test.describe('activity view', () => {
  test('is empty on a fresh install, with an explanation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start practicing/ }).click();
    await openActivity(page);
    await expect(page.getByTestId('activity-empty')).toContainText('will appear here after your first scored review');
  });

  test('a scored review shows up as today\'s bar, and the log survives a reload', async ({ page }) => {
    await openCard(page, reference);
    await page.getByRole('button', { name: /Submit Final Answer/ }).click();
    await expect(page.getByText('PASSED', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Continue to Next Card/ }).click();

    await openActivity(page);
    await expect(page.getByTestId('activity-summary')).toHaveText('1 review · 1 active day · 100% passed');
    const bars = page.getByTestId('activity-bar');
    await expect(bars).toHaveCount(30);
    await expect(bars.last()).toHaveAttribute('data-reviews', '1');
    await expect(bars.first()).toHaveAttribute('data-reviews', '0');

    await page.reload();
    await openActivity(page);
    await expect(page.getByTestId('activity-summary')).toHaveText('1 review · 1 active day · 100% passed');
  });

  test('a failed attempt is counted too, lowering the share passed', async ({ page }) => {
    await openCard(page, '// broken\nfunction binarySearch() { return -1; }');
    await page.getByRole('button', { name: /Submit Final Answer/ }).click();
    await expect(page.getByText('NEEDS REVISION').first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Practice the Pattern/ }).click();
    await page.getByRole('button', { name: /Skip Drill/ }).first().click();
    await openActivity(page);
    await expect(page.getByTestId('activity-summary')).toHaveText('1 review · 1 active day · 0% passed');
  });
});
