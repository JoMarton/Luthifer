/**
 * Nut slot spacing with an EQUAL AIR GAP between neighbouring strings.
 *
 * All values are in inches. Positions are measured from the bass edge (x = 0).
 * Gauges are ordered bass → treble (gauges[0] is the lowest string).
 *
 *   S = W − a − b                      span between the outer slot centers
 *   G = S − Σd + (d₁ + dₙ)/2           total air inside that span
 *   g = G / (n − 1)                    equal edge-to-edge gap
 *   x₁ = a,  xᵢ = xᵢ₋₁ + (dᵢ₋₁ + dᵢ)/2 + g
 */

export type NutInput = {
  /** Nut width, inches. */
  width: number;
  /** Bass edge → center of the lowest string, inches. */
  bassOffset: number;
  /** Treble edge → center of the highest string, inches. */
  trebleOffset: number;
  /** String diameters, inches, bass → treble. */
  gauges: number[];
};

export type Slot = {
  /** Index from the bass side, 0-based. */
  index: number;
  /** Conventional string number: 1 = highest (treble) string, n = lowest. */
  stringNumber: number;
  gauge: number;
  /** Slot center from the bass edge. */
  fromBass: number;
  /** Slot center from the treble edge. */
  fromTreble: number;
  /** Center-to-center distance to the next string toward treble (null for the last). */
  toNext: number | null;
};

export type NutResult =
  { ok: true; slots: Slot[]; gap: number; span: number } | { ok: false; errors: string[] };

const EPSILON = 1e-9;

export function validate({ width, bassOffset, trebleOffset, gauges }: NutInput): string[] {
  const errors: string[] = [];
  const isNum = (v: number) => Number.isFinite(v);

  if (!isNum(width) || width <= 0) errors.push('Nut width must be greater than 0.');
  if (!isNum(bassOffset) || bassOffset < 0) errors.push('Bass offset must be 0 or more.');
  if (!isNum(trebleOffset) || trebleOffset < 0) errors.push('Treble offset must be 0 or more.');
  if (gauges.length < 2) errors.push('At least 2 strings are needed.');
  if (gauges.some((d) => !isNum(d) || d <= 0))
    errors.push('Every string gauge must be greater than 0.');
  if (errors.length) return errors;

  const n = gauges.length;
  if (bassOffset < gauges[0] / 2 - EPSILON) {
    errors.push('Bass offset is smaller than half the low string — it would hang off the edge.');
  }
  if (trebleOffset < gauges[n - 1] / 2 - EPSILON) {
    errors.push('Treble offset is smaller than half the high string — it would hang off the edge.');
  }

  const span = width - bassOffset - trebleOffset;
  if (span <= 0) {
    errors.push('Offsets add up to more than the nut width.');
  } else if (airGap(span, gauges) <= 0) {
    errors.push("The strings don't fit between the offsets.");
  }
  return errors;
}

function airGap(span: number, gauges: number[]): number {
  const n = gauges.length;
  const sum = gauges.reduce((acc, d) => acc + d, 0);
  const totalAir = span - sum + (gauges[0] + gauges[n - 1]) / 2;
  return totalAir / (n - 1);
}

export function computeSlots(input: NutInput): NutResult {
  const errors = validate(input);
  if (errors.length) return { ok: false, errors };

  const { width, bassOffset, trebleOffset, gauges } = input;
  const n = gauges.length;
  const span = width - bassOffset - trebleOffset;
  const gap = airGap(span, gauges);

  const centers = [bassOffset];
  for (let i = 1; i < n; i++) {
    centers.push(centers[i - 1] + (gauges[i - 1] + gauges[i]) / 2 + gap);
  }

  const last = centers[n - 1];
  if (Math.abs(last - (width - trebleOffset)) > EPSILON) {
    return {
      ok: false,
      errors: ['Internal check failed: last slot does not land on the treble offset.'],
    };
  }

  const slots: Slot[] = centers.map((x, i) => ({
    index: i,
    stringNumber: n - i,
    gauge: gauges[i],
    fromBass: x,
    fromTreble: width - x,
    toNext: i < n - 1 ? centers[i + 1] - x : null,
  }));

  return { ok: true, slots, gap, span };
}

export type Breakdown = {
  span: number;
  gaugeSum: number;
  /** Half of each outer string: the part of them that lies inside the span. */
  outerHalves: number;
  /** String material inside the span: Σd − (d₁ + dₙ)/2. */
  stringsInSpan: number;
  totalAir: number;
  gap: number;
  /** One step per slot after the first: x = previous + (d_prev + d)/2 + g. */
  steps: { stringNumber: number; previous: number; halfPair: number; x: number }[];
};

/** Every intermediate value of the calculation, for showing the working. */
export function breakdown(input: NutInput): Breakdown | null {
  const result = computeSlots(input);
  if (!result.ok) return null;
  const { gauges } = input;
  const n = gauges.length;
  const gaugeSum = gauges.reduce((acc, d) => acc + d, 0);
  const outerHalves = (gauges[0] + gauges[n - 1]) / 2;
  const stringsInSpan = gaugeSum - outerHalves;
  return {
    span: result.span,
    gaugeSum,
    outerHalves,
    stringsInSpan,
    totalAir: result.span - stringsInSpan,
    gap: result.gap,
    steps: result.slots.slice(1).map((s, i) => ({
      stringNumber: s.stringNumber,
      previous: result.slots[i].fromBass,
      halfPair: (gauges[i] + gauges[i + 1]) / 2,
      x: s.fromBass,
    })),
  };
}
