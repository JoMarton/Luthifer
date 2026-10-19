/**
 * Renders the app icon, Android adaptive icon layers, splash image and favicon
 * from scripts/icon-art.mjs into assets/images, and the web-app icons into public/.
 *
 *   npm run icons
 *
 * The iOS/App Store icon must have no alpha channel, so it is flattened
 * through JPEG with macOS `sips` after rendering.
 */
import { Resvg } from '@resvg/resvg-js';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  adaptiveBackgroundSvg,
  adaptiveForegroundSvg,
  iconSvg,
  maskableSvg,
  splashSvg,
} from './icon-art.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/images');
const web = join(root, 'public');
const source = join(root, 'assets/source');
mkdirSync(source, { recursive: true });

const require = createRequire(import.meta.url);
const silkscreen = require.resolve('@expo-google-fonts/silkscreen/700Bold/Silkscreen_700Bold.ttf');

function render(name, svg, size, dir = out) {
  writeFileSync(join(source, name.replace(/\.png$/, '.svg')), svg);
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles: [silkscreen], loadSystemFonts: false, defaultFontFamily: 'Silkscreen' },
  })
    .render()
    .asPng();
  const file = join(dir, name);
  writeFileSync(file, png);
  console.log(`${name} ${size}×${size}`);
  return file;
}

function flatten(file) {
  const jpg = `${file}.jpg`;
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', file, '--out', jpg], {
    stdio: 'ignore',
  });
  execFileSync('sips', ['-s', 'format', 'png', jpg, '--out', file], { stdio: 'ignore' });
  rmSync(jpg);
}

flatten(render('icon.png', iconSvg(), 1024));
render('android-icon-background.png', adaptiveBackgroundSvg(), 1024);
render('android-icon-foreground.png', adaptiveForegroundSvg(), 1024);
render('android-icon-monochrome.png', adaptiveForegroundSvg('#FFFFFF'), 1024);
render('splash-icon.png', splashSvg(), 1024);
render('favicon.png', iconSvg(), 48);

// Web app (home-screen install)
flatten(render('apple-touch-icon.png', iconSvg(), 180, web));
render('icon-192.png', iconSvg(), 192, web);
render('icon-512.png', iconSvg(), 512, web);
render('icon-maskable-512.png', maskableSvg(), 512, web);
