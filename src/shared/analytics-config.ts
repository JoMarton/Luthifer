/**
 * Anonymous usage analytics (PostHog), shared by the app and web versions.
 *
 * Only three events are sent. PostHog adds the device, OS / browser, app version
 * and approximate location (from the IP address) itself.
 */
export type AnalyticsEvent =
  | { name: 'app_opened'; props?: undefined }
  | { name: 'tool_opened'; props: { tool: string } }
  | {
      name: 'results_viewed';
      props: {
        tool: 'nut';
        string_count: number;
        /** Preset id, or "custom" — never a saved set's name. */
        string_set: string;
        input_unit: 'in' | 'mm';
        result_unit: 'in' | 'mm';
      };
    };

/** Public project key and region, set in .env as EXPO_PUBLIC_POSTHOG_KEY / _HOST. */
export const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
export const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

/** Off without a key, in development and under Jest, so only real use is counted. */
export const ANALYTICS_AVAILABLE =
  POSTHOG_KEY.length > 0 && !__DEV__ && process.env.NODE_ENV !== 'test';
