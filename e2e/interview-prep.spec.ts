import { test, expect } from '@playwright/test';

test.describe('AI Interview Prep Copilot Flow', () => {
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

  test('opens AI copilot from deck selector, synthesizes curriculum, and creates tailored deck', async ({ page }) => {
    await page.goto('/');

    // Navigate to the Deck Catalog
    const catalogNavBtn = page.getByRole('button', { name: /Deck Catalog/i });
    await catalogNavBtn.click();

    // Verify Deck Catalog is visible
    await expect(page.locator('.dashboard-title')).toContainText('Catalog');

    // Open Deck Selector dropdown
    const dropdownTrigger = page.getByTestId('deck-dropdown-trigger');
    await dropdownTrigger.click();

    // Click Tailor Deck with AI Copilot
    const aiCopilotBtn = page.getByTestId('deck-dropdown-ai-btn');
    await expect(aiCopilotBtn).toBeVisible();
    await aiCopilotBtn.click();

    // Verify modal opened
    const modal = page.getByTestId('interview-prep-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#ai-prep-modal-title')).toHaveText('AI Interview Prep Coach');

    // Fill in target company and role
    const companyInput = page.getByTestId('ai-prep-company-input');
    await companyInput.fill('Stripe');

    const roleInput = page.getByTestId('ai-prep-role-input');
    await roleInput.fill('Senior Frontend Engineer');

    const rawNotesInput = page.getByTestId('ai-prep-raw-notes-input');
    await rawNotesInput.fill('Stripe interview onsite: Focus on compound components, form accessibility, and state machines.');

    // Select weakness chip
    const weaknessChip = page.locator('[data-testid^="ai-weakness-chip-"]').first();
    await weaknessChip.click();

    // Click Synthesize Prep Curriculum
    const generateBtn = page.getByTestId('ai-prep-generate-btn');
    await generateBtn.click();

    // Verify review view appears
    const reviewView = page.getByTestId('ai-prep-review-view');
    await expect(reviewView).toBeVisible({ timeout: 5000 });

    // Verify deck name populated with Stripe in stacked header
    const deckNameInput = page.getByTestId('ai-prep-review-deck-name');
    await expect(deckNameInput).toHaveValue(/Stripe/);
    const deckDescInput = page.getByTestId('ai-prep-review-deck-desc');
    await expect(deckDescInput).toBeVisible();

    // Tab 1 (AI Strategy & Coach) is active by default with the Strategic Executive Summary as the opening message
    await expect(page.locator('.dialogue-messages-scroll')).toBeVisible();
    const firstAssistantMsg = page.locator('.dialogue-bubble.assistant').first();
    await expect(firstAssistantMsg).toBeVisible();
    await expect(firstAssistantMsg).toContainText(/Stripe/);

    // Test sending a curriculum modification message to the AI Coach
    const dialogueInput = page.locator('.dialogue-text-input');
    await dialogueInput.fill('Trim to 10 cards');
    await page.locator('.dialogue-send-btn').click();

    // Wait for dialogue reply
    await expect(page.locator('.dialogue-bubble.assistant').last()).toContainText(/streamlined your curriculum/i);

    // Check Tab 2 (Selected Cards)
    const cardsTab = page.getByTestId('ai-prep-tab-cards');
    await cardsTab.click();

    // Verify card items exist with priority badges
    const cardItems = page.locator('.ai-prep-card-item');
    const cardCount = await cardItems.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check Tab 3 (External Topics & Gaps)
    const guideTab = page.getByTestId('ai-prep-tab-guide');
    await guideTab.click();
    await expect(page.locator('.guide-topics-grid')).toBeVisible();

    // Check Tab 4 (Interactive Drills & Checklist)
    const toolsTab = page.getByTestId('ai-prep-tab-tools');
    await toolsTab.click();
    await expect(page.locator('.interactive-tools-grid')).toBeVisible();

    // Verify dedicated print document exists
    const printDoc = page.locator('.ai-prep-print-document');
    await expect(printDoc).toHaveCount(1);
    await expect(printDoc.locator('.print-title')).toContainText('Stripe');

    // Verify Backup Dossier JSON and Restore Backup JSON buttons are visible in review actions
    const downloadJsonBtn = page.getByTestId('ai-prep-download-json-btn');
    await expect(downloadJsonBtn).toBeVisible();

    const importJsonFooterBtn = page.getByTestId('ai-prep-import-json-footer-btn');
    await expect(importJsonFooterBtn).toBeVisible();

    // Click Create Custom Deck
    const prepCloseBtn = page.getByTestId('ai-prep-close-btn');
    await prepCloseBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Verify active deck is switched to the new Stripe custom deck
    await expect(page.locator('.deck-dropdown-active-name')).toHaveText(/Stripe/);

    // 1. Verify Active Interview Strategy Briefing banner is visible on Dashboard
    const strategyBanner = page.getByTestId('active-strategy-briefing-banner');
    await expect(strategyBanner).toBeVisible();
    await expect(strategyBanner.locator('.strategy-banner-title')).toContainText('Stripe');
    await expect(strategyBanner.locator('.strategy-banner-metrics')).toBeVisible();

    // 2. Click "Open Strategy & Copilot" from the dashboard banner to reopen
    const bannerOpenBtn = page.getByTestId('strategy-banner-open-copilot-btn');
    await bannerOpenBtn.click();
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('ai-prep-review-view')).toBeVisible();

    // Verify "+ New Prep" and "Delete Dossier" buttons are visible in modal header
    const newPrepBtn = page.getByTestId('ai-prep-new-plan-btn');
    await expect(newPrepBtn).toBeVisible();

    const deletePlanBtn = page.getByTestId('ai-prep-delete-plan-btn');
    await expect(deletePlanBtn).toBeVisible();

    // Close modal
    const closeBtn = page.getByTestId('ai-prep-close-btn');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Test reopening via Global Header button
    const headerStrategyBtn = page.getByTestId('header-interview-prep-btn');
    await expect(headerStrategyBtn).toBeVisible();
    await headerStrategyBtn.click();
    await expect(modal).toBeVisible();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // 4. Test reopening via Practice Arena toolbar button without leaving practice
    const arenaNavBtn = page.getByRole('button', { name: /Practice Arena/i });
    await arenaNavBtn.click();

    const arenaStrategyBtn = page.getByTestId('header-interview-prep-btn'); // rename this
    await expect(arenaStrategyBtn).toBeVisible();
    await arenaStrategyBtn.click();
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('ai-prep-review-view')).toBeVisible();

    // 5. Test Deleting Dossier to Start Fresh
    // Click Delete Dossier from the modal header
    await page.getByTestId('ai-prep-delete-plan-btn').click();

    // Should immediately transition to the fresh input form with empty company input
    await expect(page.getByTestId('ai-prep-company-input')).toBeVisible();
    await expect(page.getByTestId('ai-prep-company-input')).toHaveValue('');

    // Close modal and return to Deck Catalog
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    await catalogNavBtn.click();

    // Active briefing banner should no longer be present on the dashboard
    await expect(page.getByTestId('active-strategy-briefing-banner')).not.toBeVisible();
  });
});
