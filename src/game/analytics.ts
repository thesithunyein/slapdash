/**
 * Optional, privacy-safe gameplay telemetry.
 *
 * The game ships with telemetry DISABLED. Nothing is sent anywhere unless the
 * build explicitly sets VITE_ANALYTICS_URL to an endpoint the team owns.
 * This keeps the static Digit7 hosting deployment free of failing requests and
 * free of any hidden tracking (Digit7 Jam technical guide, section 7.7).
 */
const ANALYTICS_URL: string | undefined = import.meta.env.VITE_ANALYTICS_URL;

export function trackGameEvent(event: string, payload?: Record<string, unknown>): void {
  if (!ANALYTICS_URL) return;

  try {
    const body = JSON.stringify({ event, ...payload, ts: Date.now() });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ANALYTICS_URL, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Telemetry must never break gameplay.
  }
}
