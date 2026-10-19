import { useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';
import { bevel, T } from '@/shared/components/retro';

/**
 * A sunken text field for a number. Keeps the user's text while they type and only
 * reports values that parse. When `value` changes from outside (a preset, a unit
 * switch), the text is replaced with `format(value)`.
 */
export function NumberField({
  accessibilityLabel,
  value,
  onChange,
  parse,
  format,
  suffix,
  invalid,
  style,
}: {
  accessibilityLabel: string;
  value: number;
  onChange: (v: number) => void;
  parse: (text: string) => number;
  format: (v: number) => string;
  suffix?: string;
  invalid?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [text, setText] = useState(() => format(value));
  const [focused, setFocused] = useState(false);

  // When the value or unit changes, replace the text unless it already shows that value
  // (which is the case while the user is typing it).
  const [prev, setPrev] = useState({ value, format });
  if (prev.value !== value || prev.format !== format) {
    setPrev({ value, format });
    const typed = parse(text);
    if (!Number.isFinite(typed) || format(typed) !== format(value)) setText(format(value));
  }

  const bad = invalid || !Number.isFinite(parse(text));

  return (
    <View
      style={[
        styles.box,
        bevel.in,
        { backgroundColor: focused ? Palette.fieldFocus : Palette.field },
        bad && styles.bad,
        style,
      ]}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        value={text}
        onChangeText={(t) => {
          setText(t);
          const v = parse(t);
          if (Number.isFinite(v)) onChange(v);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (Number.isFinite(parse(text))) setText(format(parse(text)));
          else setText(format(value));
        }}
        keyboardType="numbers-and-punctuation"
        returnKeyType="done"
        selectTextOnFocus
        style={styles.input}
      />
      {suffix ? (
        <T v="lcd" style={styles.suffix}>
          {suffix}
        </T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 10, gap: 6 },
  bad: { borderColor: Palette.bassRed },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    fontFamily: Fonts.lcd,
    fontSize: 18,
    color: Palette.ink,
    textAlign: 'right',
  },
  suffix: { fontSize: 16, color: Palette.inkMuted },
});
