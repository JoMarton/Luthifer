import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests against the production web build, served like GitHub Pages.
 *
 *   npm run build:site && npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-phone', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-safari', use: { ...devices['iPhone 15'] } },
  ],
  webServer: {
    command: 'node scripts/serve-site.mjs',
    url: 'http://localhost:4173/Luthifer/app/',
    reuseExistingServer: !process.env.CI,
  },
});
