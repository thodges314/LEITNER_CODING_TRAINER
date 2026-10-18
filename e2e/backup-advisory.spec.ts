import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function submitAndCommit(page: Page) {
  const submitBtn = page.getByRole('button', { name: /Submit for Evaluation/i });
  await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  await submitBtn.click();
  const commitBtn = page.getByRole('button', {
    name: /Commit Result & Continue|Commit & Practice Pattern|Skip Drill & Continue|Continue to Next Card/i,
  });
  await expect(commitBtn).toBeVisible({ timeout: 10000 });
  await commitBtn.click();
}

test.describe('First 4 Problems Backup Advisory and Export Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('leitner_welcomed', '1');
      localStorage.setItem('leitner_theme', 'dark');
    });
    await page.reload();

    // Dismiss welcome modal if present
    const welcomeBtn = page.getByRole('button', { name: /Start practicing/i });
    if (await welcomeBtn.isVisible()) {
      await welcomeBtn.click();
    }
  });

  test('advisory popup triggers on the 4th completed problem, explains localStorage loss, and dismisses', async ({ page }) => {
    // Verify modal is not visible initially
    await expect(page.getByTestId('backup-advisory-modal')).toHaveCount(0);

    // Complete problem 1-3
    await page.evaluate(() => {
      localStorage.setItem('leitner_completed_problems_count', '3');
    });

    // Now submit current card to reach 4th completion
    await submitAndCommit(page);

    const modal = page.getByTestId('backup-advisory-modal');
    await expect(modal).toBeVisible();

    // Verify advisory content
    await expect(modal.getByRole('heading', { name: /Back Up Your Practice Progress/i })).toBeVisible();
    await expect(modal.getByText(/4 Problems Completed/i)).toBeVisible();
    await expect(modal.getByText(/at least at the end of every session/i)).toBeVisible();
    await expect(modal.getByText(/All your active cards, Leitner spacing tiers/i)).toBeVisible();
    await expect(modal.getByText(/Risk of Reset:/i)).toBeVisible();
    await expect(modal.getByText(/progress data will be permanently wiped/i)).toBeVisible();
    // Warning triangle next to Risk of Reset should be removed
    await expect(modal.locator('svg.lucide-alert-triangle')).toHaveCount(0);

    // Dismiss the modal
    const dismissBtn = modal.getByTestId('backup-advisory-dismiss-btn');
    await dismissBtn.click();
    await expect(modal).toHaveCount(0);

    // Verify localStorage has recorded dismissal
    const dismissed = await page.evaluate(() => localStorage.getItem('leitner_backup_advisory_dismissed'));
    expect(dismissed).toBe('1');

    // Next completion should not show the modal again
    await submitAndCommit(page);
    await expect(page.getByTestId('backup-advisory-modal')).toHaveCount(0);
  });

  test('agreeing to advisory navigates to Deck Catalog with highlighted Export Progress button and dismissible callout', async ({ page }) => {
    // Set completed count to 3 so the next submission reaches 4
    await page.evaluate(() => {
      localStorage.setItem('leitner_completed_problems_count', '3');
    });

    await submitAndCommit(page);

    const modal = page.getByTestId('backup-advisory-modal');
    await expect(modal).toBeVisible();

    // Click "Go to Export Progress"
    const agreeBtn = modal.getByTestId('backup-advisory-agree-btn');
    await agreeBtn.click();

    // Modal closes
    await expect(modal).toHaveCount(0);

    // Navigates to Catalog & Deck Performance view
    await expect(page.getByRole('heading', { name: /Catalog & Deck Performance/i })).toBeVisible();

    // Export Progress button is highlighted
    const exportBtn = page.getByTestId('export-progress-btn');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toHaveClass(/btn-export-highlight/);

    // Callout bubble is displayed
    const callout = page.getByTestId('export-callout-bubble');
    await expect(callout).toBeVisible();
    await expect(callout.getByText(/Download Backup Here/i)).toBeVisible();
    await expect(callout.getByText(/Click Export Progress to save your current deck as a \.json file/i)).toBeVisible();

    // Dismiss the callout via close X button
    const closeBtn = callout.getByRole('button', { name: /Dismiss export alert/i });
    await closeBtn.click();

    // Callout is gone and highlight is removed
    await expect(callout).toHaveCount(0);
    await expect(exportBtn).not.toHaveClass(/btn-export-highlight/);
  });

  test('clicking highlighted Export Progress triggers download and clears highlight', async ({ page }) => {
    // Trigger advisory
    await page.evaluate(() => {
      localStorage.setItem('leitner_completed_problems_count', '3');
    });

    await submitAndCommit(page);

    const modal = page.getByTestId('backup-advisory-modal');
    await modal.getByTestId('backup-advisory-agree-btn').click();

    const exportBtn = page.getByTestId('export-progress-btn');
    const callout = page.getByTestId('export-callout-bubble');
    await expect(callout).toBeVisible();

    // Prepare download listener and click export
    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^leitner-backup-.*\.json$/);

    // Highlight and callout are dismissed after exporting
    await expect(callout).toHaveCount(0);
    await expect(exportBtn).not.toHaveClass(/btn-export-highlight/);
  });

  test('unscored reinforcement repeats do not increment problem count toward threshold', async ({ page }) => {
    // Set completed count to 2, so fail -> 3, then repeat should NOT increment to 4
    await page.evaluate(() => {
      localStorage.setItem('leitner_completed_problems_count', '2');
      localStorage.setItem('leitner_draft:binary-search-exact', '// intentionally broken');
    });
    await page.reload();

    // Submit broken code and enter reinforcement drill (failed review counts as problem #3)
    await submitAndCommit(page);

    const countAfterFail = await page.evaluate(() => localStorage.getItem('leitner_completed_problems_count'));
    expect(countAfterFail).toBe('3');

    // Now in unscored reinforcement drill. Skip/finish drill.
    const finishBtn = page.getByRole('button', { name: /Skip Drill/i });
    await expect(finishBtn).toBeVisible({ timeout: 10000 });
    await finishBtn.click();

    // Repeat drill must NOT increment count to 4, so modal must not be visible
    await expect(page.getByTestId('backup-advisory-modal')).toHaveCount(0);
    const countAfterDrill = await page.evaluate(() => localStorage.getItem('leitner_completed_problems_count'));
    expect(countAfterDrill).toBe('3');

    // Next scored problem submission reaches #4 and triggers modal
    await submitAndCommit(page);
    const modal = page.getByTestId('backup-advisory-modal');
    await expect(modal).toBeVisible();

    const countAfterFourth = await page.evaluate(() => localStorage.getItem('leitner_completed_problems_count'));
    expect(countAfterFourth).toBe('4');
  });
});
