import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NumberField } from '@/shared/components/NumberField';
import { formatGauge, parseGauge, STRING_SETS, type StringSet } from '@/tools/nut/stringSets';
import { CUSTOM_SET_ID, findSet, useNutStore } from '@/tools/nut/useNutStore';

export default function StringsScreen() {
  const theme = useTheme();
  const { gauges, setId, savedSets, chooseSet, setGauge, saveSet, deleteSet } = useNutStore();
  const n = gauges.length;
  const format = useCallback((d: number) => formatGauge(d), []);
  const current = setId === CUSTOM_SET_ID ? undefined : findSet(savedSets, setId);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        {savedSets.length > 0 ? (
          <>
            <ThemedText type="smallBold">My sets</ThemedText>
            <SetList sets={savedSets} activeId={setId} onChoose={chooseSet} onDelete={deleteSet} />
          </>
        ) : null}

        <ThemedText type="smallBold" style={savedSets.length > 0 && styles.sectionGap}>
          Presets
        </ThemedText>
        <SetList sets={STRING_SETS} activeId={setId} onChoose={chooseSet} />

        <View style={styles.sectionGap}>
          <ThemedText type="smallBold">Gauges — {current?.name ?? 'custom'}</ThemedText>
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

        {setId === CUSTOM_SET_ID ? (
          <SaveSetForm gauges={gauges} savedSets={savedSets} onSave={saveSet} />
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

function SetList({
  sets,
  activeId,
  onChoose,
  onDelete,
}: {
  sets: StringSet[];
  activeId: string;
  onChoose: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const theme = useTheme();
  // Deleting takes two taps: the first arms the button, the second deletes.
  const [armedId, setArmedId] = useState<string | null>(null);

  return (
    <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
      {sets.map((set, i) => {
        const active = set.id === activeId;
        const armed = set.id === armedId;
        return (
          <Pressable
            key={set.id}
            onPress={() => {
              setArmedId(null);
              onChoose(set.id);
            }}
            style={[
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
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
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={armed ? `Confirm delete ${set.name}` : `Delete ${set.name}`}
                hitSlop={8}
                onPress={() => {
                  if (armed) {
                    setArmedId(null);
                    onDelete(set.id);
                  } else {
                    setArmedId(set.id);
                  }
                }}
                style={[
                  styles.deleteButton,
                  { backgroundColor: armed ? theme.danger : theme.backgroundSelected },
                ]}>
                <ThemedText type="small" style={armed ? styles.onDanger : undefined}>
                  {armed ? 'Delete' : '✕'}
                </ThemedText>
              </Pressable>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function SaveSetForm({
  gauges,
  savedSets,
  onSave,
}: {
  gauges: number[];
  savedSets: StringSet[];
  onSave: (name: string) => void;
}) {
  const theme = useTheme();
  const suggested = `Custom ${formatGauge(gauges[gauges.length - 1])}–${formatGauge(gauges[0])}`;
  const [name, setName] = useState('');
  const finalName = name.trim() || suggested;
  const valid = gauges.every((d) => d > 0);
  const replaces = savedSets.some((s) => s.name.toLowerCase() === finalName.toLowerCase());

  return (
    <View style={[styles.list, styles.save, { backgroundColor: theme.backgroundElement + '80' }]}>
      <ThemedText type="smallBold">Save as a string set</ThemedText>
      <View style={styles.saveRow}>
        <TextInput
          accessibilityLabel="String set name"
          value={name}
          onChangeText={setName}
          placeholder={suggested}
          placeholderTextColor={theme.textSecondary}
          returnKeyType="done"
          onSubmitEditing={() => valid && onSave(finalName)}
          style={[
            styles.nameInput,
            { color: theme.text, backgroundColor: theme.backgroundElement },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!valid}
          onPress={() => onSave(finalName)}
          style={[styles.saveButton, { backgroundColor: theme.accent, opacity: valid ? 1 : 0.4 }]}>
          <ThemedText type="smallBold" style={styles.onDanger}>
            {replaces ? 'Update' : 'Save'}
          </ThemedText>
        </Pressable>
      </View>
      {replaces ? (
        <ThemedText type="small" themeColor="textSecondary">
          A saved set with this name will be updated.
        </ThemedText>
      ) : null}
    </View>
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
  sectionGap: { marginTop: Spacing.three },
  list: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: Spacing.two,
  },
  mono: { fontFamily: Fonts.mono },
  deleteButton: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  onDanger: { color: '#ffffff' },
  gauges: { padding: Spacing.three, gap: Spacing.two },
  save: { padding: Spacing.three, gap: Spacing.two, marginTop: Spacing.two },
  saveRow: { flexDirection: 'row', gap: Spacing.two },
  nameInput: { flex: 1, minWidth: 0, borderRadius: 8, paddingHorizontal: 10, fontSize: 16 },
  saveButton: { borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
});
