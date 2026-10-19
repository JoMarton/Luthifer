/**
 * Native (iOS / Android) analytics. The web version is analytics.web.ts.
 * Screens only use `startAnalytics`, `track` and `setAnalyticsEnabled`.
 */
import { AppState } from 'react-native';
import PostHog from 'posthog-react-native';

import {
  ANALYTICS_AVAILABLE,
  POSTHOG_HOST,
  POSTHOG_KEY,
  type AnalyticsEvent,
} from '@/shared/analytics-config';

let client: PostHog | null = null;
let enabled = true;

/** Call once at startup with the user's saved choice. */
export function startAnalytics(userEnabled: boolean) {
  enabled = userEnabled;
  if (!ANALYTICS_AVAILABLE || client) return;

  client = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    persistence: 'file',
    // Only the events we send ourselves: no touch autocapture, no replays.
    captureAppLifecycleEvents: false,
    enableSessionReplay: false,
    personProfiles: 'never',
    defaultOptIn: userEnabled,
  });

  track({ name: 'app_opened' });
  let previous = AppState.currentState;
  AppState.addEventListener('change', (next) => {
    if (previous?.match(/inactive|background/) && next === 'active') track({ name: 'app_opened' });
    previous = next;
  });
}

export function track(event: AnalyticsEvent) {
  if (!client || !enabled) return;
  client.capture(event.name, event.props);
}

export function setAnalyticsEnabled(on: boolean) {
  enabled = on;
  if (!client) return;
  if (on) client.optIn();
  else client.optOut();
}
