import { test, expect } from '@playwright/test';

test.describe('Custom Deck Manual Builder, Accordion Selection, Editing & Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    });
  });

  test('creates a custom deck using the manual accordion builder and switches to it', async ({ page }) => {
    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Open Deck Selector dropdown and click "Create Custom Deck..."
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await deckTrigger.click();

    const createDeckBtn = page.getByTestId('deck-dropdown-create-btn');
    await expect(createDeckBtn).toBeVisible();
    await createDeckBtn.click();

    // Modal appears
    const modal = page.getByTestId('deck-editor-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Create Custom Deck');

    // Fill in deck name and description
    const nameInput = page.getByTestId('create-deck-name-input');
    await nameInput.fill('Stripe Frontend Screen');

    const descInput = page.getByTestId('create-deck-description-input');
    await descInput.fill('Targeted UI and Node.js drills');

    // Accordion panels are closed by default; click react-components header to expand it
    const reactTopicHeader = page.getByTestId('deck-editor-topic-header-react-components');
    await expect(reactTopicHeader).toBeVisible();
    await reactTopicHeader.click();

    // Select stepper card in react-components
    const stepperCheckbox = page.getByTestId('deck-editor-card-checkbox-stepper');
    await stepperCheckbox.check();
    await expect(stepperCheckbox).toBeChecked();

    // Verify footer updates with selected count
    const footerStats = page.getByTestId('deck-editor-footer-stats');
    await expect(footerStats).toContainText('Selected: 1 of 319 cards');

    // Select entire node category via topic checkbox without needing to expand
    const nodeTopicCheckbox = page.getByTestId('deck-editor-topic-checkbox-node');
    await expect(nodeTopicCheckbox).toBeVisible();
    await nodeTopicCheckbox.check();

    // Now 16 cards selected (1 stepper + 15 node cards)
    await expect(footerStats).toContainText('Selected: 16 of 319 cards');

    // Submit
    const submitBtn = page.getByTestId('create-deck-submit-btn');
    await expect(submitBtn).toContainText('Create Deck (16)');
    await submitBtn.click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator('.app-unlock-toast')).toBeVisible();

    // Active deck should now be Stripe Frontend Screen with 16 cards
    await expect(deckTrigger).toContainText('Stripe Frontend Screen');
    await expect(deckTrigger).toContainText('16 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(16);
  });

  test('edits an existing custom deck using the manual builder modal', async ({ page }) => {
    // Seed an existing custom deck
    await page.addInitScript(() => {
      const customDecks = [
        {
          id: 'custom-algo-sprint',
          name: 'Algorithms Sprint',
          description: 'Initial algorithm collection',
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

    // Switch to Algorithms Sprint in deck dropdown
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await deckTrigger.click();

    const algoSprintOption = page.getByTestId('deck-option-custom-algo-sprint');
    await expect(algoSprintOption).toBeVisible();
    await algoSprintOption.click();

    await expect(deckTrigger).toContainText('Algorithms Sprint');
    await expect(deckTrigger).toContainText('2 Cards');

    // Open dropdown to edit Algorithms Sprint via pencil button
    await deckTrigger.click();
    const editPencilBtn = page.getByTestId('deck-edit-custom-algo-sprint');
    await expect(editPencilBtn).toBeVisible();
    await editPencilBtn.click();

    // Modal appears in edit mode
    const modal = page.getByTestId('deck-editor-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Edit Custom Deck');
    await expect(modal).toContainText('Editing "Algorithms Sprint"');

    // Change deck name
    const nameInput = page.getByTestId('create-deck-name-input');
    await nameInput.fill('Algorithms Sprint (Expanded)');

    // Expand react-components topic to toggle stepper card
    const reactHeader = page.getByTestId('deck-editor-topic-header-react-components');
    await reactHeader.click();
    const stepperCheckbox = page.getByTestId('deck-editor-card-checkbox-stepper');
    await stepperCheckbox.check();

    // Save changes
    const submitBtn = page.getByTestId('create-deck-submit-btn');
    await expect(submitBtn).toContainText('Save Changes (3)');
    await submitBtn.click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator('.app-unlock-toast')).toBeVisible();

    // Active deck is now "Algorithms Sprint (Expanded)" with 3 cards
    await expect(deckTrigger).toContainText('Algorithms Sprint (Expanded)');
    await expect(deckTrigger).toContainText('3 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(3);
  });

  test('edits a custom deck via dropdown pencil icon, then deletes deck', async ({ page }) => {
    // Seed an existing custom deck
    await page.addInitScript(() => {
      const customDecks = [
        {
          id: 'custom-to-delete',
          name: 'Temporary Deck',
          cardIds: ['stepper'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      localStorage.setItem('leitner_custom_decks', JSON.stringify(customDecks));
    });

    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await deckTrigger.click();

    // Pencil edit icon is visible in dropdown row
    const editItemBtn = page.getByTestId('deck-edit-custom-to-delete');
    await expect(editItemBtn).toBeVisible();
    await editItemBtn.click();

    // Modal opens
    const modal = page.getByTestId('deck-editor-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Editing "Temporary Deck"');

    // Close modal
    const closeBtn = page.getByTestId('create-deck-close-btn');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // Delete custom deck via trash icon in dropdown
    await deckTrigger.click();
    const deleteBtn = page.getByTestId('deck-delete-custom-to-delete');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Reverts to Full Library
    await expect(deckTrigger).toContainText('Full Library (All Cards)');
    await expect(deckTrigger).toContainText('319 Cards');
  });
});
