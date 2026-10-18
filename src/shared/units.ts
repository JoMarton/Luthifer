export type LengthUnit = 'in' | 'mm';

export const IN_TO_MM = 25.4;

export function toInches(value: number, unit: LengthUnit): number {
  return unit === 'mm' ? value / IN_TO_MM : value;
}

export function fromInches(valueIn: number, unit: LengthUnit): number {
  return unit === 'mm' ? valueIn * IN_TO_MM : valueIn;
}

/** Round half away from zero, ignoring float noise (3.1750000000000003 or 3.17499999 → 3.18). */
export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return (Math.sign(value) * Math.round(Math.abs(value) * f + 1e-6)) / f;
}

export const DEFAULT_DECIMALS: Record<LengthUnit, number> = { in: 4, mm: 2 };

export function formatLength(
  valueIn: number,
  unit: LengthUnit,
  decimals = DEFAULT_DECIMALS[unit],
  withSuffix = true,
): string {
  const text = roundTo(fromInches(valueIn, unit), decimals).toFixed(decimals);
  if (!withSuffix) return text;
  return unit === 'in' ? `${text}"` : `${text} mm`;
}

/**
 * Parse a user-typed length. Accepts decimals ("1.6875", ".125", "43,0")
 * and, for inches, fractions ("11/16", "1 11/16", "1-11/16").
 * Returns NaN when the text is not a number.
 */
export function parseLength(text: string): number {
  const t = text
    .trim()
    .replace(',', '.')
    .replace(/["″]|in$|mm$/i, '')
    .trim();
  if (t === '') return NaN;

  const mixed = /^(\d+)[\s-]+(\d+)\s*\/\s*(\d+)$/.exec(t);
  if (mixed) {
    const den = Number(mixed[3]);
    return den === 0 ? NaN : Number(mixed[1]) + Number(mixed[2]) / den;
  }

  const frac = /^(\d+)\s*\/\s*(\d+)$/.exec(t);
  if (frac) {
    const den = Number(frac[2]);
    return den === 0 ? NaN : Number(frac[1]) / den;
  }

  return /^\d*\.?\d+$|^\d+\.$/.test(t) ? Number(t) : NaN;
}

/** Display a stored inch value for editing in the given unit, trimming trailing zeros. */
export function toEditText(valueIn: number, unit: LengthUnit): string {
  const decimals = unit === 'in' ? 4 : 3;
  return String(roundTo(fromInches(valueIn, unit), decimals));
}
