import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const tourDialog = (page: Page) => page.getByRole('dialog', { name: 'Guided tour' });

/** The spotlight box must fully surround the element carrying data-tour="<anchor>". */
async function expectSpotlightAround(page: Page, anchor: string) {
  const spot = page.getByTestId('tour-spotlight');
  await expect(spot).toBeVisible();
  await expect
    .poll(async () => {
      const t = await page.locator(`[data-tour="${anchor}"]`).boundingBox();
      const s = await spot.boundingBox();
      if (!t || !s) return false;
      const tol = 2;
      return s.x <= t.x + tol && s.y <= t.y + tol && s.x + s.width >= t.x + t.width - tol && s.y + s.height >= t.y + t.height - tol;
    }, { message: `spotlight should surround [data-tour="${anchor}"]` })
    .toBe(true);
}

async function startWithTour(page: Page) {
  await page.goto('/');
  const welcome = page.getByRole('dialog', { name: /Welcome to Leitner Coding Trainer/ });
  await expect(welcome).toBeVisible();
  await welcome.getByRole('button', { name: 'Take a 1-minute tour' }).click();
  await expect(tourDialog(page)).toBeVisible();
}

test.describe('guided tour', () => {
  test('the welcome screen offers it; all 7 steps work; the app is usable afterwards and the welcome never returns', async ({ page }) => {
    await startWithTour(page);
    const tour = tourDialog(page);
    const spotlight = page.getByTestId('tour-spotlight');
    const next = () => tour.getByRole('button', { name: 'Next' }).click();

    // Step 1 lights up the problem description AND the contract table under it.
    await expect(tour).toContainText('Step 1 of 7');
    await expect(tour).toContainText('Read the problem and its contract');
    await expectSpotlightAround(page, 'problem');
    await expectSpotlightAround(page, 'contract');

    await next();
    await expect(tour).toContainText('Step 2 of 7');
    await expect(tour).toContainText('Solve it yourself');
    await expectSpotlightAround(page, 'editor');

    await next();
    await expect(tour).toContainText('Step 3 of 7');
    await expect(tour).toContainText('Submit Final Answer');
    await expectSpotlightAround(page, 'actions');

    await next();
    await expect(tour).toContainText('Step 4 of 7');
    await expect(tour).toContainText('One next step');
    await expect(spotlight).toHaveCount(0); // a centered note, nothing to point at

    // The top bar, one control at a time.
    await next();
    await expect(tour).toContainText('Step 5 of 7');
    await expect(tour).toContainText('Deck Catalog');
    await expectSpotlightAround(page, 'deck-nav');

    await next();
    await expect(tour).toContainText('Step 6 of 7');
    await expect(tour).toContainText('Focus: choose what you practice');
    await expect(tour).toContainText('only change what you see');
    await expectSpotlightAround(page, 'focus');

    await next();
    await expect(tour).toContainText('Step 7 of 7');
    await expect(tour).toContainText('Settings');
    await expectSpotlightAround(page, 'settings');

    await tour.getByRole('button', { name: 'Finish' }).click();
    await expect(tourDialog(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0); // no welcome, no tour
  });

  test('the tour is the default on the welcome screen: first, focused, and Enter starts it', async ({ page }) => {
    await page.goto('/');
    const welcome = page.getByRole('dialog', { name: /Welcome to Leitner Coding Trainer/ });
    const tourBtn = welcome.getByRole('button', { name: 'Take a 1-minute tour' });
    const startBtn = welcome.getByRole('button', { name: 'Start practicing' });
    await expect(tourBtn).toBeFocused();
    const [t, s] = [await tourBtn.boundingBox(), await startBtn.boundingBox()];
    expect(t!.x).toBeLessThan(s!.x); // the tour comes first
    await expect(tourBtn).toHaveClass(/btn-primary/);
    await expect(startBtn).toHaveClass(/btn-outline/);
    await page.keyboard.press('Enter');
    await expect(tourDialog(page)).toBeVisible();
  });

  test('Back goes to the previous step, and each step stays inside the screen', async ({ page }) => {
    await startWithTour(page);
    const tour = tourDialog(page);
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 2 of 7');
    await tour.getByRole('button', { name: 'Back' }).click();
    await expect(tour).toContainText('Step 1 of 7');
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
    await expect(tour).toContainText('Step 2 of 7');
    await page.keyboard.press('ArrowLeft');
    await expect(tour).toContainText('Step 1 of 7');
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
    await expect(tour).toContainText('Step 1 of 7'); // the practice screen is showing again, so every anchor exists
    await expect(page.getByText(/Catalog & Deck Performance/)).toHaveCount(0);
  });

  test('"Start practicing" still works without the tour', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start practicing/ }).click();
    await expect(tourDialog(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
  });
});
