import { StatusBar } from 'expo-status-bar';
import { Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';
import { bevel, BevelButton, Lcd, T } from '@/shared/components/retro';
import { UnitToggle } from '@/shared/components/UnitToggle';
import { formatLength, type LengthUnit } from '@/shared/units';
import { NutDiagram } from '@/tools/nut/NutDiagram';
import type { Slot } from '@/tools/nut/spacing';

const HEADER = 44;
/** Tallest the diagram gets at zoom 1 (four rows of slot positions). */
const DIAGRAM_HEIGHT = 216;

/**
 * The nut diagram filling the whole screen sideways. On a phone held upright the
 * view is turned 90° so it reads with the phone rotated, without changing the
 * app's orientation.
 */
export function FullScreenDiagram({
  visible,
  onClose,
  title,
  width,
  slots,
  gap,
  unit,
  onUnit,
  flipped,
  onFlip,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  width: number;
  slots: Slot[];
  gap: number;
  unit: LengthUnit;
  onUnit: (u: LengthUnit) => void;
  flipped: boolean;
  onFlip: (f: boolean) => void;
}) {
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rotate = screen.height > screen.width;
  const long = Math.max(screen.width, screen.height);
  const short = Math.min(screen.width, screen.height);

  // When turned, the notch side of the screen becomes the left edge of the view.
  const pad = rotate
    ? { left: insets.top + 8, right: insets.bottom + 8, top: 12, bottom: 12 }
    : {
        left: insets.left + 12,
        right: insets.right + 12,
        top: insets.top + 8,
        bottom: insets.bottom + 8,
      };
  const room = short - pad.top - pad.bottom - HEADER - 36;
  const zoom = Math.max(1, Math.min(2.4, room / DIAGRAM_HEIGHT));

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.backdrop}>
        <View
          style={[
            styles.frame,
            {
              width: long,
              height: short,
              paddingLeft: pad.left,
              paddingRight: pad.right,
              paddingTop: pad.top,
              paddingBottom: pad.bottom,
            },
            rotate && styles.rotated,
          ]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <T v="display" style={styles.title} numberOfLines={1}>
                {title}
              </T>
              <T v="lcd" style={styles.gap} numberOfLines={1}>
                GAP {formatLength(gap, unit)}
              </T>
            </View>
            <UnitToggle value={unit} onChange={onUnit} accessibilityLabel="Result unit" />
            <BevelButton
              flat
              down={flipped}
              accessibilityLabel="Bass side on the right"
              onPress={() => onFlip(!flipped)}
              style={styles.headerButton}>
              <T v="display" style={styles.buttonLabel}>
                FLIP
              </T>
            </BevelButton>
            <BevelButton
              flat
              accessibilityLabel="Close full screen"
              onPress={onClose}
              style={styles.headerButton}>
              <T v="display" style={styles.buttonLabel}>
                X
              </T>
            </BevelButton>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <View style={[styles.panel, bevel.out]}>
              <Lcd style={styles.lcd}>
                <NutDiagram width={width} slots={slots} unit={unit} flipped={flipped} zoom={zoom} />
              </Lcd>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.wood,
  },
  frame: { gap: 10, backgroundColor: Palette.wood },
  rotated: { transform: [{ rotate: '90deg' }] },
  header: {
    height: HEADER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 4,
    backgroundColor: Palette.titleTo,
    backgroundImage: `linear-gradient(90deg, ${Palette.titleFrom}, ${Palette.titleTo})`,
  },
  headerText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { flexShrink: 1, color: Palette.titleText, letterSpacing: 1 },
  gap: { fontSize: 20, color: Palette.lcd },
  headerButton: { minHeight: 30, height: 30, paddingHorizontal: 10 },
  buttonLabel: { fontSize: 11 },
  body: { flexGrow: 1, justifyContent: 'center' },
  panel: { backgroundColor: Palette.panel, padding: 8 },
  lcd: { paddingTop: 10, paddingBottom: 6, paddingHorizontal: 6 },
});
