const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL;

/**
 * Optional gameplay telemetry. Disabled unless VITE_ANALYTICS_URL is set, so the
 * submitted build makes no network requests other than the Google Fonts stylesheet.
 */
export function trackGameEvent(event: string, payload?: Record<string, unknown>): void {
  if (!ANALYTICS_URL) return;
  try {
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload }),
    }).catch(() => {});
  } catch {}
}
