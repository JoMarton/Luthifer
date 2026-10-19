import { IN_TO_MM, formatLength, parseLength, toInches } from '@/shared/units';
import { breakdown, computeSlots, type NutInput } from '@/tools/nut/spacing';
import { formatGauge, getSet, parseGauge, resizeGauges } from '@/tools/nut/stringSets';

const GAUGES_10_46 = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01];

const worked: NutInput = {
  width: 1.6875,
  bassOffset: 0.125,
  trebleOffset: 0.125,
  gauges: GAUGES_10_46,
};

function slotsOf(input: NutInput) {
  const r = computeSlots(input);
  if (!r.ok) throw new Error(r.errors.join('; '));
  return r;
}

describe('computeSlots — worked example (1 11/16", 0.125" offsets, 10–46)', () => {
  const r = slotsOf(worked);

  it('computes the span and equal gap', () => {
    expect(r.span).toBeCloseTo(1.4375, 9);
    expect(r.gap).toBeCloseTo(0.2635, 9);
  });

  it('places every slot center', () => {
    const expected = [0.125, 0.4295, 0.724, 1.009, 1.2875, 1.5625];
    r.slots.forEach((s, i) => expect(s.fromBass).toBeCloseTo(expected[i], 6));
  });

  it('numbers strings with 6 on the bass side', () => {
    expect(r.slots.map((s) => s.stringNumber)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it('reports distance from the treble edge', () => {
    expect(r.slots[0].fromTreble).toBeCloseTo(1.5625, 9);
    expect(r.slots[5].fromTreble).toBeCloseTo(0.125, 9);
  });

  it('matches the mm values', () => {
    const mm = [3.175, 10.909, 18.39, 25.629, 32.703, 39.688];
    r.slots.forEach((s, i) => expect(s.fromBass * IN_TO_MM).toBeCloseTo(mm[i], 2));
    expect(r.gap * IN_TO_MM).toBeCloseTo(6.693, 2);
  });

  it('gives the same result when entered in mm', () => {
    const fromMm = slotsOf({
      ...worked,
      width: toInches(42.8625, 'mm'),
      bassOffset: toInches(3.175, 'mm'),
      trebleOffset: toInches(3.175, 'mm'),
    });
    fromMm.slots.forEach((s, i) => expect(s.fromBass).toBeCloseTo(r.slots[i].fromBass, 9));
  });
});

describe('breakdown — shows the working of the worked example', () => {
  it('matches the hand calculation', () => {
    const b = breakdown(worked)!;
    expect(b.span).toBeCloseTo(1.4375, 9);
    expect(b.gaugeSum).toBeCloseTo(0.148, 9);
    expect(b.outerHalves).toBeCloseTo(0.028, 9);
    expect(b.stringsInSpan).toBeCloseTo(0.12, 9);
    expect(b.totalAir).toBeCloseTo(1.3175, 9);
    expect(b.gap).toBeCloseTo(0.2635, 9);
    expect(b.steps[0]).toEqual({
      stringNumber: 5,
      previous: 0.125,
      halfPair: expect.closeTo(0.041, 9),
      x: expect.closeTo(0.4295, 9),
    });
    for (const step of b.steps) {
      expect(step.previous + step.halfPair + b.gap).toBeCloseTo(step.x, 9);
    }
  });

  it('is null when the input is invalid', () => {
    expect(breakdown({ ...worked, width: 0 })).toBeNull();
  });
});

describe('computeSlots — invariants', () => {
  // Deterministic pseudo-random generator so failures are reproducible.
  let seed = 42;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  it('holds for random inputs: last slot at W − b, all air gaps equal', () => {
    for (let t = 0; t < 500; t++) {
      const n = 2 + Math.floor(rand() * 11);
      const gauges = Array.from({ length: n }, () => 0.008 + rand() * 0.1);
      const width = 1.5 + rand() * 1.5;
      const input = {
        width,
        bassOffset: gauges[0] / 2 + rand() * 0.15,
        trebleOffset: gauges[n - 1] / 2 + rand() * 0.15,
        gauges,
      };
      const r = computeSlots(input);
      if (!r.ok) continue;

      expect(r.slots[n - 1].fromBass).toBeCloseTo(width - input.trebleOffset, 9);
      for (let i = 0; i < n - 1; i++) {
        const air = r.slots[i + 1].fromBass - r.slots[i].fromBass - (gauges[i] + gauges[i + 1]) / 2;
        expect(air).toBeCloseTo(r.gap, 9);
      }
    }
  });

  it('reduces to equal center spacing when all gauges are equal', () => {
    const r = slotsOf({
      width: 1.75,
      bassOffset: 0.15,
      trebleOffset: 0.15,
      gauges: Array(6).fill(0.02),
    });
    const step = (1.75 - 0.3) / 5;
    r.slots.forEach((s, i) => expect(s.fromBass).toBeCloseTo(0.15 + i * step, 9));
  });
});

describe('computeSlots — validation', () => {
  it('rejects strings that do not fit', () => {
    // S = 0.1, G = 0.1 − 0.148 + 0.028 = −0.02
    const r = computeSlots({
      width: 0.3,
      bassOffset: 0.1,
      trebleOffset: 0.1,
      gauges: GAUGES_10_46,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/don't fit/);
  });

  it('rejects an offset smaller than half the string', () => {
    const r = computeSlots({ ...worked, bassOffset: 0.02 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/Bass offset/);
  });

  it('rejects offsets wider than the nut', () => {
    expect(computeSlots({ ...worked, bassOffset: 1, trebleOffset: 1 }).ok).toBe(false);
  });

  it('rejects a zero gauge and fewer than 2 strings', () => {
    expect(computeSlots({ ...worked, gauges: [0.046, 0, 0.01] }).ok).toBe(false);
    expect(computeSlots({ ...worked, gauges: [0.046] }).ok).toBe(false);
  });
});

describe('units', () => {
  it('converts and formats', () => {
    expect(formatLength(0.125, 'mm', 3)).toBe('3.175 mm');
    expect(formatLength(0.125, 'in')).toBe('0.1250"');
    expect(toInches(25.4, 'mm')).toBe(1);
    expect(formatLength(0.125, 'mm')).toBe('3.18 mm');
    expect(formatLength(1.6875, 'mm')).toBe('42.86 mm');
  });

  it('parses decimals and fractions', () => {
    expect(parseLength('1 11/16')).toBeCloseTo(1.6875, 9);
    expect(parseLength('1-11/16"')).toBeCloseTo(1.6875, 9);
    expect(parseLength('1/8')).toBe(0.125);
    expect(parseLength('.125')).toBe(0.125);
    expect(parseLength('43,0')).toBe(43);
    expect(parseLength('abc')).toBeNaN();
    expect(parseLength('')).toBeNaN();
  });
});

describe('string sets', () => {
  it('parses and formats gauges', () => {
    expect(parseGauge('46')).toBe(0.046);
    expect(parseGauge('.046')).toBe(0.046);
    expect(parseGauge('9.5')).toBeCloseTo(0.0095, 9);
    expect(formatGauge(0.046)).toBe('46');
    expect(formatGauge(0.0095)).toBe('9.5');
  });

  it('resizes from the bass side', () => {
    expect(resizeGauges(GAUGES_10_46, 5)).toEqual(GAUGES_10_46.slice(1));
    const seven = resizeGauges(GAUGES_10_46, 7);
    expect(seven).toHaveLength(7);
    expect(seven.slice(1)).toEqual(GAUGES_10_46);
    expect(seven[0]).toBeGreaterThan(0.046);
  });

  it('has presets ordered bass → treble (first string heaviest, except classical)', () => {
    expect(getSet('e-10-46')!.gauges).toEqual(GAUGES_10_46);
  });
});
