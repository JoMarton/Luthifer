import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Fonts, Palette } from '@/constants/theme';
import { formatLength, type LengthUnit } from '@/shared/units';
import type { Slot } from '@/tools/nut/spacing';

const PAD = 8;
const NUMBER_Y = 20;
const NUT_TOP = 40;
const NUT_HEIGHT = 44;
const NUT_BOTTOM = NUT_TOP + NUT_HEIGHT;
const SIDE_LABEL_Y = 76;
const FIRST_ROW = NUT_BOTTOM + 20;
const ROW_HEIGHT = 17;
const MAX_ROWS = 4;
const POSITION_FONT = 13;
/** IBM Plex Mono glyphs are 0.6 em wide. */
const CHAR_WIDTH = POSITION_FONT * 0.6;
/** Strings are drawn at up to twice their true scale so the thin ones stay visible. */
const STRING_ZOOM = 2;

/**
 * The nut seen end-on on an amber LCD: string numbers on top, each string in its
 * slot, the bass and treble sides labelled, every slot's distance from the bass
 * edge under the nut, and the nut width at the bottom.
 */
export function NutDiagram({
  width,
  slots,
  unit,
  flipped,
  color = Palette.lcd,
  zoom = 1,
}: {
  width: number;
  slots: Slot[];
  unit: LengthUnit;
  flipped: boolean;
  color?: string;
  /** Scale the whole drawing up, e.g. for the full-screen view. */
  zoom?: number;
}) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  // Lay out at the zoomed-out width, then let the SVG viewBox scale everything up evenly.
  const logicalWidth = layoutWidth / zoom;

  const inner = Math.max(0, logicalWidth - PAD * 2);
  const scale = inner / width;
  const x = (pos: number) => PAD + (flipped ? width - pos : pos) * scale;
  const left = PAD;
  const right = PAD + inner;
  const mid = logicalWidth / 2;
  const widthLabel = formatLength(width, unit, unit === 'in' ? 4 : 2);
  const labelBox = widthLabel.length * 14 * 0.6 + 12;

  // Slot positions sit under the nut; alternate two rows when they would overlap.
  const positions = slots.map((s) => formatLength(s.fromBass, unit, undefined, false));
  const labelWidth = Math.max(...positions.map((p) => p.length)) * CHAR_WIDTH + 6;
  const spacing = Math.min(
    ...slots.slice(1).map((s, i) => Math.abs(x(s.fromBass) - x(slots[i].fromBass))),
  );
  const rows = Math.min(MAX_ROWS, Math.max(1, Math.ceil(labelWidth / spacing)));
  const rowFor = (i: number) => FIRST_ROW + (i % rows) * ROW_HEIGHT;
  const clampX = (v: number) =>
    Math.min(logicalWidth - labelWidth / 2, Math.max(labelWidth / 2, v));
  const captionY = FIRST_ROW + (rows - 1) * ROW_HEIGHT + 20;
  const dimY = captionY + 24;
  const height = dimY + 16;

  // Drawn larger than life so thin strings show, but never wider than the room beside them.
  const stringRadius = (gauge: number) =>
    Math.max(1.8, Math.min((gauge / 2) * scale * STRING_ZOOM, spacing / 2 - 1, 12));

  const bassIs = flipped ? 'right' : 'left';
  const description =
    `Nut diagram: ${slots.length} slots, bass on the ${bassIs}, ${widthLabel} wide. ` +
    `Slot centers from the bass edge: ` +
    slots.map((s, i) => `string ${s.stringNumber} ${positions[i]}`).join(', ');

  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={{ height: height * zoom }}>
      {layoutWidth > 0 && (
        <Svg
          width={layoutWidth}
          height={height * zoom}
          viewBox={`0 0 ${logicalWidth} ${height}`}
          role="img"
          aria-label={description}>
          <G fontFamily={Fonts.lcd} fontSize={13} fill={color} textAnchor="middle">
            {slots.map((s) => (
              <SvgText key={s.index} x={x(s.fromBass)} y={NUMBER_Y}>
                {s.stringNumber}
              </SvgText>
            ))}
          </G>

          <G stroke={color} strokeWidth={1} opacity={0.35}>
            {slots.map((s) => (
              <Line key={s.index} x1={x(s.fromBass)} y1={24} x2={x(s.fromBass)} y2={36} />
            ))}
          </G>

          <Rect
            x={left}
            y={NUT_TOP}
            width={inner}
            height={NUT_HEIGHT}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />

          <G fill={color}>
            {slots.map((s) => (
              <Circle key={s.index} cx={x(s.fromBass)} cy={NUT_TOP + 4} r={stringRadius(s.gauge)} />
            ))}
          </G>

          <SvgText
            x={flipped ? right - 4 : left + 4}
            y={SIDE_LABEL_Y}
            fontFamily={Fonts.lcd}
            fontSize={12}
            fill={color}
            textAnchor={flipped ? 'end' : 'start'}>
            BASS
          </SvgText>
          <SvgText
            x={flipped ? left + 4 : right - 4}
            y={SIDE_LABEL_Y}
            fontFamily={Fonts.lcd}
            fontSize={12}
            fill={color}
            opacity={0.7}
            textAnchor={flipped ? 'start' : 'end'}>
            TREBLE
          </SvgText>

          {/* Slot positions from the bass edge */}
          <G stroke={color} strokeWidth={1} opacity={0.35} strokeDasharray="2,3">
            {slots.map((s, i) => (
              <Line
                key={s.index}
                x1={x(s.fromBass)}
                y1={NUT_BOTTOM + 2}
                x2={x(s.fromBass)}
                y2={rowFor(i) - 13}
              />
            ))}
          </G>
          <G fontFamily={Fonts.lcd} fontSize={POSITION_FONT} fill={color} textAnchor="middle">
            {slots.map((s, i) => (
              <SvgText key={s.index} x={clampX(x(s.fromBass))} y={rowFor(i)}>
                {positions[i]}
              </SvgText>
            ))}
          </G>
          <SvgText
            x={flipped ? right : left}
            y={captionY}
            fontFamily={Fonts.lcd}
            fontSize={11}
            fill={color}
            opacity={0.7}
            textAnchor={flipped ? 'end' : 'start'}>
            {flipped
              ? `SLOT CENTERS FROM BASS EDGE (${unit.toUpperCase()}) ▶`
              : `◀ SLOT CENTERS FROM BASS EDGE (${unit.toUpperCase()})`}
          </SvgText>

          {/* Nut width dimension */}
          <G stroke={color} strokeWidth={1.5} fill="none">
            <Line x1={left} y1={dimY} x2={right} y2={dimY} />
            <Polyline points={`${left + 6},${dimY - 5} ${left},${dimY} ${left + 6},${dimY + 5}`} />
            <Polyline
              points={`${right - 6},${dimY - 5} ${right},${dimY} ${right - 6},${dimY + 5}`}
            />
            <Line x1={left} y1={dimY - 12} x2={left} y2={dimY + 10} />
            <Line x1={right} y1={dimY - 12} x2={right} y2={dimY + 10} />
          </G>
          <Rect
            x={mid - labelBox / 2}
            y={dimY - 10}
            width={labelBox}
            height={20}
            fill={Palette.lcdBg}
          />
          <SvgText
            x={mid}
            y={dimY + 6}
            fontFamily={Fonts.lcd}
            fontSize={14}
            fill={color}
            textAnchor="middle">
            {widthLabel}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
