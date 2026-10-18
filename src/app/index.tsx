import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TOOLS } from '@/tools';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
          Luthier helper tools
        </ThemedText>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            accessibilityRole="link"
            onPress={() => router.push(tool.route)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText style={styles.cardTitle}>{tool.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {tool.description}
            </ThemedText>
          </Pressable>
        ))}
        <ThemedText type="small" themeColor="textSecondary" style={styles.more}>
          More tools coming.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  tagline: { marginBottom: -Spacing.two },
  card: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one },
  cardTitle: { fontSize: 18, fontWeight: 600 },
  more: { textAlign: 'center' },
});
