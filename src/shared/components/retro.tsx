import { useEffect, useId, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { Fonts, MaxContentWidth, Palette, Spacing } from '@/constants/theme';

/* ---------- Bevels ---------- */

export const bevel = StyleSheet.create({
  /** Raised: light top-left edge, dark bottom-right edge, hard drop shadow. */
  out: {
    borderWidth: 2,
    borderTopColor: Palette.bevelLight,
    borderLeftColor: Palette.bevelLight,
    borderRightColor: Palette.bevelDark,
    borderBottomColor: Palette.bevelDark,
    boxShadow: `1px 1px 0px ${Palette.bevelShadow}`,
  },
  /** Raised without the drop shadow (small title-bar buttons). */
  outFlat: {
    borderWidth: 2,
    borderTopColor: Palette.bevelLight,
    borderLeftColor: Palette.bevelLight,
    borderRightColor: Palette.bevelDark,
    borderBottomColor: Palette.bevelDark,
  },
  /** Sunken: dark top-left edge, light bottom-right edge. */
  in: {
    borderWidth: 2,
    borderTopColor: Palette.bevelDark,
    borderLeftColor: Palette.bevelDark,
    borderRightColor: Palette.bevelLight,
    borderBottomColor: Palette.bevelLight,
  },
});

/* ---------- Text ---------- */

const textVariants = StyleSheet.create({
  /** Pixel font for titles and labels. */
  display: { fontFamily: Fonts.display, fontSize: 12, color: Palette.ink },
  displayBold: { fontFamily: Fonts.displayBold, fontSize: 18, color: Palette.ink },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 20, color: Palette.ink },
  bodyBold: { fontFamily: Fonts.bodyBold, fontSize: 15, lineHeight: 20, color: Palette.ink },
  bodyItalic: { fontFamily: Fonts.bodyItalic, fontSize: 14, color: Palette.inkSoft },
  hint: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16, color: Palette.inkSoft },
  /** Seven-segment-style digits. */
  lcd: { fontFamily: Fonts.lcd, fontSize: 20, color: Palette.ink },
});

export type TextVariant = keyof typeof textVariants;

export function T({ v = 'body', style, ...rest }: TextProps & { v?: TextVariant }) {
  return <Text style={[textVariants[v], style]} {...rest} />;
}

/** Cream pixel heading with a hard shadow, used on the wood background. */
export const engraved: TextStyle = {
  color: Palette.cream,
  textShadowColor: Palette.inkDeep,
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 0,
};

/* ---------- Wood grain ---------- */

type Stripe = { x: number; w: number; color: string };

function Grain({ period, stripes, angle }: { period: number; stripes: Stripe[]; angle: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      <Defs>
        <Pattern
          id={id}
          width={period}
          height={8}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}>
          {stripes.map((s) => (
            <Rect key={s.x} x={s.x} y={0} width={s.w} height={8} fill={s.color} />
          ))}
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Dark walnut grain behind every screen. */
function WoodGrain() {
  return (
    <>
      <Grain
        period={16}
        angle={1}
        stripes={[
          { x: 0, w: 2, color: 'rgba(0,0,0,0.13)' },
          { x: 7, w: 2, color: 'rgba(255,214,160,0.06)' },
        ]}
      />
      <Grain period={28} angle={-1} stripes={[{ x: 0, w: 1, color: 'rgba(0,0,0,0.09)' }]} />
    </>
  );
}

/** Pale maple grain inside windows. */
function MapleGrain() {
  return (
    <Grain
      period={19}
      angle={0}
      stripes={[
        { x: 0, w: 1, color: 'rgba(120,70,20,0.07)' },
        { x: 9, w: 1, color: 'rgba(255,255,255,0.12)' },
      ]}
    />
  );
}

/* ---------- Layout ---------- */

/** A full screen on the wood background, scrolling, clear of the notch. */
export function Screen({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <WoodGrain />
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets>
        {children}
      </ScrollView>
    </View>
  );
}

/** Back button plus a pixel title. */
export function NavBar({
  backLabel,
  onBack,
  title,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
}) {
  return (
    <View style={styles.nav}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Back to ${backLabel.toLowerCase()}`}
        onPress={onBack}
        style={({ pressed }) => [styles.navButton, pressed ? bevel.in : bevel.out]}>
        <T v="display">&lt; {backLabel}</T>
      </Pressable>
      <T v="displayBold" accessibilityRole="header" style={[styles.navTitle, engraved]}>
        {title}
      </T>
    </View>
  );
}

/** The rust title bar on top of every window. */
export function TitleBar({
  title,
  right,
  style,
}: {
  title: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.titleBar, style]}>
      <T v="display" accessibilityRole="header" style={styles.titleText}>
        {title}
      </T>
      {right}
    </View>
  );
}

/** A raised maple window with a title bar. */
export function Window({
  title,
  right,
  children,
  style,
  bodyStyle,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.window, bevel.out, style]}>
      <MapleGrain />
      <TitleBar title={title} right={right} />
      <View style={[styles.windowBody, bodyStyle]}>{children}</View>
    </View>
  );
}

/** A dark display panel with amber digits. */
export function Lcd({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.lcd, style]}>{children}</View>;
}

/* ---------- Controls ---------- */

/** A bevelled button that sinks while pressed (or while `down`). */
export function BevelButton({
  children,
  onPress,
  down,
  disabled,
  accessibilityLabel,
  flat,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  down?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  flat?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: down }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        down || pressed ? bevel.in : flat ? bevel.outFlat : bevel.out,
        disabled && styles.disabled,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

/** Underlined pixel link that opens help or details. */
export function TextLink({
  children,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 12, bottom: 12, left: 4, right: 4 }}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed, style]}>
      <T v="display" style={styles.linkText}>
        {children}
      </T>
    </Pressable>
  );
}

/**
 * On the web, close with Escape from anywhere on the page — not only once focus
 * has moved into the dialog.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active || Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onEscape]);
}

/** A maple window floating over a dimmed screen. The body scrolls when it is tall. */
export function Dialog({
  visible,
  title,
  onClose,
  onShow,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onShow?: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  useEscapeKey(visible, onClose);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={onShow}>
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}>
        <View accessibilityViewIsModal style={[styles.dialog, bevel.out]}>
          <View style={styles.titleBar}>
            <T v="display" accessibilityRole="header" style={styles.titleText}>
              {title}
            </T>
            <BevelButton flat accessibilityLabel="Close" onPress={onClose} style={styles.close}>
              <T v="display">X</T>
            </BevelButton>
          </View>
          <ScrollView
            style={styles.dialogScroll}
            contentContainerStyle={styles.dialogBody}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.wood },
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navButton: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.maple,
  },
  navTitle: { flexShrink: 1, letterSpacing: 1 },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 30,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 4,
    backgroundColor: Palette.titleTo,
    backgroundImage: `linear-gradient(90deg, ${Palette.titleFrom}, ${Palette.titleTo})`,
  },
  titleText: { color: Palette.titleText, letterSpacing: 1 },
  window: { backgroundColor: Palette.maple, overflow: 'hidden' },
  windowBody: { padding: 14, gap: 14 },
  lcd: {
    backgroundColor: Palette.lcdBg,
    borderWidth: 3,
    borderTopColor: Palette.lcdBevelDark,
    borderLeftColor: Palette.lcdBevelDark,
    borderRightColor: Palette.lcdBevelLight,
    borderBottomColor: Palette.lcdBevelLight,
    boxShadow: 'inset 0px 0px 18px rgba(0,0,0,0.7)',
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Palette.maple,
  },
  disabled: { opacity: 0.45 },
  link: { alignSelf: 'flex-start', paddingVertical: 4 },
  linkPressed: { opacity: 0.6 },
  linkText: {
    fontSize: 11,
    color: Palette.rust,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,15,7,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialog: { width: '100%', maxWidth: 420, maxHeight: '100%', backgroundColor: Palette.maple },
  close: { width: 30, minHeight: 26, height: 26, paddingHorizontal: 0 },
  dialogScroll: { flexGrow: 0 },
  dialogBody: { padding: 14, gap: 12 },
});
