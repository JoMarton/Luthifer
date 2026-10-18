import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatLength, type LengthUnit } from '@/shared/units';
import type { Slot } from '@/tools/nut/spacing';
import { formatGauge } from '@/tools/nut/stringSets';

const COLUMNS = ['String', 'Gauge', 'From bass', 'From treble', 'To next'] as const;

export function ResultsTable({ slots, unit }: { slots: Slot[]; unit: LengthUnit }) {
  const theme = useTheme();
  const fmt = (v: number) => formatLength(v, unit, undefined, false);

  return (
    <View style={[styles.table, { borderColor: theme.border }]}>
      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        {COLUMNS.map((c, i) => (
          <ThemedText key={c} type="smallBold" style={[styles.cell, i < 2 && styles.narrow]}>
            {c}
          </ThemedText>
        ))}
      </View>
      {slots.map((s, i) => {
        const isBass = i === 0;
        return (
          <View
            key={s.index}
            style={[
              styles.row,
              { borderTopColor: theme.border },
              styles.bodyRow,
              isBass && { backgroundColor: theme.bassSoft },
            ]}>
            <ThemedText
              type="smallBold"
              style={[styles.cell, styles.narrow, isBass && { color: theme.bass }]}>
              {s.stringNumber}
              {isBass ? ' bass' : ''}
            </ThemedText>
            <ThemedText type="small" style={[styles.cell, styles.narrow, styles.mono]}>
              {formatGauge(s.gauge)}
            </ThemedText>
            <ThemedText type="smallBold" style={[styles.cell, styles.mono]}>
              {fmt(s.fromBass)}
            </ThemedText>
            <ThemedText type="small" style={[styles.cell, styles.mono]}>
              {fmt(s.fromTreble)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={[styles.cell, styles.mono]}>
              {s.toNext === null ? '—' : fmt(s.toNext)}
            </ThemedText>
          </View>
        );
      })}
      <ThemedText type="small" themeColor="textSecondary" style={styles.foot}>
        Values in {unit === 'in' ? 'inches' : 'millimeters'}, measured to the slot center. Gauge in
        thousandths of an inch.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  bodyRow: { borderTopWidth: StyleSheet.hairlineWidth },
  cell: { flex: 1.2, fontSize: 13, lineHeight: 18 },
  narrow: { flex: 0.9 },
  mono: { fontFamily: Fonts.mono },
  foot: { fontSize: 12, lineHeight: 16, padding: 8 },
});
