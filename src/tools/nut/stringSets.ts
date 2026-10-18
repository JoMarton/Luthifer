export type StringSet = {
  id: string;
  name: string;
  /** Diameters in inches, bass → treble. */
  gauges: number[];
};

export const STRING_SETS: StringSet[] = [
  { id: 'e-9-42', name: 'Electric 9–42', gauges: [0.042, 0.032, 0.024, 0.016, 0.011, 0.009] },
  { id: 'e-10-46', name: 'Electric 10–46', gauges: [0.046, 0.036, 0.026, 0.017, 0.013, 0.01] },
  { id: 'e-11-49', name: 'Electric 11–49', gauges: [0.049, 0.038, 0.028, 0.018, 0.014, 0.011] },
  {
    id: 'e7-10-56',
    name: 'Electric 7-string 10–56',
    gauges: [0.056, 0.046, 0.036, 0.026, 0.017, 0.013, 0.01],
  },
  { id: 'a-12-53', name: 'Acoustic 12–53', gauges: [0.053, 0.042, 0.032, 0.024, 0.016, 0.012] },
  { id: 'a-13-56', name: 'Acoustic 13–56', gauges: [0.056, 0.045, 0.035, 0.026, 0.017, 0.013] },
  {
    id: 'c-normal',
    name: 'Classical normal tension',
    gauges: [0.043, 0.035, 0.03, 0.041, 0.032, 0.028],
  },
  { id: 'b4-45-105', name: 'Bass 4-string 45–105', gauges: [0.105, 0.085, 0.065, 0.045] },
  { id: 'b5-45-130', name: 'Bass 5-string 45–130', gauges: [0.13, 0.105, 0.085, 0.065, 0.045] },
];

export const DEFAULT_SET_ID = 'e-10-46';

export function getSet(id: string): StringSet | undefined {
  return STRING_SETS.find((s) => s.id === id);
}

/** The preferred preset for a string count, if there is one. */
export function defaultSetFor(count: number): StringSet | undefined {
  const preferred: Record<number, string> = {
    4: 'b4-45-105',
    5: 'b5-45-130',
    6: DEFAULT_SET_ID,
    7: 'e7-10-56',
  };
  return preferred[count] ? getSet(preferred[count]) : undefined;
}

/**
 * Resize a gauge list to `count` strings, keeping existing gauges and
 * adding new strings on the bass side (each a bit heavier than the last).
 * Removing strings drops them from the bass side.
 */
export function resizeGauges(gauges: number[], count: number): number[] {
  if (count <= gauges.length) return gauges.slice(gauges.length - count);
  const result = [...gauges];
  while (result.length < count) {
    const heaviest = result[0] ?? 0.046;
    result.unshift(Math.round(heaviest * 1.25 * 1000) / 1000);
  }
  return result;
}

/** Gauge in thousandths for display, e.g. 0.046 → "46", 0.0095 → "9.5". */
export function formatGauge(d: number): string {
  return String(Math.round(d * 10000) / 10);
}

/** Parse a gauge typed as thousandths ("46") or inches (".046", "0.046"). */
export function parseGauge(text: string): number {
  const t = text.trim();
  if (!/^\d*\.?\d+$|^\d+\.$/.test(t)) return NaN;
  const v = Number(t);
  return t.includes('.') && v < 1 ? v : v / 1000;
}
