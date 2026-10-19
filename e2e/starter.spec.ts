import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The starter buffer: the card's own example checks are live (uncommented) code, there is no comment toggle, and the
// same buffer works for plain-JS cards and for React cards (where Run also renders the component).
const topics: Array<{ id: string; referenceSolution?: string; testHarness?: string }> = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/data/topics.json'), 'utf8')
);
const byId = (id: string) => topics.find((t) => t.id === id)!;

/** Opens `id` as the only active card. With `draft` the editor starts from it; with null it shows the untouched starter. */
async function openCard(page: Page, id: string, draft: string | null) {
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
      if (draft === null) localStorage.removeItem('leitner_draft:' + id);
      else localStorage.setItem('leitner_draft:' + id, draft);
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    },
    { id, draft }
  );
  await page.reload();
}

const run = (page: Page) => page.getByRole('button', { name: /Run Code \/ Test/ });
const solved = (id: string) => `${byId(id).referenceSolution}\n\n// Test runner example:\n${byId(id).testHarness!.trim()}\n`;

test.describe('starter buffer', () => {
  test('the card checks are live code, and there is no comment toggle', async ({ page }) => {
    await openCard(page, 'binary-search-exact', null);
    const editor = page.locator('.cm-content');
    await expect(editor).toContainText('Test runner example:');
    const text = await editor.innerText();
    const afterMarker = text.slice(text.indexOf('Test runner example:'));
    expect(afterMarker).toContain('await $test.run("Target in the right half"');
    expect(afterMarker).not.toContain('// await $test.run');
    await expect(page.getByRole('button', { name: /Toggle Test Comments/ })).toHaveCount(0);
  });

  test('Run on the untouched buffer reports the checks as failing instead of crashing', async ({ page }) => {
    await openCard(page, 'binary-search-exact', null);
    await run(page).click();
    await expect(page.getByText(/Target in the right half/).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/FAIL/).first()).toBeVisible();
  });

  test('a solved buffer with the live checks passes on Submit (the checks are not counted twice)', async ({ page }) => {
    await openCard(page, 'binary-search-exact', solved('binary-search-exact'));
    await page.getByRole('button', { name: /Submit Final Answer/ }).click();
    await expect(page.getByText('PASSED', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Continue to Next Card/ })).toBeVisible();
  });

  test('React card: Run executes the live checks AND renders the component', async ({ page }) => {
    await openCard(page, 'progress-bar', solved('progress-bar'));
    await run(page).click();
    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    await expect(frame.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/PASS/).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/\$dom is not defined/)).toHaveCount(0);
  });
});
