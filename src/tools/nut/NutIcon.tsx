import Svg, { Rect } from 'react-native-svg';

import { Palette } from '@/constants/theme';

/** A nut blank with graduated slots, for the tool drawer. */
export function NutIcon({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <Rect
        x={2}
        y={16}
        width={52}
        height={24}
        fill="#F2E6CC"
        stroke={Palette.ink}
        strokeWidth={2}
      />
      <Rect x={2} y={16} width={52} height={5} fill="#FFFFFF" opacity={0.6} />
      <Rect x={10} y={16} width={5} height={9} fill={Palette.ink} />
      <Rect x={19} y={16} width={4} height={8} fill={Palette.ink} />
      <Rect x={27} y={16} width={3} height={7} fill={Palette.ink} />
      <Rect x={34} y={16} width={3} height={6} fill={Palette.ink} />
      <Rect x={41} y={16} width={2} height={6} fill={Palette.ink} />
      <Rect x={47} y={16} width={2} height={5} fill={Palette.ink} />
      <Rect x={2} y={44} width={52} height={2} fill={Palette.titleTo} />
      <Rect x={2} y={42} width={2} height={6} fill={Palette.titleTo} />
      <Rect x={52} y={42} width={2} height={6} fill={Palette.titleTo} />
    </Svg>
  );
}
