/**
 * Obstacle density by distance band.
 *
 * Touch players get a gentler curve than keyboard players: a swipe has to be
 * recognised, travel across the thumb and land in the right lane, while a key
 * press is instant. Fewer back-to-back obstacle segments gives mobile runs the
 * reaction room that a keyboard player does not need.
 *
 * Only obstacle density changes here. Damage, stamina, Fever smashing, ramps,
 * vaultable low obstacles and the post-hit invulnerability window are shared by
 * both input modes, so a collision still hurts instead of ending the run.
 */
export interface ObstacleRule {
  /** Chance that a segment contains any obstacle at all. */
  chance: number;
  /** Share of obstacle segments that occupy a single lane (the rest use two). */
  oneLaneShare: number;
}

export interface ObstacleDensityTable {
  opening: ObstacleRule; // 15m - 80m
  mid: ObstacleRule; // 80m - 250m
  late: ObstacleRule; // 250m+
}

/** Desktop is the original shipped difficulty; do not retune it. */
export const DESKTOP_OBSTACLE_RULES: ObstacleDensityTable = {
  opening: { chance: 0.7, oneLaneShare: 1 },
  mid: { chance: 0.82, oneLaneShare: 0.65 },
  late: { chance: 0.9, oneLaneShare: 0.4 },
};

/** Touch-only curve: fewer obstacles and almost always a single occupied lane. */
export const TOUCH_OBSTACLE_RULES: ObstacleDensityTable = {
  opening: { chance: 0.52, oneLaneShare: 1 },
  mid: { chance: 0.62, oneLaneShare: 1 },
  late: { chance: 0.72, oneLaneShare: 0.85 },
};

export interface ObstacleSpawnDecision {
  isObstacleSegment: boolean;
  /** 0 when the segment is empty, otherwise 1 or 2 (a 3-lane road keeps one open). */
  laneCount: number;
}

export function getObstacleRule(distance: number, touchInput: boolean): ObstacleRule | null {
  // Safe start: the first 15m never spawn obstacles in either mode.
  if (!Number.isFinite(distance) || distance <= 15) return null;
  const table = touchInput ? TOUCH_OBSTACLE_RULES : DESKTOP_OBSTACLE_RULES;
  if (distance <= 80) return table.opening;
  if (distance <= 250) return table.mid;
  return table.late;
}

/**
 * Picks the obstacle layout for one market segment.
 *
 * `rand` is injected so the calls are testable and the engine keeps using
 * Math.random in production.
 */
export function resolveObstacleSpawn(
  distance: number,
  touchInput: boolean,
  rand: () => number = Math.random
): ObstacleSpawnDecision {
  const rule = getObstacleRule(distance, touchInput);
  if (!rule) return { isObstacleSegment: false, laneCount: 0 };

  if (rand() >= rule.chance) return { isObstacleSegment: false, laneCount: 0 };

  // Never occupy more than 2 of the 3 lanes: at least one escape route always
  // stays open, including the two-lane late-game segments.
  const laneCount = rand() < rule.oneLaneShare ? 1 : 2;
  return { isObstacleSegment: true, laneCount };
}
