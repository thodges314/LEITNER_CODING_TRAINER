import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface TopicItem {
  id: string;
  previewCode?: string;
  referenceSolution?: string;
  solution?: string;
}

const topics: TopicItem[] = JSON.parse(
  readFileSync(resolve(process.cwd(), 'src/data/topics.json'), 'utf8')
);

const DECK_KEY = 'leitner_coding_deck';
const DRAFT_PREFIX = 'leitner_draft:';

async function openCard(page: Page, id: string, code?: string) {
  await page.goto('/');
  // Dismiss welcome if present
  const welcomeBtn = page.getByRole('button', { name: /Start practicing/ });
  if (await welcomeBtn.isVisible()) {
    await welcomeBtn.click();
  }

  await page.evaluate(
    ({ id, code, DECK_KEY, DRAFT_PREFIX }) => {
      const stored = localStorage.getItem(DECK_KEY);
      if (stored) {
        const deck = JSON.parse(stored);
        for (const t of deck.topics) {
          t.status = t.id === id ? 'active' : 'locked';
        }
        localStorage.setItem(DECK_KEY, JSON.stringify(deck));
      }
      if (code !== undefined) {
        localStorage.setItem(DRAFT_PREFIX + id, code);
      }
      localStorage.setItem('leitner_welcomed', '1');
    },
    { id, code, DECK_KEY, DRAFT_PREFIX }
  );

  await page.reload();
}

test.describe('React preview window', () => {
  test('cards without a preview do not show the Preview toggle', async ({ page }) => {
    // binary-search-exact is an algorithm card without previewCode
    await openCard(page, 'binary-search-exact');
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);
  });

  test('switch-toggle-a11y: toggles preview, mounts in sandboxed iframe, and logs click events', async ({ page }) => {
    const card = topics.find((t) => t.id === 'switch-toggle-a11y');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'switch-toggle-a11y', solution);

    const toggleBtn = page.locator('#preview-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toContainText('Preview');

    // Closed by default
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);

    // Click toggle to open preview
    await toggleBtn.click();
    await expect(toggleBtn).toContainText('Hide Preview');

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Verify sandboxed iframe attribute
    const iframeElement = previewWindow.locator('iframe');
    await expect(iframeElement).toHaveAttribute('sandbox', 'allow-scripts');

    // Frame locator to inspect inside the sandboxed iframe
    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    const switchBtn = frame.locator('button[role="switch"]').first();
    await expect(switchBtn).toBeVisible({ timeout: 5000 });

    // Click switch inside iframe and verify event log
    await switchBtn.click();

    // The Event Log & Output panel under the preview should record the onChange event
    const eventLog = previewWindow.getByText(/onChange/);
    await expect(eventLog.first()).toBeVisible();

    // Close preview via toggle button
    await toggleBtn.click();
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);
  });

  test('star-rating-component: mounts in sandboxed iframe and logs rating change on interaction', async ({ page }) => {
    const card = topics.find((t) => t.id === 'star-rating-component');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'star-rating-component', solution);

    const toggleBtn = page.locator('#preview-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    const radiogroup = frame.locator('div[role="radiogroup"]');
    await expect(radiogroup).toBeVisible({ timeout: 5000 });

    const stars = frame.locator('button[role="radio"]');
    expect(await stars.count()).toBe(5);

    // Click the 4th star
    await stars.nth(3).click();

    // Event log shows onChange(4)
    const eventLog = previewWindow.getByText(/onChange/);
    await expect(eventLog.first()).toBeVisible();
  });

  test('infinite loop in the preview does not freeze the main page', async ({ page }) => {
    const badCode = `function Switch(props) {
      while (true) {}
      return <button>Never</button>;
    }`;
    await openCard(page, 'switch-toggle-a11y', badCode);

    const toggleBtn = page.locator('#preview-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // The timeout or infinite loop error notice is displayed
    const alertBox = previewWindow.getByRole('alert');
    await expect(alertBox).toBeVisible({ timeout: 20000 });
    await expect(alertBox).toContainText(/timed out|infinite loop/i);

    // The main page is NOT frozen: user can still click Skip Card
    const skipBtn = page.getByRole('button', { name: /Skip Card/ });
    await expect(skipBtn).toBeEnabled();
    await skipBtn.click();
  });
});
