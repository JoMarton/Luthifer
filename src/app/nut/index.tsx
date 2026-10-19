import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';
import { NumberField } from '@/shared/components/NumberField';
import {
  bevel,
  BevelButton,
  engraved,
  Lcd,
  NavBar,
  Screen,
  T,
  TextLink,
  Window,
} from '@/shared/components/retro';
import { track } from '@/shared/analytics';
import { UnitToggle } from '@/shared/components/UnitToggle';
import { formatLength, parseLength, toEditText, toInches, type LengthUnit } from '@/shared/units';
import { NutDiagram } from '@/tools/nut/NutDiagram';
import { ResultsTable } from '@/tools/nut/ResultsTable';
import { FullScreenDiagram } from '@/tools/nut/FullScreenDiagram';
import { CalculationDialog, GuitarWidthDialog, OffsetHelpDialog } from '@/tools/nut/NutDialogs';
import { matchGuitars } from '@/tools/nut/nutWidths';
import { breakdown, computeSlots } from '@/tools/nut/spacing';
import { formatGauge } from '@/tools/nut/stringSets';
import {
  CUSTOM_SET_ID,
  findSet,
  MAX_STRINGS,
  MIN_STRINGS,
  useNutStore,
} from '@/tools/nut/useNutStore';

const WIDTH_PRESETS: Record<LengthUnit, { label: string; inches: number }[]> = {
  in: [
    { label: '1 5/8"', inches: 1.625 },
    { label: '1 11/16"', inches: 1.6875 },
    { label: '1 3/4"', inches: 1.75 },
    { label: '1 7/8"', inches: 1.875 },
    { label: '2"', inches: 2 },
  ],
  mm: [42, 43, 44, 45, 48].map((mm) => ({
    label: String(mm),
    inches: toInches(mm, 'mm'),
  })),
};

type Popup = 'offsets' | 'guitars' | 'calculation' | 'fullscreen' | null;

export default function NutScreen() {
  const s = useNutStore();
  const unit = s.inputUnit;
  const [popup, setPopup] = useState<Popup>(null);
  const closePopup = () => setPopup(null);

  const parse = useCallback((t: string) => toInches(parseLength(t), unit), [unit]);
  const format = useCallback((v: number) => toEditText(v, unit), [unit]);

  const input = {
    width: s.width,
    bassOffset: s.bassOffset,
    trebleOffset: s.trebleOffset,
    gauges: s.gauges,
  };
  const result = computeSlots(input);
  const working = breakdown(input);
  const guitars = matchGuitars(s.width);

  useEffect(() => track({ name: 'tool_opened', props: { tool: 'nut' } }), []);

  // One results_viewed per visit, once valid results have been on screen for 3 s.
  const viewed = useRef(false);
  useEffect(() => {
    if (!result.ok || viewed.current) return;
    const timer = setTimeout(() => {
      viewed.current = true;
      const now = useNutStore.getState();
      track({
        name: 'results_viewed',
        props: {
          tool: 'nut',
          string_count: now.gauges.length,
          string_set: now.setId.startsWith('user-') ? 'saved' : now.setId,
          input_unit: now.inputUnit,
          result_unit: now.outputUnit,
        },
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [result.ok]);

  const setName =
    s.setId === CUSTOM_SET_ID ? 'Custom' : (findSet(s.savedSets, s.setId)?.name ?? 'Custom');

  return (
    <Screen>
      <NavBar
        backLabel="TOOLS"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        title="NUT SLOT CALC"
      />

      {/* Nut */}
      <Window
        title="NUT"
        right={
          <UnitToggle value={unit} onChange={s.setInputUnit} accessibilityLabel="Input unit" />
        }>
        <View style={styles.field}>
          <T v="bodyBold">Nut width</T>
          <NumberField
            accessibilityLabel="Nut width"
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
                <BevelButton
                  key={p.label}
                  down={active}
                  accessibilityLabel={`Nut width ${p.label}${unit === 'mm' ? ' millimeters' : ''}`}
                  onPress={() => s.setWidth(p.inches)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <T v="lcd">{p.label}</T>
                </BevelButton>
              );
            })}
            <BevelButton
              accessibilityLabel="Nut width by guitar"
              onPress={() => setPopup('guitars')}
              style={[styles.chip, guitars.length > 0 && styles.chipActive]}>
              <T v="display" style={styles.byGuitar}>
                BY GUITAR...
              </T>
            </BevelButton>
          </View>
          {guitars.length > 0 ? (
            <T v="hint">= {guitars.map((g) => `${g.brand} ${g.model}`).join(' · ')}</T>
          ) : null}
        </View>

        <View style={styles.offsets}>
          <View style={[styles.field, styles.half]}>
            <T v="bodyBold">Bass offset</T>
            <NumberField
              accessibilityLabel="Bass offset"
              value={s.bassOffset}
              onChange={s.setBassOffset}
              parse={parse}
              format={format}
              suffix={unit}
            />
            <T v="hint">Bass edge → center of low string</T>
          </View>
          <View style={[styles.field, styles.half]}>
            <T v="bodyBold">Treble offset</T>
            <NumberField
              accessibilityLabel="Treble offset"
              value={s.trebleOffset}
              onChange={s.setTrebleOffset}
              parse={parse}
              format={format}
              suffix={unit}
            />
            <T v="hint">Treble edge → center of high string</T>
          </View>
        </View>
        <TextLink onPress={() => setPopup('offsets')} style={styles.helpLink}>
          HOW TO MEASURE ?
        </TextLink>
      </Window>

      {/* Strings */}
      <Window
        title="STRINGS"
        right={
          <View style={styles.stepper}>
            <BevelButton
              flat
              accessibilityLabel="Remove string"
              disabled={s.gauges.length <= MIN_STRINGS}
              onPress={() => s.setStringCount(s.gauges.length - 1)}
              style={styles.stepButton}>
              <T v="display" style={styles.stepLabel}>
                -
              </T>
            </BevelButton>
            <Lcd style={styles.count}>
              <T v="lcd" style={styles.countText} accessibilityLabel={`${s.gauges.length} strings`}>
                {s.gauges.length}
              </T>
            </Lcd>
            <BevelButton
              flat
              accessibilityLabel="Add string"
              disabled={s.gauges.length >= MAX_STRINGS}
              onPress={() => s.setStringCount(s.gauges.length + 1)}
              style={styles.stepButton}>
              <T v="display" style={styles.stepLabel}>
                +
              </T>
            </BevelButton>
          </View>
        }>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`String set ${setName}. Edit`}
          onPress={() => router.push('/nut/strings')}
          style={({ pressed }) => [styles.setRow, pressed ? bevel.in : bevel.out]}>
          <View style={styles.setText}>
            <T v="bodyBold" style={styles.setName}>
              {setName}
            </T>
            <T v="lcd" style={styles.setGauges}>
              {s.gauges.map(formatGauge).join(' · ')}
            </T>
          </View>
          <T v="display" style={styles.edit}>
            EDIT &gt;
          </T>
        </Pressable>
      </Window>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <T v="displayBold" accessibilityRole="header" style={engraved}>
          SLOT POSITIONS
        </T>
        <UnitToggle
          value={s.outputUnit}
          onChange={s.setOutputUnit}
          accessibilityLabel="Result unit"
          height={32}
        />
      </View>

      <View style={[styles.panel, bevel.out]}>
        <Lcd style={styles.diagram}>
          {result.ok ? (
            <NutDiagram
              width={s.width}
              slots={result.slots}
              unit={s.outputUnit}
              flipped={s.flipped}
            />
          ) : (
            <View
              style={styles.errors}
              accessible
              accessibilityRole="alert"
              accessibilityLiveRegion="polite">
              {result.errors.map((e) => (
                <T key={e} v="lcd" style={styles.errorText}>
                  ERR: {e}
                </T>
              ))}
            </View>
          )}
        </Lcd>
        {result.ok ? (
          <BevelButton
            accessibilityLabel="View diagram full screen, sideways"
            onPress={() => setPopup('fullscreen')}
            style={styles.fullScreenButton}>
            <ExpandIcon />
            <T v="display" style={styles.fullScreenLabel}>
              FULL SCREEN
            </T>
          </BevelButton>
        ) : null}
        <View style={styles.flipRow}>
          <T style={styles.flipLabel}>Bass side on the right</T>
          <Switch
            accessibilityLabel="Bass side on the right"
            value={s.flipped}
            onValueChange={s.setFlipped}
            trackColor={{ true: Palette.brass, false: Palette.lcdBg }}
            thumbColor={Palette.maple}
            ios_backgroundColor={Palette.lcdBg}
          />
        </View>
      </View>

      {result.ok ? (
        <>
          <View style={styles.summary}>
            <Readout label="GAP BETWEEN STRINGS" value={formatLength(result.gap, s.outputUnit)} />
            <Readout label="OUTER SLOT SPAN" value={formatLength(result.span, s.outputUnit)} />
          </View>
          <ResultsTable slots={result.slots} unit={s.outputUnit} />
          <TextLink onPress={() => setPopup('calculation')} style={styles.calcLink}>
            HOW IT WAS CALCULATED ?
          </TextLink>
        </>
      ) : null}

      <OffsetHelpDialog visible={popup === 'offsets'} onClose={closePopup} />
      <GuitarWidthDialog
        visible={popup === 'guitars'}
        current={s.width}
        unit={unit}
        onPick={s.setWidth}
        onClose={closePopup}
      />
      {result.ok ? (
        <FullScreenDiagram
          visible={popup === 'fullscreen'}
          onClose={closePopup}
          title={`${setName.toUpperCase()} · ${formatLength(s.width, s.outputUnit)}`}
          width={s.width}
          slots={result.slots}
          gap={result.gap}
          unit={s.outputUnit}
          onUnit={s.setOutputUnit}
          flipped={s.flipped}
          onFlip={s.setFlipped}
        />
      ) : null}
      {working ? (
        <CalculationDialog
          visible={popup === 'calculation'}
          onClose={closePopup}
          breakdown={working}
          {...input}
          unit={s.outputUnit}
        />
      ) : null}
    </Screen>
  );
}

function ExpandIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke={Palette.ink}
      strokeWidth={2}
      aria-hidden>
      <Path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
    </Svg>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.readout, bevel.out]} accessible accessibilityLabel={`${label}: ${value}`}>
      <T v="display" style={styles.readoutLabel}>
        {label}
      </T>
      <Lcd style={styles.readoutLcd}>
        <T v="lcd" style={styles.readoutValue} adjustsFontSizeToFit numberOfLines={1}>
          {value.replace(' mm', 'mm')}
        </T>
      </Lcd>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: { paddingHorizontal: 8, gap: 0, backgroundColor: Palette.chip },
  chipActive: { backgroundColor: Palette.brass },
  byGuitar: { fontSize: 11 },
  helpLink: { marginTop: -4 },
  calcLink: {
    alignSelf: 'center',
    backgroundColor: Palette.maple,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  offsets: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, gap: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepButton: { width: 36, minHeight: 30, height: 30, paddingHorizontal: 0 },
  stepLabel: { fontSize: 16 },
  count: { minWidth: 34, height: 26, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 18, lineHeight: 22, color: Palette.lcd },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    backgroundColor: Palette.paper,
  },
  setText: { flex: 1, gap: 2 },
  setName: { fontSize: 16 },
  setGauges: { fontSize: 14, color: Palette.inkSoft },
  edit: { fontSize: 12, color: Palette.rust },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  panel: { backgroundColor: Palette.panel, padding: 10, gap: 10 },
  diagram: { paddingTop: 10, paddingBottom: 6, paddingHorizontal: 6 },
  errors: { minHeight: 112, justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  errorText: { fontSize: 15, lineHeight: 20, color: Palette.lcd },
  fullScreenButton: { backgroundColor: Palette.maple },
  fullScreenLabel: { fontSize: 13 },
  flipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 4,
  },
  flipLabel: { fontSize: 14, color: Palette.cream },
  summary: { flexDirection: 'row', gap: 10 },
  readout: { flex: 1, backgroundColor: Palette.panel, padding: 8, gap: 6 },
  readoutLabel: { fontSize: 11, letterSpacing: 1, color: Palette.cream },
  readoutLcd: { paddingHorizontal: 10, paddingVertical: 2 },
  readoutValue: { fontSize: 26, lineHeight: 32, color: Palette.lcd, textAlign: 'right' },
});
