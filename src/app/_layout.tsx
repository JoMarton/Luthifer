import {
  Bitter_400Regular,
  Bitter_400Regular_Italic,
  Bitter_600SemiBold,
  Bitter_700Bold,
} from '@expo-google-fonts/bitter';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Palette } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Bitter_400Regular,
    Bitter_400Regular_Italic,
    Bitter_600SemiBold,
    Bitter_700Bold,
    Silkscreen_400Regular,
    Silkscreen_700Bold,
    VT323_400Regular,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Fall back to system fonts rather than a blank screen if the fonts fail to load.
  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.wood } }}>
        <Stack.Screen name="index" options={{ title: 'Luthifer' }} />
        <Stack.Screen name="nut/index" options={{ title: 'Nut Slot Calculator' }} />
        <Stack.Screen name="nut/strings" options={{ title: 'String sets' }} />
      </Stack>
    </>
  );
}
