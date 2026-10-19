import {
  Bitter_400Regular,
  Bitter_400Regular_Italic,
  Bitter_600SemiBold,
  Bitter_700Bold,
} from '@expo-google-fonts/bitter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Palette } from '@/constants/theme';
import { startAnalytics } from '@/shared/analytics';
import { useSettings } from '@/shared/settings';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Bitter_400Regular,
    Bitter_400Regular_Italic,
    Bitter_600SemiBold,
    Bitter_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    Silkscreen_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Start analytics once the user's saved opt-out choice has loaded.
  useEffect(() => {
    const start = () => startAnalytics(useSettings.getState().analytics);
    if (useSettings.persist.hasHydrated()) start();
    else return useSettings.persist.onFinishHydration(start);
  }, []);

  // Native: wait for the bundled fonts (fast), falling back to system fonts on error.
  // Web: render at once and let the fonts swap in — Safari's font-load detection can
  // otherwise hold a blank page for many seconds.
  if (!loaded && !error && Platform.OS !== 'web') return null;

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
