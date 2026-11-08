import { defineConfig, devices } from '@playwright/test';

/**
 * Browser smoke test: every seed card is run in the PRODUCTION build (vite preview) in real Chromium.
 *   npm run e2e                 # builds, then runs all cards
 *   npm run e2e -- -g "debounce"  # a subset by card id
 * Unit tests run in node/jsdom; this suite exists because jsdom hides production-React and real-browser differences.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 60_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 1, // one retry absorbs a timing flake; a real regression fails twice
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
