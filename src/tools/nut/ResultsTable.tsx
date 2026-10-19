import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { bevel, T } from '@/shared/components/retro';
import { formatLength, type LengthUnit } from '@/shared/units';
import type { Slot } from '@/tools/nut/spacing';
import { formatGauge } from '@/tools/nut/stringSets';

const COLUMNS = [
  { key: 'str', label: 'STR', narrow: true },
  { key: 'ga', label: 'GA.', narrow: true },
  { key: 'bass', label: 'FROM\nBASS' },
  { key: 'treble', label: 'FROM\nTREBLE' },
  { key: 'next', label: 'TO\nNEXT' },
] as const;

export function ResultsTable({ slots, unit }: { slots: Slot[]; unit: LengthUnit }) {
  const fmt = (v: number) => formatLength(v, unit, undefined, false);
  const unitName = unit === 'in' ? 'inches' : 'millimeters';

  return (
    <View
      style={[styles.window, bevel.out]}
      accessibilityLabel={`Slot positions in ${unitName}, measured to the slot center`}>
      <View style={[styles.table, bevel.in]}>
        <View style={[styles.row, styles.headRow]}>
          {COLUMNS.map((c, i) => (
            <T
              key={c.key}
              v="display"
              style={[
                styles.headCell,
                'narrow' in c ? styles.narrow : styles.wide,
                i === 0 && styles.first,
              ]}>
              {c.label}
            </T>
          ))}
        </View>
        {slots.map((s, i) => {
          const isBass = i === 0;
          return (
            <View key={s.index} style={[styles.row, styles.bodyRow, i % 2 === 0 && styles.zebra]}>
              <T
                v="lcd"
                style={[styles.cell, styles.narrow, styles.first, isBass && styles.bass]}
                accessibilityLabel={`String ${s.stringNumber}${isBass ? ', bass' : ''}`}>
                {s.stringNumber}
              </T>
              <T v="lcd" style={[styles.cell, styles.narrow]}>
                {formatGauge(s.gauge)}
              </T>
              <T v="lcd" style={[styles.cell, styles.wide]}>
                {fmt(s.fromBass)}
              </T>
              <T v="lcd" style={[styles.cell, styles.wide]}>
                {fmt(s.fromTreble)}
              </T>
              <T v="lcd" style={[styles.cell, styles.wide, s.toNext === null && styles.dim]}>
                {s.toNext === null ? '—' : fmt(s.toNext)}
              </T>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { backgroundColor: Palette.maple, padding: 4 },
  table: { backgroundColor: Palette.field },
  headRow: {
    alignItems: 'flex-end',
    backgroundColor: Palette.titleTo,
    backgroundImage: `linear-gradient(90deg, ${Palette.titleFrom}, ${Palette.titleTo})`,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  bodyRow: { paddingVertical: 2 },
  zebra: { backgroundColor: Palette.zebra },
  headCell: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 11,
    lineHeight: 14,
    color: Palette.titleText,
    textAlign: 'right',
  },
  cell: { paddingHorizontal: 6, paddingVertical: 6, fontSize: 14, textAlign: 'right' },
  narrow: { flex: 0.7 },
  wide: { flex: 1.25 },
  first: { textAlign: 'left' },
  bass: { color: Palette.bassRed },
  dim: { color: Palette.lcdBevelLight },
});
