import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Fonts, Palette } from '@/constants/theme';
import { bevel, Dialog, Lcd, T } from '@/shared/components/retro';
import { formatLength, type LengthUnit } from '@/shared/units';
import { GUITAR_WIDTHS } from '@/tools/nut/nutWidths';
import type { Breakdown } from '@/tools/nut/spacing';

/* ---------- How to measure the offsets ---------- */

export function OffsetHelpDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Dialog visible={visible} title="HOW TO MEASURE" onClose={onClose}>
      <Lcd style={styles.figure}>
        <OffsetFigure />
      </Lcd>

      <Section title="What the offset is">
        The distance from the edge of the nut to the <B>center</B> of the outer string&apos;s slot.
        The bass offset is measured on the low-string side, the treble offset on the high-string
        side.
      </Section>

      <Section title="How much to leave">
        Enough that the outer strings can be bent and played hard without slipping off the edge of
        the fretboard. Too little and the string rolls off the edge; too much and you waste playing
        room, so the strings feel cramped.
      </Section>

      <Section title="Common starting points">
        About 1/8&quot; (0.125&quot;, 3.2 mm) on each side for electric and steel-string guitars.
        Many builders leave a little more on the treble side, around 0.135&quot;–0.140&quot;
        (3.4–3.6 mm), because the high string is the one most likely to slip off during bends.
      </Section>

      <Section title="Measuring">
        Measure from the edge of the fretboard at the nut, not from the end of an overhanging nut
        blank. When copying an old nut, measure from the edge to the near side of the outer string
        and add half the string&apos;s gauge to get to its center. Before gluing, check the outer
        strings up the neck too: they should still sit comfortably inside the fretboard edge at the
        higher frets.
      </Section>
    </Dialog>
  );
}

function OffsetFigure() {
  const c = Palette.lcd;
  return (
    <Svg
      width="100%"
      height={112}
      viewBox="0 0 300 112"
      role="img"
      aria-label="Offset measured from the nut edge to the center of the outer string">
      <Rect x={20} y={40} width={260} height={40} fill="none" stroke={c} strokeWidth={2} />
      <Circle cx={74} cy={44} r={9} fill={c} />
      <Circle cx={226} cy={44} r={4} fill={c} />
      <G stroke={c} strokeWidth={1} opacity={0.5} strokeDasharray="3,3">
        <Line x1={74} y1={14} x2={74} y2={100} />
        <Line x1={226} y1={14} x2={226} y2={100} />
      </G>
      <G stroke={c} strokeWidth={1.5} fill="none">
        <Line x1={20} y1={96} x2={74} y2={96} />
        <Polyline points="26,91 20,96 26,101" />
        <Polyline points="68,91 74,96 68,101" />
        <Line x1={226} y1={96} x2={280} y2={96} />
        <Polyline points="232,91 226,96 232,101" />
        <Polyline points="274,91 280,96 274,101" />
      </G>
      <G fontFamily={Fonts.lcd} fontSize={16} fill={c}>
        <SvgText x={20} y={24}>
          BASS OFFSET
        </SvgText>
        <SvgText x={280} y={24} textAnchor="end">
          TREBLE OFFSET
        </SvgText>
        <SvgText x={86} y={70}>
          edge → center
        </SvgText>
      </G>
    </Svg>
  );
}

/* ---------- Nut widths by guitar ---------- */

export function GuitarWidthDialog({
  visible,
  current,
  unit,
  onPick,
  onClose,
}: {
  visible: boolean;
  current: number;
  unit: LengthUnit;
  onPick: (inches: number) => void;
  onClose: () => void;
}) {
  return (
    <Dialog visible={visible} title="NUT WIDTH BY GUITAR" onClose={onClose}>
      <T v="hint">
        Typical factory widths. They vary by year and model, so measure your neck before cutting.
      </T>
      <View style={[styles.list, bevel.in]}>
        {GUITAR_WIDTHS.map((g) => {
          const active = Math.abs(g.inches - current) < 1e-6;
          return (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                onPick(g.inches);
                onClose();
              }}
              style={({ pressed }) => [styles.row, (active || pressed) && styles.rowActive]}>
              <View style={styles.rowText}>
                <T v="display" style={styles.brand}>
                  {g.brand.toUpperCase()}
                </T>
                <T v="bodyBold">{g.model}</T>
              </View>
              <View style={styles.rowValues}>
                <T v="lcd" style={styles.primary}>
                  {formatLength(g.inches, unit, unit === 'in' ? 3 : 1)}
                </T>
                <T v="lcd" style={styles.secondary}>
                  {formatLength(g.inches, unit === 'in' ? 'mm' : 'in', unit === 'in' ? 1 : 3)}
                </T>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Dialog>
  );
}

/* ---------- How it was calculated ---------- */

export function CalculationDialog({
  visible,
  onClose,
  breakdown: b,
  width,
  bassOffset,
  trebleOffset,
  gauges,
  unit,
}: {
  visible: boolean;
  onClose: () => void;
  breakdown: Breakdown;
  width: number;
  bassOffset: number;
  trebleOffset: number;
  gauges: number[];
  unit: LengthUnit;
}) {
  const f = (v: number) => formatLength(v, unit, undefined, false);
  const n = gauges.length;
  const unitName = unit === 'in' ? 'inches' : 'millimeters';
  const lastX = b.steps.length ? b.steps[b.steps.length - 1].x : bassOffset;

  return (
    <Dialog visible={visible} title="HOW IT WAS CALCULATED" onClose={onClose}>
      <T>
        Every pair of neighbouring strings gets the <B>same air gap</B> between them, edge to edge.
        Spacing the slot centers evenly instead would crowd the thick bass strings, because their
        width eats into the space.
      </T>
      <T v="hint">All values in {unitName}, using your current inputs.</T>

      <Step n={1} title="Span between the outer slot centers">
        <Calc>S = W − a − b</Calc>
        <Calc>
          = {f(width)} − {f(bassOffset)} − {f(trebleOffset)} = {f(b.span)}
        </Calc>
      </Step>

      <Step n={2} title="String material inside that span">
        Only half of each outer string lies inside the span; the inner strings are fully inside.
        <Calc>Σd − (d_bass + d_treble)/2</Calc>
        <Calc>
          = {f(b.gaugeSum)} − {f(b.outerHalves)} = {f(b.stringsInSpan)}
        </Calc>
      </Step>

      <Step n={3} title="Air left between the strings">
        <Calc>
          G = {f(b.span)} − {f(b.stringsInSpan)} = {f(b.totalAir)}
        </Calc>
      </Step>

      <Step n={4} title={`Split it into ${n - 1} equal gaps`}>
        <Calc>
          g = {f(b.totalAir)} / {n - 1} = {f(b.gap)}
        </Calc>
      </Step>

      <Step n={5} title="Place each slot">
        Start at the bass offset, then step by half of each neighbouring pair plus the gap.
        <Calc>x = previous + (d_prev + d)/2 + g</Calc>
        <Lcd style={styles.steps}>
          <T v="lcd" style={styles.stepLine}>
            {n}: {f(bassOffset)} (= a)
          </T>
          {b.steps.map((s) => (
            <T key={s.stringNumber} v="lcd" style={styles.stepLine}>
              {s.stringNumber}: {f(s.previous)} + {f(s.halfPair)} + {f(b.gap)} = {f(s.x)}
            </T>
          ))}
        </Lcd>
      </Step>

      <Step n={6} title="Check">
        The last slot must land exactly on the treble offset.
        <Calc>
          {f(lastX)} = {f(width)} − {f(trebleOffset)} ✓
        </Calc>
      </Step>
    </Dialog>
  );
}

/* ---------- Bits ---------- */

function B({ children }: { children: string }) {
  return <T v="bodyBold">{children}</T>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <T v="display" accessibilityRole="header" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </T>
      <T style={styles.paragraph}>{children}</T>
    </View>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  const parts = Array.isArray(children) ? children : [children];
  return (
    <View style={styles.section}>
      <T v="display" accessibilityRole="header" style={styles.sectionTitle}>
        {n}. {title.toUpperCase()}
      </T>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <T key={i} style={styles.paragraph}>
            {p}
          </T>
        ) : (
          <View key={i}>{p}</View>
        ),
      )}
    </View>
  );
}

function Calc({ children }: { children: ReactNode }) {
  return (
    <T v="lcd" style={styles.calc}>
      {children}
    </T>
  );
}

const styles = StyleSheet.create({
  figure: { paddingVertical: 8, paddingHorizontal: 4 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 11, color: Palette.rust, letterSpacing: 0.5 },
  paragraph: { fontSize: 15, lineHeight: 21 },
  calc: { fontSize: 20, lineHeight: 22, color: Palette.ink },
  steps: { paddingVertical: 6, paddingHorizontal: 8, gap: 2, marginTop: 4 },
  stepLine: { fontSize: 18, lineHeight: 20, color: Palette.lcd },
  list: { backgroundColor: Palette.field },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.rowLine,
  },
  rowActive: { backgroundColor: Palette.zebra },
  rowText: { flex: 1, gap: 1 },
  brand: { fontSize: 9, color: Palette.rust },
  rowValues: { alignItems: 'flex-end' },
  primary: { fontSize: 22, lineHeight: 22 },
  secondary: { fontSize: 16, lineHeight: 16, color: Palette.inkSoft },
});
