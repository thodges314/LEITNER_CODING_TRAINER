import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

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

test.describe('Web Worker sandbox execution and tab freeze protection', () => {
  test('executes algorithm code in Web Worker and displays output logs', async ({ page }) => {
    // A clean algorithm card that prints and returns
    const code = `
console.log('Worker runner active');
console.log('Calculation result:', 2 + 2);
return 4;
`;
    await openCard(page, 'binary-search-exact', code);
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    // Verify console output rendered
    await expect(page.getByText('Worker runner active')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Calculation result: 4')).toBeVisible();
    await expect(page.getByText('↳ Return: 4')).toBeVisible();
  });

  test('kills catastrophic regex backtracking via worker.terminate without locking the main thread', async ({ page }) => {
    // Pathological regex catastrophic backtracking that slips past AST loop guards
    const runawayCode = `
console.log('Starting regex test');
// Catastrophic exponential backtracking in regex engine
/(x+x+)+y/.test('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
console.log('Finished');
`;
    await openCard(page, 'binary-search-exact', runawayCode);
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    await expect(page.getByText('Starting regex test')).toBeVisible({ timeout: 10000 });

    // The main thread must remain interactive while the worker is grinding on the regex.
    // Verify user can interact with the page (e.g. click theme or settings or focus editor)
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();
    await editor.click();

    // Wait for watchdog timeout to terminate the worker
    await expect(
      page.getByText(/Execution timed out after 6000ms \(terminated runaway worker thread to prevent tab freeze\)/)
    ).toBeVisible({ timeout: 12000 });

    // Ensure the tab is fully alive and interactive after worker termination
    const runBtn = page.getByRole('button', { name: /Run Code \/ Test/ });
    await expect(runBtn).toBeEnabled();
  });
});
