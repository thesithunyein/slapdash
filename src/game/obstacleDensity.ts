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

/** Desktop: enough room to read the corridor at every speed. */
export const DESKTOP_OBSTACLE_RULES: ObstacleDensityTable = {
  opening: { chance: 0.55, oneLaneShare: 1 },
  mid: { chance: 0.65, oneLaneShare: 0.85 },
  late: { chance: 0.75, oneLaneShare: 0.7 },
};

/** Touch-only curve: fewer obstacles and almost always a single occupied lane. */
export const TOUCH_OBSTACLE_RULES: ObstacleDensityTable = {
  opening: { chance: 0.42, oneLaneShare: 1 },
  mid: { chance: 0.52, oneLaneShare: 1 },
  late: { chance: 0.62, oneLaneShare: 0.9 },
};

export interface ObstacleSpawnDecision {
  isObstacleSegment: boolean;
  /** 0 when the segment is empty, otherwise 1 or 2 (a 3-lane road keeps one open). */
  laneCount: number;
}

export function getObstacleRule(distance: number, touchInput: boolean): ObstacleRule | null {
  // Safe start: the first 40m never spawn obstacles in either mode.
  if (!Number.isFinite(distance) || distance <= 40) return null;
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

export interface CorridorSpawnDecision {
  /** Lane index (0..laneTotal-1) that stays open. */
  freeLane: number;
  /** Lane indices that carry blockers, never including `freeLane`. */
  occupiedLanes: number[];
}

/**
 * Places blockers so the open lane is never more than one lane away from the
 * previous segment's open lane. A 3-lane road with a 2-lane block therefore
 * always leaves a route the player can physically reach in one move.
 *
 * `rand` is injected so the corridor can be simulated deterministically.
 */
export function resolveCorridorSpawn(
  previousFreeLane: number | null,
  laneCount: number,
  rand: () => number = Math.random,
  laneTotal: number = 3
): CorridorSpawnDecision {
  const total = Math.max(1, Math.floor(laneTotal));
  const previous =
    previousFreeLane === null
      ? Math.min(total - 1, Math.floor(rand() * total))
      : Math.min(total - 1, Math.max(0, Math.floor(previousFreeLane)));

  // Keep the escape route within one lane of where it was, so it is reachable
  // without a two-lane dash between segments.
  const minFree = Math.max(0, previous - 1);
  const maxFree = Math.min(total - 1, previous + 1);
  const freeLane = Math.min(maxFree, minFree + Math.floor(rand() * (maxFree - minFree + 1)));

  const pool: number[] = [];
  for (let lane = 0; lane < total; lane++) {
    if (lane !== freeLane) pool.push(lane);
  }

  const occupiedLanes: number[] = [];
  const count = Math.min(Math.max(0, Math.floor(laneCount)), pool.length);
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(rand() * pool.length);
    occupiedLanes.push(pool.splice(pick, 1)[0]);
  }

  return { freeLane, occupiedLanes };
}
