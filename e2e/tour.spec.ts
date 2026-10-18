import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const tourDialog = (page: Page) => page.getByRole('dialog', { name: 'Guided tour' });

async function startWithTour(page: Page) {
  await page.goto('/');
  const welcome = page.getByRole('dialog', { name: /Welcome to Leitner Coding Trainer/ });
  await expect(welcome).toBeVisible();
  await welcome.getByRole('button', { name: 'Take a 1-minute tour' }).click();
  await expect(tourDialog(page)).toBeVisible();
}

test.describe('guided tour', () => {
  test('the welcome screen offers it; all 5 steps work; the app is usable afterwards and the welcome never returns', async ({ page }) => {
    await startWithTour(page);
    const tour = tourDialog(page);
    const spotlight = page.getByTestId('tour-spotlight');

    await expect(tour).toContainText('Step 1 of 5');
    await expect(tour).toContainText('Read the contract');
    await expect(spotlight).toBeVisible();

    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 2 of 5');
    await expect(tour).toContainText('Solve it yourself');
    await expect(spotlight).toBeVisible();

    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 3 of 5');
    await expect(tour).toContainText('Submit Final Answer');

    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 4 of 5');
    await expect(tour).toContainText('One next step');
    await expect(spotlight).toHaveCount(0); // a centered note, nothing to point at

    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 5 of 5');
    await expect(spotlight).toBeVisible();

    await tour.getByRole('button', { name: 'Finish' }).click();
    await expect(tourDialog(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0); // no welcome, no tour
  });

  test('Back goes to the previous step, and each step stays inside the screen', async ({ page }) => {
    await startWithTour(page);
    const tour = tourDialog(page);
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 2 of 5');
    await tour.getByRole('button', { name: 'Back' }).click();
    await expect(tour).toContainText('Step 1 of 5');
    for (let i = 0; i < 4; i++) {
      const box = await tour.boundingBox();
      expect(box).not.toBeNull();
      const vp = page.viewportSize()!;
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      await tour.getByRole('button', { name: 'Next' }).click();
    }
  });

  test('Skip tour, Escape and the arrow keys', async ({ page }) => {
    await startWithTour(page);
    const tour = tourDialog(page);
    await page.keyboard.press('ArrowRight');
    await expect(tour).toContainText('Step 2 of 5');
    await page.keyboard.press('ArrowLeft');
    await expect(tour).toContainText('Step 1 of 5');
    await page.keyboard.press('Escape');
    await expect(tourDialog(page)).toHaveCount(0);

    // Replay from About, then Skip
    await page.getByRole('button', { name: /^About$/ }).click();
    await page.getByRole('button', { name: 'Replay the quick tour' }).click();
    await expect(tourDialog(page)).toBeVisible();
    await tourDialog(page).getByRole('button', { name: 'Skip tour' }).click();
    await expect(tourDialog(page)).toHaveCount(0);
  });

  test('replay from About works from the Deck Catalog and returns to the practice screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start practicing/ }).click();
    await page.getByRole('button', { name: /Deck Catalog/ }).click();
    await expect(page.getByText(/Catalog & Deck Performance/)).toBeVisible();

    await page.getByRole('button', { name: /^About$/ }).click();
    await page.getByRole('button', { name: 'Replay the quick tour' }).click();

    const tour = tourDialog(page);
    await expect(tour).toBeVisible();
    await expect(tour).toContainText('Step 1 of 5'); // the practice screen is showing again, so every anchor exists
    await expect(page.getByText(/Catalog & Deck Performance/)).toHaveCount(0);
  });

  test('"Start practicing" still works without the tour', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start practicing/ }).click();
    await expect(tourDialog(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
  });
});
