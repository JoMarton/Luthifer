import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Fonts, Palette } from '@/constants/theme';
import { NumberField } from '@/shared/components/NumberField';
import { bevel, BevelButton, Dialog, NavBar, Screen, T, Window } from '@/shared/components/retro';
import { formatGauge, parseGauge, STRING_SETS, type StringSet } from '@/tools/nut/stringSets';
import { CUSTOM_SET_ID, findSet, useNutStore } from '@/tools/nut/useNutStore';

export default function StringsScreen() {
  const { gauges, setId, savedSets, chooseSet, setGauge, saveSet, deleteSet } = useNutStore();
  const [saving, setSaving] = useState(false);
  const n = gauges.length;
  const format = useCallback((d: number) => formatGauge(d), []);
  const current = setId === CUSTOM_SET_ID ? undefined : findSet(savedSets, setId);
  const isCustom = setId === CUSTOM_SET_ID;

  return (
    <Screen>
      <NavBar
        backLabel="NUT"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/nut'))}
        title="STRING SETS"
      />

      <Window
        title="MY SETS"
        right={
          <T v="lcd" style={styles.titleNote}>
            {savedSets.length} saved
          </T>
        }
        bodyStyle={styles.listBody}>
        <View style={[styles.list, bevel.in]}>
          {savedSets.length === 0 ? (
            <T style={styles.empty}>
              No saved sets yet. Edit the gauges below, then save them as a set.
            </T>
          ) : (
            <SetList sets={savedSets} activeId={setId} onChoose={chooseSet} onDelete={deleteSet} />
          )}
        </View>
      </Window>

      <Window title="PRESETS" bodyStyle={styles.listBody}>
        <View style={[styles.list, bevel.in]}>
          <SetList sets={STRING_SETS} activeId={setId} onChoose={chooseSet} />
        </View>
      </Window>

      <Window
        title="GAUGES"
        right={
          <T v="display" style={styles.gaugeState} numberOfLines={1}>
            {isCustom ? 'CUSTOM · UNSAVED' : current?.name.toUpperCase()}
          </T>
        }
        bodyStyle={styles.gaugesBody}>
        <T v="hint" style={styles.gaugeHint}>
          Thousandths of an inch — e.g. 46 or .046
        </T>
        {gauges.map((d, i) => {
          const role = i === 0 ? ' — bass' : i === n - 1 ? ' — treble' : '';
          return (
            <View key={`${n}-${i}`} style={styles.gaugeRow}>
              <T>
                <T v="bodyBold">String {n - i}</T>
                {role}
              </T>
              <NumberField
                accessibilityLabel={`String ${n - i}${role} gauge`}
                value={d}
                onChange={(v) => setGauge(i, v)}
                parse={parseGauge}
                format={format}
                invalid={!(d > 0)}
                style={styles.gaugeField}
              />
            </View>
          );
        })}
        {isCustom ? (
          <BevelButton
            onPress={() => {
              // Take focus off the gauge being edited so the name field can have it.
              Keyboard.dismiss();
              setSaving(true);
            }}
            style={styles.saveOpen}>
            <FloppyIcon />
            <T v="display">SAVE AS NEW SET...</T>
          </BevelButton>
        ) : null}
      </Window>

      <SaveDialog
        visible={saving}
        gauges={gauges}
        savedSets={savedSets}
        onClose={() => setSaving(false)}
        onSave={(name) => {
          saveSet(name);
          setSaving(false);
        }}
      />
    </Screen>
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
  // Deleting takes two taps: the first arms the button, the second deletes.
  const [armedId, setArmedId] = useState<string | null>(null);

  return sets.map((set) => {
    const active = set.id === activeId;
    const armed = set.id === armedId;
    return (
      <View key={set.id} style={[styles.rowWrap, active && styles.rowActive]}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: active }}
          onPress={() => {
            setArmedId(null);
            onChoose(set.id);
          }}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View style={[styles.dot, active && styles.dotActive]} />
          <View style={styles.rowText}>
            <T v="bodyBold">{set.name}</T>
            <T v="lcd" style={styles.rowGauges}>
              {set.gauges.map(formatGauge).join(' · ')}
            </T>
          </View>
        </Pressable>
        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={armed ? `Confirm delete ${set.name}` : `Delete ${set.name}`}
            onPress={() => {
              if (armed) {
                setArmedId(null);
                onDelete(set.id);
              } else {
                setArmedId(set.id);
              }
            }}
            style={[styles.delete, armed && styles.deleteArmed]}>
            {armed ? (
              <T v="display" style={styles.deleteConfirm}>
                DEL?
              </T>
            ) : (
              <TrashIcon />
            )}
          </Pressable>
        ) : null}
      </View>
    );
  });
}

function SaveDialog({
  visible,
  gauges,
  savedSets,
  onClose,
  onSave,
}: {
  visible: boolean;
  gauges: number[];
  savedSets: StringSet[];
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const nameInput = useRef<TextInputInstance>(null);
  const suggested = `Custom ${formatGauge(gauges[gauges.length - 1])}–${formatGauge(gauges[0])}`;
  const finalName = name.trim() || suggested;
  const valid = gauges.every((d) => d > 0);
  const replaces = savedSets.some((s) => s.name.toLowerCase() === finalName.toLowerCase());

  const close = () => {
    setName('');
    onClose();
  };
  const save = () => {
    if (!valid) return;
    setName('');
    onSave(finalName);
  };

  return (
    <Dialog
      visible={visible}
      title="SAVE STRING SET"
      onClose={close}
      onShow={() => nameInput.current?.focus()}>
      <View style={[styles.preview, bevel.in]}>
        <T v="lcd" style={styles.previewText}>
          {gauges.map(formatGauge).join(' · ')}
        </T>
      </View>
      <View style={styles.nameField}>
        <T v="bodyBold">Set name</T>
        <TextInput
          ref={nameInput}
          accessibilityLabel="Set name"
          value={name}
          onChangeText={setName}
          placeholder={suggested}
          placeholderTextColor={Palette.inkMuted}
          returnKeyType="done"
          onSubmitEditing={save}
          style={[styles.nameInput, bevel.in]}
        />
        {replaces ? <T v="hint">A saved set with this name will be updated.</T> : null}
      </View>
      <View style={styles.dialogButtons}>
        <BevelButton onPress={close}>
          <T v="display">CANCEL</T>
        </BevelButton>
        <BevelButton onPress={save} disabled={!valid} style={styles.saveButton}>
          <T v="displayBold" style={styles.saveLabel}>
            {replaces ? 'UPDATE' : 'SAVE'}
          </T>
        </BevelButton>
      </View>
    </Dialog>
  );
}

function FloppyIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke={Palette.ink}
      strokeWidth={2}
      aria-hidden>
      <Path d="M2 2h9l3 3v9H2z" />
      <Path d="M5 2v4h5V2M5 14V9h6v5" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke={Palette.rust}
      strokeWidth={2}
      aria-hidden>
      <Path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  titleNote: { fontSize: 18, color: Palette.titleText, paddingRight: 6 },
  listBody: { padding: 6 },
  list: { backgroundColor: Palette.field },
  empty: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Palette.inkSoft,
    textAlign: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Palette.rowLine,
  },
  rowActive: { backgroundColor: Palette.zebra },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rowPressed: { backgroundColor: Palette.zebra },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Palette.bevelDark,
    backgroundColor: Palette.field,
  },
  dotActive: {
    backgroundColor: Palette.brass,
    boxShadow: `inset 0px 0px 0px 3px ${Palette.field}`,
  },
  rowText: { flex: 1, gap: 1 },
  rowGauges: { fontSize: 19, color: Palette.inkSoft },
  delete: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Palette.rowLine,
  },
  deleteArmed: { backgroundColor: Palette.bassRed },
  deleteConfirm: { fontSize: 10, color: Palette.field },
  gaugeState: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
    fontSize: 10,
    color: Palette.titleWarn,
    textAlign: 'right',
  },
  gaugesBody: { paddingTop: 12, gap: 8 },
  gaugeHint: { fontSize: 13, marginBottom: 4 },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  gaugeField: { width: 96 },
  saveOpen: { marginTop: 8 },
  preview: { backgroundColor: Palette.lcdBg, paddingVertical: 6, paddingHorizontal: 10 },
  previewText: { fontSize: 22, color: Palette.lcd },
  nameField: { gap: 6 },
  nameInput: {
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: Palette.field,
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Palette.ink,
  },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  saveButton: { backgroundColor: Palette.brass },
  saveLabel: { fontSize: 12 },
});
