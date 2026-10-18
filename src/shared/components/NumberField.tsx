import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A text field for a number. Keeps the user's text while they type and only
 * reports values that parse. When `value` changes from outside (a preset, a unit
 * switch), the text is replaced with `format(value)`.
 */
export function NumberField({
  label,
  hint,
  value,
  onChange,
  parse,
  format,
  suffix,
  invalid,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  parse: (text: string) => number;
  format: (v: number) => string;
  suffix?: string;
  invalid?: boolean;
}) {
  const theme = useTheme();
  const [text, setText] = useState(() => format(value));

  // When the value or unit changes, replace the text unless it already shows that value
  // (which is the case while the user is typing it).
  const [prev, setPrev] = useState({ value, format });
  if (prev.value !== value || prev.format !== format) {
    setPrev({ value, format });
    const typed = parse(text);
    if (!Number.isFinite(typed) || format(typed) !== format(value)) setText(format(value));
  }

  const typedValue = parse(text);
  const bad = invalid || !Number.isFinite(typedValue);

  return (
    <View style={styles.row}>
      <View style={styles.labels}>
        <ThemedText type="small">{label}</ThemedText>
        {hint ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            {hint}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: bad ? theme.danger : 'transparent',
          },
        ]}>
        <TextInput
          accessibilityLabel={label}
          value={text}
          onChangeText={(t) => {
            setText(t);
            const v = parse(t);
            if (Number.isFinite(v)) onChange(v);
          }}
          onBlur={() => {
            if (Number.isFinite(parse(text))) setText(format(parse(text)));
            else setText(format(value));
          }}
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
          selectTextOnFocus
          style={[styles.input, { color: theme.text }]}
        />
        {suffix ? (
          <ThemedText type="small" themeColor="textSecondary">
            {suffix}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labels: { flex: 1 },
  hint: { fontSize: 12, lineHeight: 16 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    width: 136,
    gap: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: Fonts.mono,
    textAlign: 'right',
  },
});
