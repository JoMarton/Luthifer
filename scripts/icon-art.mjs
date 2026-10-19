/**
 * Luthifer's icon artwork, as SVG strings: a nut with six strings in
 * equal-gap slots on dark walnut, with an amber measuring line beneath.
 *
 * The slot positions are the app's own worked example (1 11/16" nut,
 * 1/8" offsets, 10–46 strings), so the icon shows the real spacing.
 */

const C = {
  wood: '#4A2C1A',
  maple: '#E9CFA0',
  bevelLight: '#FFF6E2',
  bevelDark: '#6E4B2E',
  shadow: '#24130A',
  slot: '#3A2212',
  amber: '#FFB347',
  amberDark: '#C47A1C',
  cream: '#F6E2B8',
};

// Worked example: centers from the bass edge (inches) and gauges.
const NUT_IN = 1.6875;
const CENTERS = [0.125, 0.4295, 0.724, 1.009, 1.2875, 1.5625];
const GAUGES = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01];

function woodGrain(id, size) {
  return `
  <defs>
    <pattern id="${id}a" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(1)">
      <rect x="0" width="5" height="40" fill="rgba(0,0,0,0.16)"/>
      <rect x="18" width="5" height="40" fill="rgba(255,214,160,0.07)"/>
    </pattern>
    <pattern id="${id}b" width="70" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-1)">
      <rect x="0" width="3" height="40" fill="rgba(0,0,0,0.11)"/>
    </pattern>
    <radialGradient id="${id}v" cx="50%" cy="45%" r="70%">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${C.wood}"/>
  <rect width="${size}" height="${size}" fill="url(#${id}a)"/>
  <rect width="${size}" height="${size}" fill="url(#${id}b)"/>
  <rect width="${size}" height="${size}" fill="url(#${id}v)"/>`;
}

/**
 * The mark on a 1024 canvas: strings from `stringTop`, the nut, and the
 * measuring line. `mono` draws everything in one color (Android themed icons).
 */
function mark({ stringTop = 0, mono = null } = {}) {
  const x0 = 152;
  const w = 720;
  const nutTop = 470;
  const nutH = 200;
  const bevel = 14;
  const scale = w / NUT_IN;
  const xs = CENTERS.map((c) => x0 + c * scale);
  // Real proportions, thickened so the thin strings survive at small sizes.
  const widths = GAUGES.map((g) => Math.max(7, g * scale * 1.45));
  const slotDepth = 34;
  const fill = (c) => mono ?? c;

  const strings = xs
    .map((x, i) => {
      const sw = widths[i];
      return `<rect x="${(x - sw / 2).toFixed(1)}" y="${stringTop}" width="${sw.toFixed(1)}" height="${nutTop + slotDepth - sw / 2 - stringTop}" fill="${fill(C.amber)}"/>
      ${mono ? '' : `<rect x="${(x - sw / 2).toFixed(1)}" y="${stringTop}" width="${(sw * 0.35).toFixed(1)}" height="${nutTop + slotDepth - sw / 2 - stringTop}" fill="#FFE0A6" opacity="0.55"/>`}`;
    })
    .join('\n');

  const slots = mono
    ? ''
    : xs
        .map((x, i) => {
          const sw = widths[i] + 8;
          return `<rect x="${(x - sw / 2).toFixed(1)}" y="${nutTop}" width="${sw.toFixed(1)}" height="${slotDepth}" fill="${C.slot}"/>`;
        })
        .join('\n');

  const nut = `<rect x="${x0 + 14}" y="${nutTop + 14}" width="${w}" height="${nutH}" fill="${C.shadow}"/>
       <rect x="${x0}" y="${nutTop}" width="${w}" height="${nutH}" fill="${C.maple}"/>
       <polygon points="${x0},${nutTop} ${x0 + w},${nutTop} ${x0 + w - bevel},${nutTop + bevel} ${x0 + bevel},${nutTop + bevel} ${x0 + bevel},${nutTop + nutH - bevel} ${x0},${nutTop + nutH}" fill="${C.bevelLight}"/>
       <polygon points="${x0 + w},${nutTop} ${x0 + w},${nutTop + nutH} ${x0},${nutTop + nutH} ${x0 + bevel},${nutTop + nutH - bevel} ${x0 + w - bevel},${nutTop + nutH - bevel} ${x0 + w - bevel},${nutTop + bevel}" fill="${C.bevelDark}"/>
       <rect x="${x0 + bevel}" y="${nutTop + bevel}" width="${w - bevel * 2}" height="${nutH - bevel * 2}" fill="${C.maple}"/>`;

  const dimY = 790;
  const dim = `
    <g fill="${fill(C.amber)}">
      <rect x="${x0}" y="${dimY - 5}" width="${w}" height="10"/>
      <rect x="${x0}" y="${dimY - 40}" width="10" height="80"/>
      <rect x="${x0 + w - 10}" y="${dimY - 40}" width="10" height="80"/>
      <polygon points="${x0 + 10},${dimY} ${x0 + 54},${dimY - 26} ${x0 + 54},${dimY + 26}"/>
      <polygon points="${x0 + w - 10},${dimY} ${x0 + w - 54},${dimY - 26} ${x0 + w - 54},${dimY + 26}"/>
    </g>`;

  // In mono the slots are knocked out of the nut with a mask.
  if (mono) {
    return `
    <defs>
      <mask id="slots">
        <rect width="1024" height="1024" fill="#fff"/>
        ${xs
          .map((x, i) => {
            const sw = widths[i] + 16;
            return `<rect x="${(x - sw / 2).toFixed(1)}" y="${nutTop - 1}" width="${sw.toFixed(1)}" height="${slotDepth + 8}" fill="#000"/>`;
          })
          .join('\n')}
      </mask>
    </defs>
    <rect x="${x0}" y="${nutTop}" width="${w}" height="${nutH}" fill="${mono}" mask="url(#slots)"/>
    ${xs
      .map((x, i) => {
        const sw = widths[i];
        return `<rect x="${(x - sw / 2).toFixed(1)}" y="${stringTop}" width="${sw.toFixed(1)}" height="${nutTop + slotDepth - 6 - stringTop}" fill="${mono}"/>`;
      })
      .join('\n')}
    ${dim}`;
  }

  return `${nut}\n${slots}\n${strings}\n${dim}`;
}

/** App Store / main icon: full-bleed walnut, strings run off the top edge. */
export function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${woodGrain('g', 1024)}
  ${mark()}
</svg>`;
}

/** Android adaptive background layer: walnut only. */
export function adaptiveBackgroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${woodGrain('g', 1024)}
</svg>`;
}

/**
 * Android adaptive foreground: the mark shrunk into the 66% safe zone so
 * circular and squircle launcher masks never clip it.
 */
export function adaptiveForegroundSvg(mono = null) {
  // The mark spans x 152–872, y 150–830; scale it so its corners stay inside
  // the 66% circle (≈676 px) that launcher masks always keep, and center it.
  const s = 0.64;
  const tx = 512 - 512 * s;
  const ty = 512 - 490 * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(${tx} ${ty}) scale(${s})">
    ${mark({ stringTop: 150, mono })}
  </g>
</svg>`;
}

/** Web "maskable" icon: walnut plus the mark kept inside the 80% safe circle. */
export function maskableSvg() {
  const s = 0.64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${woodGrain('m', 1024)}
  <g transform="translate(${512 - 512 * s} ${512 - 490 * s}) scale(${s})">
    ${mark({ stringTop: 150 })}
  </g>
</svg>`;
}

/** Splash: the mark plus the LUTHIFER wordmark on transparent. */
export function splashSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(112 40) scale(0.78)">
    ${mark({ stringTop: 140 })}
  </g>
  <text x="512" y="900" text-anchor="middle" font-family="Silkscreen" font-weight="700" font-size="128" letter-spacing="10" fill="${C.shadow}">LUTHIFER</text>
  <text x="506" y="894" text-anchor="middle" font-family="Silkscreen" font-weight="700" font-size="128" letter-spacing="10" fill="${C.cream}">LUTHIFER</text>
</svg>`;
}

export const SPLASH_BACKGROUND = C.wood;
