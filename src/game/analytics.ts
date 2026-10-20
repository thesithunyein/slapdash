/**
 * Privacy-friendly gameplay telemetry & quality assurance metrics
 * Zero external tracking, zero PII, zero cookies.
 */

export interface GameMetrics {
  totalRuns: number;
  totalSlaps: number;
  highestCombo: number;
  bustedCount: number;
  exhaustedCount: number;
  stagesCleared: number;
  lastPlayed: string;
}

const METRICS_STORAGE_KEY = 'slap_dash_telemetry_metrics';

export function loadGameMetrics(): GameMetrics {
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalRuns: 0,
    totalSlaps: 0,
    highestCombo: 0,
    bustedCount: 0,
    exhaustedCount: 0,
    stagesCleared: 0,
    lastPlayed: new Date().toISOString(),
  };
}

export function trackGameEvent(event: 'run_start' | 'stage_clear' | 'game_over', meta?: { reason?: string; score?: number; slaps?: number; combo?: number }): void {
  const metrics = loadGameMetrics();
  metrics.lastPlayed = new Date().toISOString();

  if (event === 'run_start') {
    metrics.totalRuns++;
  } else if (event === 'stage_clear') {
    metrics.stagesCleared++;
  } else if (event === 'game_over') {
    if (meta?.reason === 'BUSTED') metrics.bustedCount++;
    if (meta?.reason === 'EXHAUSTED') metrics.exhaustedCount++;
    if (meta?.slaps) metrics.totalSlaps += meta.slaps;
    if (meta?.combo && meta.combo > metrics.highestCombo) metrics.highestCombo = meta.combo;
  }

  try {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  } catch {}

  // Non-blocking server-side telemetry sync
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, reason: meta?.reason, score: meta?.score }),
    }).catch(() => {});
  } catch {}
}
