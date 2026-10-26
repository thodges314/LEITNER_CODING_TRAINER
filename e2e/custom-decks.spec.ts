import { test, expect } from '@playwright/test';

test.describe('Custom Deck Creation, Batch Management & Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    });
  });

  test('creates a custom deck from dropdown and switches to it', async ({ page }) => {
    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toBeVisible();
    await deckTrigger.click();

    // Click "Create Custom Deck..."
    const createDeckBtn = page.getByTestId('deck-dropdown-create-btn');
    await expect(createDeckBtn).toBeVisible();
    await createDeckBtn.click();

    // Modal appears
    const modal = page.getByTestId('create-deck-modal');
    await expect(modal).toBeVisible();

    const nameInput = page.getByTestId('create-deck-name-input');
    await nameInput.fill('Stripe Frontend Screen');

    const descInput = page.getByTestId('create-deck-description-input');
    await descInput.fill('Targeted UI and data structure polyfills');

    const submitBtn = page.getByTestId('create-deck-submit-btn');
    await submitBtn.click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator('.app-unlock-toast')).toBeVisible();

    // Active deck should now be Stripe Frontend Screen with 0 cards
    await expect(deckTrigger).toContainText('Stripe Frontend Screen');
    await expect(deckTrigger).toContainText('0 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(0);
    await expect(page.getByText('No cards match your current filter criteria.')).toBeVisible();
  });

  test('multi-selects cards in catalog and creates a new custom deck with them', async ({ page }) => {
    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Initially on full library with 277 cards
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toContainText('277 Cards');

    // Batch bar should not be visible initially
    await expect(page.getByTestId('catalog-batch-bar')).not.toBeVisible();

    // Select the first two cards
    const firstCheckbox = page.locator('input[data-testid^="catalog-card-checkbox-"]').nth(0);
    const secondCheckbox = page.locator('input[data-testid^="catalog-card-checkbox-"]').nth(1);

    await firstCheckbox.check();
    await expect(page.getByTestId('catalog-batch-bar')).toBeVisible();
    await expect(page.getByTestId('catalog-batch-bar')).toContainText('1 card selected');

    await secondCheckbox.check();
    await expect(page.getByTestId('catalog-batch-bar')).toContainText('2 cards selected');

    // Click "Create Deck With Selected"
    const createWithSelectedBtn = page.getByTestId('catalog-batch-new-deck-btn');
    await expect(createWithSelectedBtn).toBeVisible();
    await createWithSelectedBtn.click();

    // Modal should appear showing 2 selected cards
    const modal = page.getByTestId('create-deck-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('create-deck-selected-cards-notice')).toContainText('2 selected cards');

    const nameInput = page.getByTestId('create-deck-name-input');
    await nameInput.fill('Targeted Sprint Duo');

    const submitBtn = page.getByTestId('create-deck-submit-btn');
    await submitBtn.click();

    await expect(modal).not.toBeVisible();

    // Active deck is now "Targeted Sprint Duo" with 2 cards
    await expect(deckTrigger).toContainText('Targeted Sprint Duo');
    await expect(deckTrigger).toContainText('2 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(2);
  });

  test('multi-selects cards and adds them to an existing custom deck, then deletes deck', async ({ page }) => {
    // Seed an existing custom deck with real catalog cards
    await page.addInitScript(() => {
      const customDecks = [
        {
          id: 'custom-algo-sprint',
          name: 'Algorithms Sprint',
          cardIds: ['tabs-accordion-compound', 'star-rating-component'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      localStorage.setItem('leitner_custom_decks', JSON.stringify(customDecks));
    });

    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Select a card
    const stepperCheckbox = page.getByTestId('catalog-card-checkbox-stepper');
    await stepperCheckbox.check();

    // Open "Add to Deck" menu in batch bar
    const addToDeckBtn = page.getByTestId('catalog-batch-add-to-deck-btn');
    await expect(addToDeckBtn).toBeVisible();
    await addToDeckBtn.click();

    // Target deck option appears
    const targetOption = page.getByTestId('catalog-batch-target-deck-custom-algo-sprint');
    await expect(targetOption).toBeVisible();
    await targetOption.click();

    await expect(page.locator('.app-unlock-toast')).toBeVisible();

    // Switch to Algorithms Sprint in deck dropdown
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await deckTrigger.click();

    const algoSprintOption = page.getByTestId('deck-option-custom-algo-sprint');
    await expect(algoSprintOption).toContainText('3 cards');
    await algoSprintOption.click();

    await expect(deckTrigger).toContainText('Algorithms Sprint');
    await expect(deckTrigger).toContainText('3 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(3);

    // Delete custom deck
    await deckTrigger.click();
    const deleteBtn = page.getByTestId('deck-delete-custom-algo-sprint');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await expect(deckTrigger).toContainText('Full Library (All Cards)');
    await expect(deckTrigger).toContainText('277 Cards');
  });
});
