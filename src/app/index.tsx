import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';
import { bevel, Screen, T, Window } from '@/shared/components/retro';
import { TOOLS } from '@/tools';

const DRAWER_SLOTS = 3;

export default function HomeScreen() {
  // Placeholders for tools still to come; the first tool has its own wide card.
  const empty = Math.max(0, DRAWER_SLOTS - (TOOLS.length - 1));

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.plaque, bevel.out]}>
          <View style={[styles.screw, styles.screwLeft]} />
          <View style={[styles.screw, styles.screwRight]} />
          <T v="displayBold" accessibilityRole="header" style={styles.wordmark}>
            LUTHIFER
          </T>
          <T v="display" style={styles.tagline}>
            LUTHIER HELPER TOOLS
          </T>
        </View>
      </View>

      <Window
        title="C:\WORKSHOP\TOOLS"
        right={
          <View style={styles.winButtons} aria-hidden>
            <View style={[styles.winButton, bevel.outFlat]} />
            <View style={[styles.winButton, bevel.outFlat]} />
          </View>
        }
        style={styles.drawer}
        bodyStyle={styles.drawerBody}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            accessibilityRole="link"
            accessibilityLabel={`${tool.title}. ${tool.description}`}
            onPress={() => router.push(tool.route)}
            style={({ pressed }) => [styles.tool, pressed ? bevel.in : bevel.out]}>
            <tool.Icon />
            <View style={styles.toolText}>
              <T v="bodyBold" style={styles.toolTitle}>
                {tool.title}
              </T>
              <T style={styles.toolDescription}>{tool.description}</T>
            </View>
            <T v="display" style={styles.chevron}>
              &gt;
            </T>
          </Pressable>
        ))}

        <View style={styles.slots}>
          {Array.from({ length: empty }, (_, i) => (
            <View key={i} style={[styles.slot, bevel.in]}>
              <T v="display" style={styles.slotText}>
                {'EMPTY\nSLOT'}
              </T>
            </View>
          ))}
        </View>
        <T v="bodyItalic" style={styles.more}>
          More tools coming.
        </T>
        <View style={styles.spacer} />
        <View style={styles.statusBar}>
          <T v="lcd" style={[styles.statusCell, bevel.in, styles.statusGrow]}>
            {TOOLS.length} tool{TOOLS.length === 1 ? '' : 's'} installed
          </T>
          <T v="lcd" style={[styles.statusCell, bevel.in]}>
            Ready
          </T>
        </View>
      </Window>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20 },
  header: { alignItems: 'center' },
  plaque: {
    backgroundColor: Palette.brass,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 4,
  },
  screw: {
    position: 'absolute',
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6E4B1A',
    boxShadow: 'inset 1px 1px 0px #F3D995',
  },
  screwLeft: { left: 7 },
  screwRight: { right: 7 },
  wordmark: {
    fontFamily: Fonts.wordmark,
    fontSize: 34,
    letterSpacing: 3,
    color: '#2A1606',
    textShadowColor: Palette.brassLight,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  tagline: { fontSize: 12, letterSpacing: 2, color: '#3A2410' },
  drawer: { flex: 1 },
  drawerBody: { flex: 1, gap: 12, paddingBottom: 4, paddingHorizontal: 14 },
  winButtons: { flexDirection: 'row', gap: 4 },
  winButton: { width: 14, height: 12, backgroundColor: Palette.maple },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    minHeight: 44,
    backgroundColor: Palette.paper,
  },
  toolText: { flex: 1, gap: 4 },
  toolTitle: { fontSize: 18, lineHeight: 22 },
  toolDescription: { fontSize: 14, lineHeight: 19, color: Palette.inkSoft },
  chevron: { fontSize: 18, color: Palette.rust },
  slots: { flexDirection: 'row', gap: 10 },
  slot: {
    flex: 1,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74,44,26,0.08)',
  },
  slotText: { fontSize: 11, color: Palette.inkMuted, textAlign: 'center' },
  more: { textAlign: 'center' },
  spacer: { flex: 1 },
  statusBar: { flexDirection: 'row', gap: 4, marginHorizontal: -10, marginBottom: -2 },
  statusCell: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 15, color: '#3A2410' },
  statusGrow: { flex: 1 },
});
