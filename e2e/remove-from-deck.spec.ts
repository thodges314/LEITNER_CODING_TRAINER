import { test, expect } from '@playwright/test';

test.describe('Remove From Deck & Preset Forking', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    });
  });

  test('clicking Remove From Deck in Practice Arena on preset forks deck and excludes card', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('leitner_active_deck_id', 'frontend-specialist');
    });

    await page.goto('/');

    // Verify arena loaded
    const removeBtn = page.getByTestId('arena-remove-from-deck-btn');
    await expect(removeBtn).toBeVisible();

    // Check current card title in header
    const problemTitleEl = page.locator('h1.arena-card-h1');
    await expect(problemTitleEl).toBeVisible();
    const firstCardTitle = await problemTitleEl.innerText();

    // Click Remove From Deck
    await removeBtn.click();

    // Modal should appear prompting for personal deck name
    const modal = page.getByTestId('remove-from-deck-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Frontend Specialist');
    await expect(modal).toContainText(firstCardTitle);

    const nameInput = page.getByTestId('fork-deck-name-input');
    await expect(nameInput).toHaveValue('Frontend Specialist (Personal)');

    // Customize name and submit
    await nameInput.fill('My Tailored Frontend Sprint');
    const submitBtn = page.getByTestId('fork-deck-submit-btn');
    await submitBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Toast should confirm
    await expect(page.locator('.app-unlock-toast')).toBeVisible();

    // Arena should have advanced to a different card
    await expect(problemTitleEl).not.toHaveText(firstCardTitle);

    // Go to Deck Catalog to verify custom deck is active and card count is decremented
    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toContainText('My Tailored Frontend Sprint');
    // Frontend Specialist is 197 cards; minus 1 is 196
    await expect(deckTrigger).toContainText('196 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(196);

    // The removed card should not be in the catalog table
    await expect(page.locator('tbody tr.catalog-tr').filter({ hasText: firstCardTitle })).toHaveCount(0);
  });

  test('clicking Remove From Deck in Catalog Table on custom deck removes card immediately without modal', async ({ page }) => {
    // Seed a custom personal deck with 3 cards
    await page.addInitScript(() => {
      const customDecks = [
        {
          id: 'custom-demo-deck',
          name: 'Quick Demo Deck',
          cardIds: ['stepper', 'tabs-accordion-compound', 'star-rating-component'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      localStorage.setItem('leitner_custom_decks', JSON.stringify(customDecks));
      localStorage.setItem('leitner_active_deck_id', 'custom-demo-deck');
    });

    await page.goto('/');

    // Go to catalog
    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toContainText('Quick Demo Deck');
    await expect(deckTrigger).toContainText('3 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(3);

    // Click remove button on the first row
    const firstRowRemoveBtn = page.locator('tbody tr.catalog-tr').first().getByTestId('catalog-remove-from-deck-btn');
    await expect(firstRowRemoveBtn).toBeVisible();
    await firstRowRemoveBtn.click();

    // No modal should appear for custom decks
    await expect(page.getByTestId('remove-from-deck-modal')).not.toBeVisible();

    // Count in deck trigger and table should now be 2
    await expect(deckTrigger).toContainText('2 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(2);
  });
});
