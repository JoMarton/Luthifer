/**
 * Builds the GitHub Pages site into build/site:
 *
 *   build/site/            ← docs/ (support page, privacy policy)
 *   build/site/app/        ← the Luthifer web app (expo export)
 *   build/site/404.html    ← the app again, so deep links like /Luthifer/app/nut load
 *
 * The site is served from https://jomarton.github.io/Luthifer/, which is why
 * app.json sets experiments.baseUrl to /Luthifer/app.
 *
 *   npm run build:site
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'build/site');

rmSync(site, { recursive: true, force: true });

execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', join(site, 'app')], {
  cwd: root,
  stdio: 'inherit',
});

cpSync(join(root, 'docs'), site, { recursive: true });

// GitHub Pages serves the site-wide 404.html for any unknown path. Serving the
// app there lets Expo Router open the right screen for a deep link.
copyFileSync(join(site, 'app/index.html'), join(site, '404.html'));

// Keep folders that start with "_" (the app's _expo/ bundle) if Pages ever runs Jekyll.
writeFileSync(join(site, '.nojekyll'), '');

console.log(`\nSite built in ${site}`);
