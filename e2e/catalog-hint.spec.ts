import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openCatalog(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Start practicing/ }).click();
  await page.getByRole('button', { name: /Deck Catalog/ }).click();
  await expect(page.getByText(/Filter (Tracks|Topics)/)).toBeVisible();
}

const chip = (page: Page) => page.locator('button[title^="Click to"]').first();

test.describe('track filter hint (first use only)', () => {
  test('explains that the catalog filter is for inspecting, points to Focus, and shows once', async ({ page }) => {
    await openCatalog(page);
    const hint = page.getByTestId('track-filter-hint');
    await expect(hint).toHaveCount(0); // nothing until the filter is used

    await chip(page).click();
    await expect(hint).toBeVisible();
    await expect(hint).toContainText('This filter is for inspecting cards');
    await expect(hint).toContainText('Focus');

    await hint.getByRole('button', { name: 'Got it' }).click();
    await expect(hint).toHaveCount(0);

    // using the filter again does not bring it back, not even after a reload
    await chip(page).click();
    await expect(hint).toHaveCount(0);
    await page.reload();
    await page.getByRole('button', { name: /Deck Catalog/ }).click();
    await chip(page).click();
    await expect(page.getByTestId('track-filter-hint')).toHaveCount(0);
  });

  test('"Open Focus" opens the Focus dialog and closes the hint', async ({ page }) => {
    await openCatalog(page);
    await chip(page).click();
    await page.getByTestId('track-filter-hint').getByRole('button', { name: 'Open Focus' }).click();
    await expect(page.getByTestId('track-filter-hint')).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: /Focus/i })).toBeVisible();
  });
});
