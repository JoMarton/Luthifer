/**
 * Web analytics, with the same interface as analytics.ts (native).
 */
import { posthog } from 'posthog-js';

import {
  ANALYTICS_AVAILABLE,
  POSTHOG_HOST,
  POSTHOG_KEY,
  type AnalyticsEvent,
} from '@/shared/analytics-config';

let started = false;
let enabled = true;

/** Call once at startup with the user's saved choice. */
export function startAnalytics(userEnabled: boolean) {
  enabled = userEnabled;
  if (!ANALYTICS_AVAILABLE || started) return;
  started = true;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // An anonymous ID in localStorage (no cookies) so returning visitors count once.
    persistence: 'localStorage',
    // Only the events we send ourselves.
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    capture_performance: false,
    rageclick: false,
    enable_heatmaps: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    person_profiles: 'never',
    opt_out_capturing_by_default: !userEnabled,
  });

  track({ name: 'app_opened' });
}

export function track(event: AnalyticsEvent) {
  if (!started || !enabled) return;
  posthog.capture(event.name, event.props);
}

export function setAnalyticsEnabled(on: boolean) {
  enabled = on;
  if (!started) return;
  if (on) posthog.opt_in_capturing();
  else posthog.opt_out_capturing();
}
