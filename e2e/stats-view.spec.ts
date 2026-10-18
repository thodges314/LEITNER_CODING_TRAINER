import { test, expect } from '@playwright/test';

const ARTIFACTS_DIR = '/Volumes/Claudet/thomashodges/.gemini/antigravity-ide/brain/0e16ae8f-66e7-4fff-be68-0f9c24e756fd';

test.describe('Dashboard 2x2 KPI and Stats Widget', () => {
  test('renders 2x2 KPI layout alongside DeckStatsWidget in Dark and Day themes with 4 interactive view modes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      localStorage.setItem('leitner_theme', 'dark');
      localStorage.setItem('leitner_welcomed', '1');
    });

    await page.goto('/');

    // Dismiss welcome modal if shown
    const welcomeBtn = page.getByRole('button', { name: /Start practicing/ });
    if (await welcomeBtn.isVisible()) {
      await welcomeBtn.click();
    }

    // Switch to Deck Catalog tab
    await page.getByRole('button', { name: /Deck Catalog/i }).click();

    // Verify hidden packs banner is gone
    await expect(page.getByText(/from optional packs .* are hidden/i)).toHaveCount(0);

    // Verify 4 KPI cards exist
    await expect(page.getByText('Completed Reviews')).toBeVisible();
    await expect(page.getByText('Deck Distribution')).toBeVisible();
    await expect(page.getByText(/Mastered \/ Long-term/)).toBeVisible();
    await expect(page.getByText('Staged Unlock Progress')).toBeVisible();

    // Verify DeckStatsWidget exists
    const statsWidget = page.getByTestId('deck-stats-widget');
    await expect(statsWidget).toBeVisible();

    // 1. Verify Skill Matrix is the DEFAULT active view mode
    await expect(statsWidget.getByText('Skill Matrix')).toBeVisible();
    await expect(statsWidget.getByTestId('stats-chart-svg')).toBeVisible();

    // Screenshot in dark theme (Skill Matrix)
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-radar-dark.png`,
      fullPage: false,
    });

    // Test exclusive domain filter on Skill Matrix
    const algoDomain = statsWidget.locator('g[data-domain="algorithms"]');
    await algoDomain.click();
    await expect(page.getByText('1 of 9 selected')).toBeVisible();
    // Toggle off by clicking again
    await algoDomain.click();
    await expect(page.getByText('1 of 9 selected')).toHaveCount(0);

    // 2. Switch to Track Orbit mode
    await page.getByTestId('stats-mode-orbit').click();
    await expect(statsWidget.getByText('Track Orbit')).toBeVisible();

    // Screenshot Track Orbit mode (dark)
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-dark.png`,
      fullPage: false,
    });

    // Test exclusive track filter on Track Orbit
    const algoSlice = statsWidget.locator('path[data-track="algorithms"]');
    await algoSlice.click();
    await expect(page.getByText('1 of 9 selected')).toBeVisible();
    // Toggle off by clicking again
    await algoSlice.click();
    await expect(page.getByText('1 of 9 selected')).toHaveCount(0);

    // 3. Switch to Mastery Tiers mode
    await page.getByTestId('stats-mode-tiers').click();
    await expect(statsWidget.getByText('Mastery Tiers')).toBeVisible();

    // Screenshot Mastery Tiers mode (dark)
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-tiers-dark.png`,
      fullPage: false,
    });

    // Test exclusive tier filter on Mastery Tiers
    const box1Arc = statsWidget.locator('g[data-box="1"] path').last();
    await box1Arc.dispatchEvent('click');
    // Toggle off
    await box1Arc.dispatchEvent('click');

    // 4. Switch to Velocity Diagnostic mode
    await page.getByTestId('stats-mode-velocity').click();
    await expect(statsWidget.getByText('Velocity Diagnostic')).toBeVisible();
    await expect(statsWidget.getByTestId('velocity-score-text')).toBeVisible();
    await expect(statsWidget.getByTestId('velocity-status-text')).toBeVisible();

    // Screenshot Velocity Diagnostic mode (dark)
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-velocity-dark.png`,
      fullPage: false,
    });

    // Test exclusive velocity filter button
    const dragBtn = statsWidget.getByTestId('velocity-tier-drag');
    await dragBtn.click();
    await dragBtn.click(); // toggle off

    // 5. Switch theme to Apple IIGS (Day theme) via header toggle button
    await page.getByTestId('theme-toggle-btn').click();

    // Verify in apple-gsos day theme
    await expect(statsWidget).toBeVisible();
    await expect(statsWidget.getByText('Velocity Diagnostic')).toBeVisible();

    // Screenshot Velocity Diagnostic in Day theme
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-velocity-day.png`,
      fullPage: false,
    });

    // Switch to Skill Matrix in Day theme (verify dark guidelines and text)
    await page.getByTestId('stats-mode-radar').click();
    await expect(statsWidget.getByText('Skill Matrix')).toBeVisible();

    // Screenshot Skill Matrix in Day theme
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-radar-day.png`,
      fullPage: false,
    });

    // Switch to Track Orbit in Day theme
    await page.getByTestId('stats-mode-orbit').click();
    await expect(statsWidget.getByText('Track Orbit')).toBeVisible();

    // Screenshot Track Orbit in Day theme
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-day.png`,
      fullPage: false,
    });

    // Switch to Mastery Tiers in Day theme
    await page.getByTestId('stats-mode-tiers').click();
    await expect(statsWidget.getByText('Mastery Tiers')).toBeVisible();

    // Screenshot Mastery Tiers in Day theme
    await page.screenshot({
      path: `${ARTIFACTS_DIR}/stats-widget-tiers-day.png`,
      fullPage: false,
    });
  });
});
