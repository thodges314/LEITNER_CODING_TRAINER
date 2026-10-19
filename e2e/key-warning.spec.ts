import { test, expect } from '@playwright/test';

test('Settings warns plainly that an API key is stored in plain text, and how to limit the risk', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start practicing/ }).click();
  await page.getByRole('button', { name: /Settings/ }).first().click();
  const warning = page.getByTestId('api-key-warning');
  await warning.scrollIntoViewIfNeeded();
  await expect(warning).toBeVisible();
  await expect(warning).toContainText('stored in plain text');
  await expect(warning).toContainText('not included in backup exports');
  await expect(warning).toContainText('low spending limit');
});
