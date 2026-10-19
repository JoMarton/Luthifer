/* eslint-disable @typescript-eslint/no-require-imports */

const mockCapture = jest.fn();
const mockOptIn = jest.fn();
const mockOptOut = jest.fn();
const mockCtor = jest.fn();

jest.mock('posthog-react-native', () => ({
  __esModule: true,
  default: class {
    constructor(key: string, options: object) {
      mockCtor(key, options);
    }
    capture = mockCapture;
    optIn = mockOptIn;
    optOut = mockOptOut;
  },
}));

function load(available: boolean) {
  let mod!: typeof import('@/shared/analytics');
  jest.isolateModules(() => {
    jest.doMock('@/shared/analytics-config', () => ({
      ANALYTICS_AVAILABLE: available,
      POSTHOG_KEY: 'phc_test',
      POSTHOG_HOST: 'https://eu.i.posthog.com',
    }));
    mod = require('@/shared/analytics');
  });
  return mod;
}

beforeEach(() => jest.clearAllMocks());

describe('analytics', () => {
  it('sends app_opened on start and only the events it is given', () => {
    const a = load(true);
    a.startAnalytics(true);

    expect(mockCtor).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        captureAppLifecycleEvents: false,
        enableSessionReplay: false,
        personProfiles: 'never',
        defaultOptIn: true,
      }),
    );
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith('app_opened', undefined);

    a.track({ name: 'tool_opened', props: { tool: 'nut' } });
    expect(mockCapture).toHaveBeenLastCalledWith('tool_opened', { tool: 'nut' });
  });

  it('stops sending when the user opts out, and resumes when they opt back in', () => {
    const a = load(true);
    a.startAnalytics(true);
    mockCapture.mockClear();

    a.setAnalyticsEnabled(false);
    expect(mockOptOut).toHaveBeenCalled();
    a.track({ name: 'tool_opened', props: { tool: 'nut' } });
    expect(mockCapture).not.toHaveBeenCalled();

    a.setAnalyticsEnabled(true);
    expect(mockOptIn).toHaveBeenCalled();
    a.track({ name: 'tool_opened', props: { tool: 'nut' } });
    expect(mockCapture).toHaveBeenCalledTimes(1);
  });

  it('respects a saved opt-out from the first launch', () => {
    const a = load(true);
    a.startAnalytics(false);
    expect(mockCtor).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({ defaultOptIn: false }),
    );
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('does nothing without a key, in development or under tests', () => {
    const a = load(false);
    a.startAnalytics(true);
    a.track({ name: 'tool_opened', props: { tool: 'nut' } });
    expect(mockCtor).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });
});
