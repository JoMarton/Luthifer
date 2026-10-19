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
const SIDE_LABEL_Y = 76;
const DIM_Y = 104;
const HEIGHT = 124;
/** Strings are drawn at twice their true scale so the thin ones stay visible. */
const STRING_ZOOM = 2;

/**
 * The nut seen end-on on an amber LCD: string numbers on top, each string in its
 * slot, the bass and treble sides labelled, and the nut width below.
 */
export function NutDiagram({
  width,
  slots,
  unit,
  flipped,
  color = Palette.lcd,
}: {
  width: number;
  slots: Slot[];
  unit: LengthUnit;
  flipped: boolean;
  color?: string;
}) {
  const [layoutWidth, setLayoutWidth] = useState(0);

  const inner = Math.max(0, layoutWidth - PAD * 2);
  const scale = inner / width;
  const x = (pos: number) => PAD + (flipped ? width - pos : pos) * scale;
  const left = PAD;
  const right = PAD + inner;
  const mid = layoutWidth / 2;
  const widthLabel = formatLength(width, unit, unit === 'in' ? 4 : 2);
  const labelBox = widthLabel.length * 9 + 12;

  const bassIs = flipped ? 'right' : 'left';
  const description = `Nut diagram: ${slots.length} slots, bass on the ${bassIs}, ${widthLabel} wide`;

  return (
    <View onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {layoutWidth > 0 && (
        <Svg width={layoutWidth} height={HEIGHT} role="img" aria-label={description}>
          <G fontFamily={Fonts.lcd} fontSize={18} fill={color} textAnchor="middle">
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
              <Circle
                key={s.index}
                cx={x(s.fromBass)}
                cy={NUT_TOP + 4}
                r={Math.max(1.8, (s.gauge / 2) * scale * STRING_ZOOM)}
              />
            ))}
          </G>

          <SvgText
            x={flipped ? right - 4 : left + 4}
            y={SIDE_LABEL_Y}
            fontFamily={Fonts.lcd}
            fontSize={16}
            fill={color}
            textAnchor={flipped ? 'end' : 'start'}>
            BASS
          </SvgText>
          <SvgText
            x={flipped ? left + 4 : right - 4}
            y={SIDE_LABEL_Y}
            fontFamily={Fonts.lcd}
            fontSize={16}
            fill={color}
            opacity={0.7}
            textAnchor={flipped ? 'start' : 'end'}>
            TREBLE
          </SvgText>

          {/* Nut width dimension */}
          <G stroke={color} strokeWidth={1.5} fill="none">
            <Line x1={left} y1={DIM_Y} x2={right} y2={DIM_Y} />
            <Polyline
              points={`${left + 6},${DIM_Y - 5} ${left},${DIM_Y} ${left + 6},${DIM_Y + 5}`}
            />
            <Polyline
              points={`${right - 6},${DIM_Y - 5} ${right},${DIM_Y} ${right - 6},${DIM_Y + 5}`}
            />
            <Line x1={left} y1={DIM_Y - 12} x2={left} y2={DIM_Y + 10} />
            <Line x1={right} y1={DIM_Y - 12} x2={right} y2={DIM_Y + 10} />
          </G>
          <Rect
            x={mid - labelBox / 2}
            y={DIM_Y - 10}
            width={labelBox}
            height={20}
            fill={Palette.lcdBg}
          />
          <SvgText
            x={mid}
            y={DIM_Y + 6}
            fontFamily={Fonts.lcd}
            fontSize={20}
            fill={color}
            textAnchor="middle">
            {widthLabel}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
