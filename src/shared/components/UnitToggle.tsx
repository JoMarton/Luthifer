import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { LengthUnit } from '@/shared/units';

const OPTIONS: { unit: LengthUnit; label: string }[] = [
  { unit: 'in', label: 'in' },
  { unit: 'mm', label: 'mm' },
];

export function UnitToggle({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: LengthUnit;
  onChange: (u: LengthUnit) => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, { backgroundColor: theme.backgroundElement }]}>
      {OPTIONS.map(({ unit, label }) => {
        const selected = unit === value;
        return (
          <Pressable
            key={unit}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(unit)}
            style={[styles.option, selected && { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={selected ? styles.selectedText : undefined}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', borderRadius: 8, padding: 2 },
  option: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 6 },
  selectedText: { color: '#ffffff' },
});
