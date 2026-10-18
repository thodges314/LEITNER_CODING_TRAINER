import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const CLOSE_WELCOME = /Start practicing/;

async function openApp(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: CLOSE_WELCOME }).click();
}

const isMac = (page: Page) =>
  page.evaluate(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || nav.userAgent);
  });

test.describe('keyboard shortcut hints', () => {
  test('practice buttons show a platform-aware shortcut hint and declare aria-keyshortcuts', async ({ page }) => {
    await openApp(page);
    const mac = await isMac(page);
    const expected = {
      run: mac ? 'Run tests (⌘↵)' : 'Run tests (Ctrl+Enter)',
      submit: mac ? 'Submit for evaluation (⌘⇧↵)' : 'Submit for evaluation (Ctrl+Shift+Enter)',
      format: mac ? 'Format code (⇧⌥F)' : 'Format code (Shift+Alt+F)',
    };
    for (const [id, text] of Object.entries(expected)) {
      const button = page.locator(`[data-shortcut^="${text.split(' (')[0]}"]`);
      await expect(button, id).toHaveAttribute('data-shortcut', text);
      await expect(button, id).toHaveAttribute('aria-keyshortcuts', /(Control|Meta|Shift)\+/);
    }
  });

  test('the hint becomes visible on hover and on keyboard focus', async ({ page }) => {
    await openApp(page);
    const run = page.locator('[data-shortcut^="Run tests"]');
    const shown = () => run.evaluate((el) => getComputedStyle(el, '::after').opacity);
    await expect.poll(shown).toBe('0');
    await run.hover();
    await expect.poll(shown).toBe('1');
    await page.mouse.move(0, 0);
    await expect.poll(shown).toBe('0');
    await run.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab'); // back onto the button by keyboard, so :focus-visible applies
    await expect(run).toBeFocused();
    await expect.poll(shown).toBe('1');
  });

  test('on a Mac the hints and the Settings list use Mac symbols', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgentData', { get: () => ({ platform: 'macOS' }) });
    });
    await openApp(page);
    await expect(page.locator('[data-shortcut^="Run tests"]')).toHaveAttribute('data-shortcut', 'Run tests (⌘↵)');
    await expect(page.locator('[data-shortcut^="Submit"]')).toHaveAttribute('data-shortcut', 'Submit for evaluation (⌘⇧↵)');
    await expect(page.locator('[data-shortcut^="Format"]')).toHaveAttribute('data-shortcut', 'Format code (⇧⌥F)');
    await page.getByRole('button', { name: /Settings/ }).first().click();
    await page.getByTestId('shortcuts-section').getByText('Keyboard shortcuts').click();
    await expect(page.getByTestId('shortcuts-list').locator('kbd').first()).toHaveText('⌘');
  });

  test('Settings lists every shortcut with the right keys', async ({ page }) => {
    await openApp(page);
    const mac = await isMac(page);
    await page.getByRole('button', { name: /Settings/ }).first().click();
    const section = page.getByTestId('shortcuts-section');
    await section.getByText('Keyboard shortcuts').click();
    const list = page.getByTestId('shortcuts-list');
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(list).toContainText('Run tests');
    await expect(list).toContainText('Submit for evaluation');
    await expect(list).toContainText('Format code');
    await expect(list.locator('kbd').first()).toHaveText(mac ? '⌘' : 'Ctrl');
  });
});
