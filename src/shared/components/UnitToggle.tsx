import { Pressable, StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { bevel, T } from '@/shared/components/retro';
import type { LengthUnit } from '@/shared/units';

const OPTIONS: LengthUnit[] = ['in', 'mm'];

/** Two bevelled keys; the selected unit stays pressed in. */
export function UnitToggle({
  value,
  onChange,
  accessibilityLabel,
  height = 30,
}: {
  value: LengthUnit;
  onChange: (u: LengthUnit) => void;
  accessibilityLabel?: string;
  height?: number;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.group}>
      {OPTIONS.map((unit) => {
        const selected = unit === value;
        return (
          <Pressable
            key={unit}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={unit === 'in' ? 'inches' : 'millimeters'}
            hitSlop={{ top: (44 - height) / 2, bottom: (44 - height) / 2 }}
            onPress={() => onChange(unit)}
            style={[
              styles.key,
              { height },
              selected ? [bevel.in, styles.selected] : [bevel.outFlat, styles.idle],
            ]}>
            <T v="display" style={styles.label}>
              {unit.toUpperCase()}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row' },
  key: { width: 44, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: Palette.paper },
  idle: { backgroundColor: Palette.toggleUp },
  label: { fontSize: 12 },
});
