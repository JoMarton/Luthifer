import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Luthifer' }} />
        <Stack.Screen
          name="nut/index"
          options={{ title: 'Nut Slot Calculator', headerBackTitle: 'Tools' }}
        />
        <Stack.Screen name="nut/strings" options={{ title: 'Strings', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
