import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NumberField } from '@/shared/components/NumberField';
import { UnitToggle } from '@/shared/components/UnitToggle';
import { formatLength, parseLength, toEditText, toInches, type LengthUnit } from '@/shared/units';
import { NutDiagram } from '@/tools/nut/NutDiagram';
import { ResultsTable } from '@/tools/nut/ResultsTable';
import { computeSlots } from '@/tools/nut/spacing';
import {
  CUSTOM_SET_ID,
  findSet,
  MAX_STRINGS,
  MIN_STRINGS,
  useNutStore,
} from '@/tools/nut/useNutStore';

const WIDTH_PRESETS: Record<LengthUnit, { label: string; inches: number }[]> = {
  in: [
    { label: '1 5/8', inches: 1.625 },
    { label: '1 11/16', inches: 1.6875 },
    { label: '1 3/4', inches: 1.75 },
    { label: '1 7/8', inches: 1.875 },
    { label: '2', inches: 2 },
  ],
  mm: [42, 43, 44, 45, 48].map((mm) => ({
    label: String(mm),
    inches: toInches(mm, 'mm'),
  })),
};

export default function NutScreen() {
  const theme = useTheme();
  const s = useNutStore();
  const unit = s.inputUnit;

  const parse = useCallback((t: string) => toInches(parseLength(t), unit), [unit]);
  const format = useCallback((v: number) => toEditText(v, unit), [unit]);

  const result = computeSlots({
    width: s.width,
    bassOffset: s.bassOffset,
    trebleOffset: s.trebleOffset,
    gauges: s.gauges,
  });

  const setName =
    s.setId === CUSTOM_SET_ID ? 'Custom' : (findSet(s.savedSets, s.setId)?.name ?? 'Custom');

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        {/* Inputs */}
        <View style={[styles.card, { backgroundColor: theme.backgroundElement + '80' }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Nut</ThemedText>
            <UnitToggle value={unit} onChange={s.setInputUnit} accessibilityLabel="Input unit" />
          </View>

          <NumberField
            label="Nut width"
            value={s.width}
            onChange={s.setWidth}
            parse={parse}
            format={format}
            suffix={unit}
          />
          <View style={styles.chips}>
            {WIDTH_PRESETS[unit].map((p) => {
              const active = Math.abs(p.inches - s.width) < 1e-6;
              return (
                <Pressable
                  key={p.label}
                  onPress={() => s.setWidth(p.inches)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.accent : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText type="small" style={active ? styles.chipActive : undefined}>
                    {p.label}
                    {unit === 'in' ? '"' : ''}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <NumberField
            label="Bass offset"
            hint="Bass edge → center of low string"
            value={s.bassOffset}
            onChange={s.setBassOffset}
            parse={parse}
            format={format}
            suffix={unit}
          />
          <NumberField
            label="Treble offset"
            hint="Treble edge → center of high string"
            value={s.trebleOffset}
            onChange={s.setTrebleOffset}
            parse={parse}
            format={format}
            suffix={unit}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement + '80' }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Strings</ThemedText>
            <View style={styles.stepper}>
              <StepButton
                label="−"
                disabled={s.gauges.length <= MIN_STRINGS}
                onPress={() => s.setStringCount(s.gauges.length - 1)}
              />
              <ThemedText style={styles.count}>{s.gauges.length}</ThemedText>
              <StepButton
                label="+"
                disabled={s.gauges.length >= MAX_STRINGS}
                onPress={() => s.setStringCount(s.gauges.length + 1)}
              />
            </View>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/nut/strings')}
            style={[styles.setRow, { backgroundColor: theme.backgroundElement }]}>
            <View style={{ flex: 1 }}>
              <ThemedText>{setName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.mono}>
                {s.gauges.map((g) => Math.round(g * 10000) / 10).join(' · ')}
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary">Edit ›</ThemedText>
          </Pressable>
        </View>

        {/* Results */}
        <View style={styles.cardHeader}>
          <ThemedText style={styles.sectionTitle}>Slot positions</ThemedText>
          <UnitToggle
            value={s.outputUnit}
            onChange={s.setOutputUnit}
            accessibilityLabel="Result unit"
          />
        </View>

        {result.ok ? (
          <>
            <View style={[styles.card, { backgroundColor: theme.backgroundElement + '80' }]}>
              <NutDiagram
                width={s.width}
                slots={result.slots}
                unit={s.outputUnit}
                flipped={s.flipped}
              />
              <View style={styles.flipRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Bass side on the right
                </ThemedText>
                <Switch value={s.flipped} onValueChange={s.setFlipped} />
              </View>
            </View>

            <View style={styles.summary}>
              <Summary label="Gap between strings" value={formatLength(result.gap, s.outputUnit)} />
              <Summary label="Outer slot span" value={formatLength(result.span, s.outputUnit)} />
            </View>

            <ResultsTable slots={result.slots} unit={s.outputUnit} />
          </>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.bassSoft }]}>
            {result.errors.map((e) => (
              <ThemedText key={e} type="small" style={{ color: theme.danger }}>
                {e}
              </ThemedText>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Add string' : 'Remove string'}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.stepButton,
        {
          backgroundColor: theme.backgroundSelected,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <ThemedText style={styles.stepLabel}>{label}</ThemedText>
    </Pressable>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.summaryItem, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={[styles.summaryValue, styles.mono]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.three },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 20, fontWeight: 700 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: -Spacing.two,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipActive: { color: '#ffffff' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { fontSize: 20, lineHeight: 22, fontWeight: 600 },
  count: { minWidth: 24, textAlign: 'center', fontSize: 18, fontWeight: 700 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  mono: { fontFamily: Fonts.mono },
  flipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summary: { flexDirection: 'row', gap: Spacing.two },
  summaryItem: { flex: 1, borderRadius: 10, padding: 12 },
  summaryValue: { fontSize: 18, fontWeight: 700 },
});
