import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NumberField } from '@/shared/components/NumberField';
import { formatGauge, parseGauge, STRING_SETS } from '@/tools/nut/stringSets';
import { CUSTOM_SET_ID, useNutStore } from '@/tools/nut/useNutStore';

export default function StringsScreen() {
  const theme = useTheme();
  const { gauges, setId, chooseSet, setGauge } = useNutStore();
  const n = gauges.length;
  const format = useCallback((d: number) => formatGauge(d), []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <ThemedText type="smallBold">Presets</ThemedText>
        <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
          {STRING_SETS.map((set, i) => {
            const active = set.id === setId;
            return (
              <Pressable
                key={set.id}
                onPress={() => chooseSet(set.id)}
                style={[
                  styles.preset,
                  i > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.border,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <ThemedText>{set.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.mono}>
                    {set.gauges.map(formatGauge).join(' · ')}
                  </ThemedText>
                </View>
                {active ? (
                  <ThemedText style={{ color: theme.accent, fontWeight: 700 }}>✓</ThemedText>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.customHeader}>
          <ThemedText type="smallBold">
            Gauges {setId === CUSTOM_SET_ID ? '(custom)' : ''}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Thousandths of an inch — e.g. 46 or .046
          </ThemedText>
        </View>
        <View
          style={[styles.list, styles.gauges, { backgroundColor: theme.backgroundElement + '80' }]}>
          {gauges.map((d, i) => (
            <NumberField
              key={`${n}-${i}`}
              label={`String ${n - i}${i === 0 ? ' — bass' : i === n - 1 ? ' — treble' : ''}`}
              value={d}
              onChange={(v) => setGauge(i, v)}
              parse={parseGauge}
              format={format}
              invalid={!(d > 0)}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  list: { borderRadius: 12, overflow: 'hidden' },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mono: { fontFamily: Fonts.mono },
  customHeader: { marginTop: Spacing.three },
  gauges: { padding: Spacing.three, gap: Spacing.two },
});
