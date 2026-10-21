export function trackGameEvent(event: string, payload?: Record<string, unknown>): void {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload }),
    }).catch(() => {});
  } catch {}
}
