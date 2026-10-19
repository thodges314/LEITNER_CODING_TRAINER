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
  test('non-component cards (algorithms, custom hooks, pure logic) do not show the preview window', async ({ page }) => {
    // binary-search-exact is an algorithm card without preview
    await openCard(page, 'binary-search-exact');
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);
    await expect(page.locator('.legacy-component-preview-container')).toHaveCount(0);

    // use-debounce-hook is a custom hook card without UI rendering
    await openCard(page, 'use-debounce-hook');
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);
    await expect(page.locator('.legacy-component-preview-container')).toHaveCount(0);

    // calculate-winner is a pure logic card without UI rendering
    await openCard(page, 'calculate-winner');
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);
    await expect(page.locator('[data-testid="react-preview-window"]')).toHaveCount(0);
    await expect(page.locator('.legacy-component-preview-container')).toHaveCount(0);
  });

  test('switch-toggle-a11y: opens to ready placeholder without errors, goes live on Run Code, and logs events', async ({ page }) => {
    const card = topics.find((t) => t.id === 'switch-toggle-a11y');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'switch-toggle-a11y', solution);

    // No eyeball/toggle button (preview is permanent part of interface)
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);

    // Live preview window is visible immediately in Ready state (no premature errors)
    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();
    await expect(previewWindow.locator('[data-testid="preview-ready-placeholder"]')).toBeVisible();
    await expect(previewWindow.locator('[data-testid="preview-status-badge"]')).toContainText('Ready');
    await expect(previewWindow.getByRole('alert')).toHaveCount(0);

    // Verify sandboxed iframe attribute is preset
    const iframeElement = previewWindow.locator('iframe');
    await expect(iframeElement).toHaveAttribute('sandbox', 'allow-scripts');

    // Click 'Run Code / Test' button to activate live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    // Status transitions to Live
    await expect(previewWindow.locator('[data-testid="preview-status-badge"]')).toContainText('Live');
    await expect(previewWindow.locator('[data-testid="preview-ready-placeholder"]')).toHaveCount(0);

    // Frame locator to inspect inside the sandboxed iframe
    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    const switchBtn = frame.locator('button[role="switch"]').first();
    await expect(switchBtn).toBeVisible({ timeout: 5000 });

    // Click switch inside iframe and verify event log
    await switchBtn.click();

    // The Event Log & Output panel under the preview should record the onChange event
    const eventLog = previewWindow.getByText(/onChange/);
    await expect(eventLog.first()).toBeVisible();
  });

  test('star-rating-component: activates live view and logs rating interaction', async ({ page }) => {
    const card = topics.find((t) => t.id === 'star-rating-component');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'star-rating-component', solution);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();
    await expect(previewWindow.locator('[data-testid="preview-ready-placeholder"]')).toBeVisible();

    // Click 'Run Code / Test' button to activate live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    // Transitions to live
    await expect(previewWindow.locator('[data-testid="preview-status-badge"]')).toContainText('Live');

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

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Run Code to activate live view with infinite loop
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    // The timeout or infinite loop error notice is displayed
    const alertBox = previewWindow.getByRole('alert');
    await expect(alertBox).toBeVisible({ timeout: 20000 });
    await expect(alertBox).toContainText(/timed out|infinite loop/i);

    // The main page is NOT frozen: user can still click Skip Card
    const skipBtn = page.getByRole('button', { name: /Skip Card/ });
    await expect(skipBtn).toBeEnabled();
    await skipBtn.click();
  });

  test('a state-update loop in an effect is stopped with a visible error and does not freeze the main page', async ({ page }) => {
    const badCode = `function Switch(props) {
      const [n, setN] = useState(0);
      useEffect(() => { setN((v) => v + 1); });
      return <button>{n}</button>;
    }`;
    await openCard(page, 'switch-toggle-a11y', badCode);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    const alertBox = previewWindow.getByRole('alert');
    await expect(alertBox).toBeVisible({ timeout: 20000 });
    await expect(alertBox).toContainText(/maximum update|too many|infinite|loop|timed out/i);

    const skipBtn = page.getByRole('button', { name: /Skip Card/ });
    await expect(skipBtn).toBeEnabled();
    await skipBtn.click();
  });

  test('pop-out button opens a separate window and can be docked back', async ({ page }) => {
    const card = topics.find((t) => t.id === 'switch-toggle-a11y');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'switch-toggle-a11y', solution);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Start live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    const popOutBtn = page.locator('[data-testid="preview-popout-btn"]');
    await expect(popOutBtn).toBeVisible();

    // Click pop out and wait for popup window
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      popOutBtn.click(),
    ]);

    expect(popup).toBeDefined();

    // Verify main window shows docked placeholder with 'Dock back' button
    const mainDockBtn = page.locator('[data-testid="preview-main-dock-btn"]');
    await expect(mainDockBtn).toBeVisible();

    // Verify popup contains the rendered preview component
    const frame = popup.frameLocator('iframe');
    const switchBtn = frame.locator('button[role="switch"]').first();
    await expect(switchBtn).toBeVisible({ timeout: 5000 });

    // Click switch inside the pop-out window
    await switchBtn.click();

    // Verify dock back button in popup closes popup and restores inline preview
    const popupDockBtn = popup.locator('[data-testid="preview-dock-btn"]');
    await expect(popupDockBtn).toBeVisible();
    await popupDockBtn.click();

    // The popup is closed and the main window has restored the normal preview window
    await expect.poll(() => popup.isClosed()).toBe(true);
    await expect(page.locator('[data-testid="preview-popout-btn"]')).toBeVisible();
  });

  test('progress-bar: mounts in sandboxed iframe, updates progress, and logs events', async ({ page }) => {
    const card = topics.find((t) => t.id === 'progress-bar');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'progress-bar', solution);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Activate live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    const bar = frame.locator('[role="progressbar"]');
    await expect(bar).toBeVisible({ timeout: 5000 });
    await expect(bar).toHaveAttribute('aria-valuenow', '45');

    // Click '+10%' button inside iframe demo
    const plusBtn = frame.getByRole('button', { name: '+10%' });
    await plusBtn.click();
    await expect(bar).toHaveAttribute('aria-valuenow', '55');

    // Event log should record the change
    const eventLog = previewWindow.getByText(/progress/);
    await expect(eventLog.first()).toBeVisible();
  });

  test('progress-bar: pop-out, dock-back, and theme toggle do not vanish the live preview', async ({ page }) => {
    const card = topics.find((t) => t.id === 'progress-bar');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    await openCard(page, 'progress-bar', solution);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Activate live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    let frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    await expect(frame.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });

    // 1. Pop out
    const popoutBtn = previewWindow.locator('[data-testid="preview-popout-btn"]');
    await expect(popoutBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      popoutBtn.click(),
    ]);

    expect(popup).toBeDefined();

    // Inside popup, the preview iframe should render the component
    const popupFrame = popup.frameLocator('iframe');
    await expect(popupFrame.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });

    // 2. Dock back
    const mainDockBtn = page.locator('[data-testid="preview-main-dock-btn"]');
    await expect(mainDockBtn).toBeVisible();
    await mainDockBtn.click();
    await expect.poll(() => popup.isClosed()).toBe(true);

    // After dock back, preview in main window is still live and visible!
    frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    await expect(frame.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });

    // 3. Toggle theme (night/day mode)
    const themeBtn = page.getByRole('button', { name: /Switch to Apple IIGS|Switch to Synthwave/ });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      // Verify preview is still rendered after theme switch
      await expect(frame.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });
    }

    // 4. Restart button
    const restartBtn = page.locator('[data-testid="preview-restart-btn"]');
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();
    await expect(frame.locator('[role="progressbar"]')).toBeVisible({ timeout: 5000 });
  });

  test('legacy component preview: pop-out and dock-back work on cards without previewCode', async ({ page }) => {
    await page.goto('/');
    const welcomeBtn = page.getByRole('button', { name: /Start practicing/ });
    if (await welcomeBtn.isVisible()) {
      await welcomeBtn.click();
    }

    await page.evaluate(
      ({ DECK_KEY, base }) => {
        const stored = localStorage.getItem(DECK_KEY);
        if (stored) {
          const deck = JSON.parse(stored);
          for (const t of deck.topics) {
            t.status = 'locked';
          }
          // Built from the bundled card data: saved decks only keep progress for built-in cards, not their content.
          const legacyCard = {
            ...base,
            box: 1,
            streak: 0,
            nextEligibleTrial: 0,
            id: 'custom-unannotated-card',
            title: 'Custom Unannotated Card',
            track: 'react-components',
            rendersComponent: true,
            status: 'active',
          };
          delete legacyCard.previewCode;
          deck.topics.unshift(legacyCard);
          localStorage.setItem(DECK_KEY, JSON.stringify(deck));
        }
        localStorage.setItem('leitner_welcomed', '1');
      },
      { DECK_KEY, base: topics[0] }
    );

    await page.reload();

    // Does not have preview-toggle-btn
    await expect(page.locator('#preview-toggle-btn')).toHaveCount(0);

    // Has legacy preview container with pop-out button
    const popOutBtn = page.locator('[data-testid="legacy-preview-popout-btn"]');
    await expect(popOutBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      popOutBtn.click(),
    ]);

    expect(popup).toBeDefined();

    // Main window shows docked state with dock-back button
    const mainDockBtn = page.locator('[data-testid="legacy-preview-main-dock-btn"]');
    await expect(mainDockBtn).toBeVisible();
    await expect(page.getByText('Component Preview (Pop-out Active)')).toBeVisible();

    // Dock back from main window
    await mainDockBtn.click();
    await expect.poll(() => popup.isClosed()).toBe(true);
  });

  test('controlled-vs-uncontrolled-input: renders live preview cleanly even when test runner snippet with $dom is uncommented in the editor', async ({ page }) => {
    const card = topics.find((t) => t.id === 'controlled-vs-uncontrolled-input');
    expect(card).toBeDefined();
    const solution = card?.referenceSolution || card?.solution || '';

    // Simulate user having the test runner example uncommented in the editor
    const codeWithUncommentedTest = `${solution}\n\n// Test runner example:\nconst { render, fire, q } = $dom;\n{\n  const calls = [];\n  const { container } = render(<SearchForm onSearch={(s) => calls.push(s)} />);\n  const input = q('input', container);\n  const form = q('form', container);\n  fire.change(input, 'react');\n  $test.check('Input mirrors typed text', input.value === 'react');\n}`;

    await openCard(page, 'controlled-vs-uncontrolled-input', codeWithUncommentedTest);

    const previewWindow = page.locator('[data-testid="react-preview-window"]');
    await expect(previewWindow).toBeVisible();

    // Click 'Run Code / Test' button to trigger run & live preview
    await page.getByRole('button', { name: /Run Code \/ Test/ }).click();

    // Preview should transition to Live without crashing on $dom
    await expect(previewWindow.locator('[data-testid="preview-status-badge"]')).toContainText('Live');
    await expect(previewWindow.getByRole('alert')).toHaveCount(0);

    // Frame locator to inspect inside the sandboxed iframe
    const frame = page.frameLocator('[data-testid="react-preview-window"] iframe');
    const input = frame.locator('input').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    const submitBtn = frame.getByRole('button', { name: /Search/i });
    await expect(submitBtn).toBeVisible();

    // Verify typing into input updates controlled state value without any errors
    await input.pressSequentially('hello search');
    await expect(input).toHaveValue('hello search');
  });
});


