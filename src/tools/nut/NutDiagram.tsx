import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatLength, type LengthUnit } from '@/shared/units';
import type { Slot } from '@/tools/nut/spacing';

const PAD = 14;
const TOP_LABEL_Y = 14;
const NUT_TOP = 52;
const NUT_HEIGHT = 46;
const NUT_BOTTOM = NUT_TOP + NUT_HEIGHT;
const ROW_1 = NUT_BOTTOM + 18;
const ROW_2 = NUT_BOTTOM + 32;

/**
 * The nut seen end-on: each string drawn to scale as a circle in its slot,
 * with its distance from the bass edge below. The bass side is always labelled.
 */
export function NutDiagram({
  width,
  slots,
  unit,
  flipped,
}: {
  width: number;
  slots: Slot[];
  unit: LengthUnit;
  flipped: boolean;
}) {
  const theme = useTheme();
  const [layoutWidth, setLayoutWidth] = useState(0);

  const inner = Math.max(0, layoutWidth - PAD * 2);
  const scale = inner / width;
  const x = (pos: number) => PAD + (flipped ? width - pos : pos) * scale;

  const bassX = x(0);
  const trebleX = x(width);
  const minSpacing = Math.min(
    ...slots
      .slice(1)
      .map((s, i) => x(s.fromBass) - x(slots[i].fromBass))
      .map(Math.abs),
  );
  const stagger = minSpacing < 46;
  const height = (stagger ? ROW_2 : ROW_1) + 22;

  return (
    <View onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {layoutWidth > 0 && (
        <Svg width={layoutWidth} height={height} accessibilityLabel="Nut diagram">
          {/* Side labels */}
          <SvgText
            fontFamily={Fonts.sans}
            x={bassX}
            y={TOP_LABEL_Y}
            fill={theme.bass}
            fontSize={12}
            fontWeight="700"
            textAnchor={flipped ? 'end' : 'start'}>
            {flipped ? 'BASS SIDE ▶' : '◀ BASS SIDE'}
          </SvgText>
          <SvgText
            fontFamily={Fonts.sans}
            x={trebleX}
            y={TOP_LABEL_Y}
            fill={theme.textSecondary}
            fontSize={12}
            fontWeight="600"
            textAnchor={flipped ? 'start' : 'end'}>
            {flipped ? '◀ TREBLE' : 'TREBLE ▶'}
          </SvgText>

          {/* Nut body */}
          <Rect
            x={PAD}
            y={NUT_TOP}
            width={inner}
            height={NUT_HEIGHT}
            rx={3}
            fill={theme.nut}
            stroke={theme.nutStroke}
            strokeWidth={1}
          />
          {/* Bass edge band */}
          <Rect
            x={flipped ? PAD + inner - 6 : PAD}
            y={NUT_TOP}
            width={6}
            height={NUT_HEIGHT}
            fill={theme.bass}
          />

          {slots.map((s, i) => {
            const cx = x(s.fromBass);
            const r = Math.max(1.5, (s.gauge / 2) * scale);
            const isBass = i === 0;
            const labelY = stagger && i % 2 === 1 ? ROW_2 : ROW_1;
            return (
              <G key={s.index}>
                {/* Slot centerline */}
                <Line
                  x1={cx}
                  y1={NUT_TOP - r - 4}
                  x2={cx}
                  y2={labelY - 11}
                  stroke={isBass ? theme.bass : theme.textSecondary}
                  strokeWidth={0.75}
                  strokeDasharray="3,2"
                />
                {/* Slot cut into the nut */}
                <Path
                  d={`M ${cx - r} ${NUT_TOP} L ${cx - r} ${NUT_TOP + r * 0.6} A ${r} ${r} 0 0 0 ${cx + r} ${NUT_TOP + r * 0.6} L ${cx + r} ${NUT_TOP} Z`}
                  fill={theme.background}
                  opacity={0.6}
                />
                <Circle
                  cx={cx}
                  cy={NUT_TOP + r * 0.1}
                  r={r}
                  fill={isBass ? theme.bass : theme.string}
                />
                {/* String number */}
                <SvgText
                  fontFamily={Fonts.sans}
                  x={cx}
                  y={NUT_TOP - r - 8}
                  fill={isBass ? theme.bass : theme.text}
                  fontSize={11}
                  fontWeight="700"
                  textAnchor="middle">
                  {s.stringNumber}
                </SvgText>
                {/* Distance from bass edge */}
                <SvgText
                  fontFamily={Fonts.sans}
                  x={cx}
                  y={labelY}
                  fill={theme.text}
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle">
                  {formatLength(s.fromBass, unit, undefined, false)}
                </SvgText>
              </G>
            );
          })}

          <SvgText
            fontFamily={Fonts.sans}
            x={bassX}
            y={height - 4}
            fill={theme.textSecondary}
            fontSize={10}
            textAnchor={flipped ? 'end' : 'start'}>
            {`Slot centers from bass edge (${unit})`}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
