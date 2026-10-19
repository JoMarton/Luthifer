# Luthifer

Luthier helper tools — an Expo (SDK 58) / React Native app.

## Tools

- **Nut Slot Calculator** — string slot positions on a nut with an **equal air gap between neighbouring strings** (edge to edge), not equal center spacing.

## Nut slot formula

All values in inches, measured from the bass edge. Gauges `d₁ … dₙ` ordered bass → treble.

```
S  = W − a − b                 span between outer slot centers
G  = S − Σd + (d₁ + dₙ)/2      total air inside the span
g  = G / (n − 1)               equal gap between strings
x₁ = a
xᵢ = xᵢ₋₁ + (dᵢ₋₁ + dᵢ)/2 + g
```

Example: W = 1 11/16", a = b = 0.125", 10–46 set → g = 0.2635", slots at
0.1250, 0.4295, 0.7240, 1.0090, 1.2875, 1.5625".

## Develop

```bash
npm install
npx expo start      # i = iOS simulator, w = web
npm test            # unit and screen tests
npm run typecheck
npx eslint .
npm run icons       # re-render icon, adaptive icon, splash and favicon from scripts/icon-art.mjs
```

## Releasing

- Bundle ID / package: `com.jomarton.luthifer` (iOS and Android).
- Builds: `npx eas-cli@latest build --profile production --platform ios|android`, then
  `npx eas-cli@latest submit`. `preview` makes internal test builds (Android APK).
- Website: GitHub Pages, deployed by CI from `main` (repo Settings → Pages → Source:
  **GitHub Actions**). The site is `docs/` plus the web app under `/app`:
  - Web app: https://jomarton.github.io/Luthifer/app/
  - Support: https://jomarton.github.io/Luthifer/
  - Privacy policy: https://jomarton.github.io/Luthifer/privacy.html

## Analytics

Anonymous usage data goes to PostHog (`src/shared/analytics.ts` for the apps,
`analytics.web.ts` for the website). Only three events are sent — `app_opened`, `tool_opened`
and `results_viewed` — and PostHog adds device, OS / browser and approximate location.
Users can turn it off on the home screen.

Set the project's public key in `.env` (committed, since it's a public client key, so local
builds, EAS builds and CI all pick it up):

```
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com   # or https://us.i.posthog.com
```

Analytics is off without a key, in development (`expo start`) and under Jest. The browser tests
intercept all PostHog requests, so test runs never reach real analytics.

## Web

```bash
npm run build:site   # expo export + docs/ → build/site (app under /app, 404.html for deep links)
npm run serve:site   # serve build/site like GitHub Pages: http://localhost:4173/Luthifer/app/
```

The app is served from `/Luthifer/app` (`experiments.baseUrl` in app.json). `public/` holds the
web page template, manifest and home-screen icons.

## Testing

- `npm test` — Jest: spacing math, units, string sets and the store, plus screen tests that
  render the home, calculator and string-set screens (React Native Testing Library).
- `npm run test:e2e` — Playwright browser tests against the production web build
  (`npm run build:site` first) in desktop Chrome, an Android phone and iPhone Safari (WebKit).
  First run: `npx playwright install chromium webkit`.
- CI (`.github/workflows/ci.yml`) runs typecheck, lint, Jest, then builds the site and runs the
  browser tests on every push; on `main` it deploys to GitHub Pages only if everything passes.

## Layout

- `src/app/` — routes (home, `nut/`)
- `src/tools.ts` — tool registry shown on the home screen
- `src/shared/` — units and inputs shared by all tools
- `src/tools/nut/` — nut calculator: `spacing.ts` (math), string sets, diagram, table, store

To add a tool: create `src/tools/<id>/`, add routes under `src/app/<id>/`, and add an entry to `src/tools.ts`.
