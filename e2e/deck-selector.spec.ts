import { test, expect } from '@playwright/test';

test.describe('Deck Selector & Preset Decks', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
      if (!localStorage.getItem('leitner_active_deck_id')) {
        localStorage.setItem('leitner_active_deck_id', 'full-library');
      }
    });
  });

  test('deck selector dropdown switches active preset and scopes catalog table cards', async ({ page }) => {
    await page.goto('/');

    // Navigate to the Deck Catalog
    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Verify Deck Selector panel is rendered
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toBeVisible();
    await expect(deckTrigger).toContainText('Full Library (All Cards)');
    await expect(deckTrigger).toContainText('277 Cards');

    // Open Dropdown
    await deckTrigger.click();
    const dropdownMenu = page.getByTestId('deck-dropdown-menu');
    await expect(dropdownMenu).toBeVisible();
    await expect(dropdownMenu).toContainText('Built-in Starter Decks');

    // Switch to Full-Stack Core
    const fullStackOption = page.getByTestId('deck-option-full-stack');
    await expect(fullStackOption).toBeVisible();
    await fullStackOption.click();

    // Verify menu closed and trigger reflects Full-Stack Core
    await expect(dropdownMenu).not.toBeVisible();
    await expect(deckTrigger).toContainText('Full-Stack Core');
    await expect(deckTrigger).toContainText('224 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(224);
    await expect(page.getByText('Showing 224 of 224 cards')).toBeVisible();

    // Switch to Algorithms & Data Structures
    await deckTrigger.click();
    const algoOption = page.getByTestId('deck-option-algorithms');
    await algoOption.click();

    await expect(deckTrigger).toContainText('Algorithms & Data Structures');
    await expect(deckTrigger).toContainText('96 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(96);
    await expect(page.getByText('Showing 96 of 96 cards')).toBeVisible();

    // Switch to Frontend Specialist
    await deckTrigger.click();
    const feOption = page.getByTestId('deck-option-frontend-specialist');
    await feOption.click();

    await expect(deckTrigger).toContainText('Frontend Specialist');
    await expect(deckTrigger).toContainText('197 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(197);
    await expect(page.getByText('Showing 197 of 197 cards')).toBeVisible();

    // Reload page and verify active deck persists in localStorage
    await page.reload();
    const reloadedCatalogBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await reloadedCatalogBtn.click();
    await expect(deckTrigger).toContainText('Frontend Specialist');
    await expect(deckTrigger).toContainText('197 Cards');
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(197);
  });

  test('migrates legacy stored deck where algorithms-advanced was a pack and shows all cards', async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate stored deck from earlier version where advanced cards had pack: 'algorithms-advanced'
      const legacyState = {
        topics: [
          { id: 'tree-depth-sum', pack: 'algorithms-advanced', track: 'algorithms', box: 1, streak: 0, nextEligibleTrial: 0, status: 'active' },
        ],
        totalCompletedReviews: 0,
      };
      localStorage.setItem('leitner_coding_deck', JSON.stringify(legacyState));
    });
    await page.goto('/');

    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Verify all 277 cards are present in Full Library
    const deckTrigger = page.getByTestId('deck-dropdown-trigger');
    await expect(deckTrigger).toContainText('277 Cards');

    // Switch to Algorithms & Data Structures
    await deckTrigger.click();
    await page.getByTestId('deck-option-algorithms').click();
    await expect(page.locator('tbody tr.catalog-tr')).toHaveCount(96);
    await expect(page.locator('tbody tr.catalog-tr').filter({ hasText: 'Binary Tree: Depth, Sum, Count' })).toBeVisible();
  });
});
