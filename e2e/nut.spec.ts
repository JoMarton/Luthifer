import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const APP = '/Luthifer/app/';

/** Start every test with empty browser storage, i.e. the app's defaults. */
test.beforeEach(async ({ page }) => {
  await page.goto(APP);
  await page.evaluate(() => localStorage.clear());
});

async function openCalculator(page: Page) {
  await page.goto(APP);
  await page.getByRole('link', { name: /Nut Slot Calculator/ }).click();
  await expect(page).toHaveURL(/\/Luthifer\/app\/nut$/);
}

test('home page loads with the tool list', async ({ page }) => {
  await page.goto(APP);
  await expect(page).toHaveTitle('Luthifer');
  await expect(page.getByText('LUTHIFER', { exact: true })).toBeVisible();
  await expect(page.getByText('1 tool installed')).toBeVisible();
});

test('appears quickly without waiting for fonts', async ({ page }) => {
  // Regression: Safari used to show a blank page for ~12 s while fonts loaded.
  await page.goto(APP);
  await expect(page.getByText('1 tool installed')).toBeVisible({ timeout: 3000 });
});

test('calculates the worked example', async ({ page }) => {
  await openCalculator(page);
  await expect(page.getByLabel('GAP BETWEEN STRINGS: 0.2635"')).toBeVisible();
  await expect(page.getByLabel('OUTER SLOT SPAN: 1.4375"')).toBeVisible();
  // Slot positions are shown in the diagram (once laid out) and the table.
  for (const value of ['0.1250', '0.4295', '0.7240', '1.0090', '1.2875', '1.5625']) {
    await expect(page.getByText(value, { exact: true }).first()).toBeVisible();
  }
});

test('deep link to the calculator works and goes back home', async ({ page }) => {
  await page.goto(`${APP}nut`);
  await expect(page.getByLabel('GAP BETWEEN STRINGS: 0.2635"')).toBeVisible();
  await page.getByRole('button', { name: 'Back to tools' }).click();
  await expect(page).toHaveURL(/\/Luthifer\/app\/$/);
});

test('switches to millimeters and accepts mm input', async ({ page }) => {
  await openCalculator(page);

  await page
    .getByRole('radiogroup', { name: 'Result unit' })
    .getByRole('radio', { name: 'millimeters' })
    .click();
  await expect(page.getByLabel('GAP BETWEEN STRINGS: 6.69 mm')).toBeVisible();

  await page
    .getByRole('radiogroup', { name: 'Input unit' })
    .getByRole('radio', { name: 'millimeters' })
    .click();
  const width = page.getByLabel('Nut width', { exact: true });
  await expect(width).toHaveValue('42.863');
  await width.fill('43');
  await expect(page.getByLabel('OUTER SLOT SPAN: 36.65 mm')).toBeVisible();
});

test('remembers inputs after a reload', async ({ page }) => {
  await openCalculator(page);
  await page.getByLabel('Nut width', { exact: true }).fill('1 3/4');
  await expect(page.getByLabel('OUTER SLOT SPAN: 1.5000"')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nut width', { exact: true })).toHaveValue('1.75');
});

test('shows an error for an impossible offset', async ({ page }) => {
  await openCalculator(page);
  await page.getByLabel('Bass offset', { exact: true }).fill('0.01');
  await expect(page.getByRole('alert')).toContainText('Bass offset is smaller than half');
});

test('help popups open and close with Escape', async ({ page }) => {
  await openCalculator(page);

  await page.getByRole('button', { name: 'HOW TO MEASURE ?' }).click();
  await expect(page.getByRole('heading', { name: 'HOW TO MEASURE' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'HOW TO MEASURE' })).toBeHidden();

  await page.getByRole('button', { name: 'HOW IT WAS CALCULATED ?' }).click();
  await expect(page.getByText('g = 1.3175 / 5 = 0.2635')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('g = 1.3175 / 5 = 0.2635')).toBeHidden();
});

test('picks a nut width by guitar', async ({ page }) => {
  await openCalculator(page);
  await page.getByRole('button', { name: 'Nut width by guitar' }).click();
  await page.getByText('American Std / Pro Strat / Tele').click();
  await expect(page.getByText('= Fender American Std / Pro Strat / Tele')).toBeVisible();
  await expect(page.getByLabel('Nut width', { exact: true })).toHaveValue('1.685');
});

test('full-screen diagram opens and closes', async ({ page }) => {
  await openCalculator(page);
  await page.getByRole('button', { name: 'View diagram full screen, sideways' }).click();
  await expect(page.getByText('GAP 0.2635"')).toBeVisible();
  await expect(page.getByRole('img', { name: /Nut diagram: 6 slots/ }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Close full screen' }).click();
  await expect(page.getByText('GAP 0.2635"')).toBeHidden();
});

test('saves a custom string set and keeps it after a reload', async ({ page }) => {
  await openCalculator(page);
  await page.getByRole('link', { name: /String set Electric 10–46/ }).click();
  await expect(page).toHaveURL(/\/nut\/strings$/);

  await page.getByLabel('String 6 — bass gauge').fill('52');
  await expect(page.getByText('CUSTOM · UNSAVED')).toBeVisible();

  await page.getByRole('button', { name: 'SAVE AS NEW SET...' }).click();
  const name = page.getByLabel('Set name');
  await expect(name).toBeFocused();
  await name.fill('Web test set');
  await name.press('Enter');

  await expect(page.getByText('1 saved')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Web test set', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete Web test set' }).click();
  await page.getByRole('button', { name: 'Confirm delete Web test set' }).click();
  await expect(page.getByText('0 saved')).toBeVisible();
});

test('web app manifest and icons are served', async ({ page, request }) => {
  await page.goto(APP);
  const href = await page.locator('link[rel=manifest]').getAttribute('href');
  expect(href).toBe('/Luthifer/app/manifest.webmanifest');
  const manifest = await (await request.get(href!)).json();
  expect(manifest.start_url).toBe('/Luthifer/app/');
  for (const icon of manifest.icons) {
    const res = await request.get(`/Luthifer/app/${icon.src}`);
    expect(res.status(), icon.src).toBe(200);
  }
});

test('support and privacy pages are published next to the app', async ({ page }) => {
  await page.goto('/Luthifer/');
  await expect(page.getByRole('heading', { name: 'Nut Slot Calculator' })).toBeVisible();
  await page.getByRole('link', { name: 'Privacy policy' }).click();
  await expect(page.getByRole('heading', { name: 'Anonymous usage data' })).toBeVisible();
});
