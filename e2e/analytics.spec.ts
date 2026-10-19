import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from './fixtures';

const APP = '/Luthifer/app/';

/** Whether the site was built with a PostHog key (from .env or the environment). */
function builtWithKey() {
  if (process.env.EXPO_PUBLIC_POSTHOG_KEY) return true;
  try {
    return /^EXPO_PUBLIC_POSTHOG_KEY=\S+/m.test(readFileSync(join(__dirname, '../.env'), 'utf8'));
  } catch {
    return false;
  }
}

test.describe('anonymous usage analytics', () => {
  test.skip(!builtWithKey(), 'site built without a PostHog key');

  // PostHog ignores automated browsers; look like a person's browser for these tests only.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // Headless Chrome also names itself "HeadlessChrome" here.
      Object.defineProperty(navigator, 'userAgentData', { get: () => undefined });
    });
  });

  test('sends only app_opened, tool_opened and results_viewed', async ({ page, analytics }) => {
    await page.goto(`${APP}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: /Nut Slot Calculator/ }).click();
    await expect(page.getByLabel('GAP BETWEEN STRINGS: 0.2635"')).toBeVisible();

    await expect
      .poll(() => analytics.map((e) => e.event).sort(), { timeout: 15000 })
      .toEqual(['app_opened', 'results_viewed', 'tool_opened']);

    const results = analytics.find((e) => e.event === 'results_viewed')!;
    expect(results.properties).toMatchObject({
      tool: 'nut',
      string_count: 6,
      string_set: 'e-10-46',
      input_unit: 'in',
      result_unit: 'in',
    });
    // Nothing typed by the user is sent.
    expect(JSON.stringify(analytics)).not.toContain('1.6875');
  });

  test('sends nothing after the user turns usage data off', async ({ page, analytics }) => {
    await page.goto(APP);
    await page.getByLabel('Share anonymous usage data').click();
    await expect.poll(() => analytics.length, { timeout: 10000 }).toBeGreaterThan(0);
    const before = analytics.length;

    await page.reload();
    await page.getByRole('link', { name: /Nut Slot Calculator/ }).click();
    await page.waitForTimeout(4000);
    expect(analytics.length).toBe(before);

    // Turn it back on for the next test run in this browser profile.
    await page.goto(APP);
    await page.getByLabel('Share anonymous usage data').click();
  });
});
