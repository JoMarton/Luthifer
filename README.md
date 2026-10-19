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
npm test            # spacing math tests
npm run typecheck
npx eslint .
npm run icons       # re-render icon, adaptive icon, splash and favicon from scripts/icon-art.mjs
```

## Releasing

- Bundle ID / package: `com.jomarton.luthifer` (iOS and Android).
- Builds: `npx eas-cli@latest build --profile production --platform ios|android`, then
  `npx eas-cli@latest submit`. `preview` makes internal test builds (Android APK).
- Store pages: `docs/` is a small static site (support page and privacy policy) for GitHub Pages —
  enable Pages from the `main` branch, `/docs` folder. URLs:
  - Support: https://jomarton.github.io/Luthifer/
  - Privacy policy: https://jomarton.github.io/Luthifer/privacy.html

## Layout

- `src/app/` — routes (home, `nut/`)
- `src/tools.ts` — tool registry shown on the home screen
- `src/shared/` — units and inputs shared by all tools
- `src/tools/nut/` — nut calculator: `spacing.ts` (math), string sets, diagram, table, store

To add a tool: create `src/tools/<id>/`, add routes under `src/app/<id>/`, and add an entry to `src/tools.ts`.
