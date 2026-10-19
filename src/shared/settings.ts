import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setAnalyticsEnabled } from '@/shared/analytics';

/** App-wide settings (tool inputs live in each tool's own store). */
type SettingsState = {
  /** Share anonymous usage data. On by default; the user can turn it off. */
  analytics: boolean;
  setAnalytics: (on: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      analytics: true,
      setAnalytics: (analytics) => {
        set({ analytics });
        setAnalyticsEnabled(analytics);
      },
    }),
    {
      name: 'app/settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ analytics }) => ({ analytics }),
    },
  ),
);
