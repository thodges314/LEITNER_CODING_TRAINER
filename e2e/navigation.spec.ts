import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const DECK_HEADING = /Catalog & Deck Performance/;
const CLOSE_WELCOME = /Start practicing/;

async function openApp(page: Page) {
  await page.goto('about:blank'); // something to go "back" to when leaving the app
  await page.goto('/');
  await page.getByRole('button', { name: CLOSE_WELCOME }).click();
}

test.describe('first visit', () => {
  test('a brand-new visitor sees the welcome once, and never again', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', { name: /Welcome to Leitner Coding Trainer/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('How a session works')).toBeVisible();
    await page.getByRole('button', { name: CLOSE_WELCOME }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('someone who already has a deck is not welcomed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: CLOSE_WELCOME }).click();
    await page.evaluate(() => localStorage.removeItem('leitner_welcomed')); // the deck now exists
    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('About reopens the same content without the intro block', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: /^About$/ }).click();
    const dialog = page.getByRole('dialog', { name: /About Leitner Coding Trainer/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('How a session works')).toHaveCount(0);
  });
});

test.describe('back button', () => {
  test('the app opens on the practice view', async ({ page }) => {
    await openApp(page);
    await expect(page.getByText(DECK_HEADING)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
  });

  test('Back from a problem shows the deck and stays in the app', async ({ page }) => {
    await openApp(page);
    await page.goBack();
    await expect(page.getByText(DECK_HEADING)).toBeVisible();
    expect(page.url()).toMatch(/^http:\/\/localhost:\d+\//);
  });

  test('Back on the deck stays there and hints that another Back leaves', async ({ page }) => {
    await openApp(page);
    await page.goBack();
    await expect(page.getByText(DECK_HEADING)).toBeVisible();
    await page.waitForTimeout(2300); // outside the double-back window
    await page.goBack();
    await expect(page.getByText(/Press Back again to leave the app/)).toBeVisible();
    await expect(page.getByText(DECK_HEADING)).toBeVisible();
    expect(page.url()).toMatch(/^http:\/\/localhost:\d+\//);
  });

  test('two quick Backs leave the app', async ({ page }) => {
    await openApp(page);
    await page.goBack();
    await page.goBack();
    await expect.poll(() => page.url()).toBe('about:blank');
  });

  test('a slow second Back does not leave', async ({ page }) => {
    await openApp(page);
    await page.goBack();
    await page.waitForTimeout(2300);
    await page.goBack();
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/^http:\/\/localhost:\d+\//);
  });

  test('filters and sort in deck catalog remain applied when going into a card and backing out', async ({ page }) => {
    await openApp(page);
    // Navigate to Deck Catalog
    await page.getByRole('button', { name: /Deck Catalog/ }).click();
    await expect(page.getByText(DECK_HEADING)).toBeVisible();

    // Apply a difficulty filter (e.g. Level 3)
    const diffSelect = page.getByRole('combobox', { name: 'Filter by Difficulty' });
    await diffSelect.selectOption('3');

    // Apply a sort option (e.g. Difficulty Hardest First)
    const sortSelect = page.getByRole('combobox', { name: /Sort (Cards|Topics)/ });
    await sortSelect.selectOption('difficulty-desc');

    // Search for a keyword
    const searchInput = page.getByPlaceholder(/Search (cards|topics), tags/i);
    await searchInput.fill('window');

    // Click on a practice button for a visible card to go into practice
    const practiceBtn = page.getByRole('button', { name: /Practice/ }).first();
    await expect(practiceBtn).toBeVisible();
    await practiceBtn.click();

    // Verify we are now in the practice view
    await expect(page.getByRole('button', { name: /Submit Final Answer/ })).toBeVisible();
    await expect(page.getByText(DECK_HEADING)).toHaveCount(0);

    // Back out to Deck Catalog
    await page.getByRole('button', { name: /Deck Catalog/ }).click();
    await expect(page.getByText(DECK_HEADING)).toBeVisible();

    // Verify filters and sort are still applied
    await expect(diffSelect).toHaveValue('3');
    await expect(sortSelect).toHaveValue('difficulty-desc');
    await expect(searchInput).toHaveValue('window');
  });
});
