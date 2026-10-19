import { test as base, expect, type Request } from '@playwright/test';
import { gunzipSync } from 'node:zlib';

/** Events the page tried to send to PostHog (intercepted, never delivered). */
export type SentEvent = { event: string; properties: Record<string, unknown> };

function decode(req: Request): SentEvent[] {
  const body = req.postDataBuffer();
  if (!body || body.length === 0) return [];
  // PostHog gzips batches (magic bytes 1f 8b) or sends JSON, sometimes base64 form-encoded.
  let text =
    body[0] === 0x1f && body[1] === 0x8b
      ? gunzipSync(body).toString('utf8')
      : body.toString('utf8');
  if (text.startsWith('data=')) {
    text = Buffer.from(decodeURIComponent(text.slice(5)), 'base64').toString('utf8');
  }
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : (parsed.batch ?? [parsed]);
  return list.filter((e: SentEvent) => typeof e?.event === 'string');
}

/**
 * Every test blocks PostHog so test runs never reach real analytics.
 * Requests are answered locally and recorded in `analytics`.
 */
export const test = base.extend<{ analytics: SentEvent[] }>({
  analytics: [
    async ({ page }, use) => {
      const sent: SentEvent[] = [];
      await page.route(/posthog\.com/, async (route) => {
        try {
          sent.push(...decode(route.request()));
        } catch {
          // Not an event batch (e.g. a config request).
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' });
      });
      await use(sent);
    },
    { auto: true },
  ],
});

export { expect };
