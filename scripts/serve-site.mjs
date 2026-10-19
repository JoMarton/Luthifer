/**
 * Serves build/site the way GitHub Pages will: under /Luthifer/, with the
 * site's 404.html (status 404) for unknown paths.
 *
 *   npm run serve:site   → http://localhost:4173/Luthifer/app/
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'build/site');
const BASE = '/Luthifer';
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function send(res, status, file) {
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) {
    res.writeHead(302, { Location: `${BASE}/app/` }).end();
    return;
  }
  let file = normalize(join(site, path.slice(BASE.length)));
  if (!file.startsWith(site)) {
    res.writeHead(400).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (existsSync(file)) send(res, 200, file);
  else send(res, 404, join(site, '404.html'));
}).listen(port, () => console.log(`Serving ${site} at http://localhost:${port}${BASE}/app/`));
