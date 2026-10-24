import { describe, expect, it } from 'vitest';
import {
  DESKTOP_OBSTACLE_RULES,
  TOUCH_OBSTACLE_RULES,
  getObstacleRule,
  resolveCorridorSpawn,
  resolveObstacleSpawn,
} from '../src/game/obstacleDensity.ts';

/** Deterministic PRNG so distribution checks are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

describe('obstacle density rule table', () => {
  it('leaves the first 40 metres clear in both modes', () => {
    for (const touch of [false, true]) {
      expect(resolveObstacleSpawn(0, touch, () => 0)).toEqual({ isObstacleSegment: false, laneCount: 0 });
      expect(resolveObstacleSpawn(40, touch, () => 0)).toEqual({ isObstacleSegment: false, laneCount: 0 });
      expect(getObstacleRule(40, touch)).toBeNull();
      expect(getObstacleRule(40.1, touch)).toEqual(
        touch ? TOUCH_OBSTACLE_RULES.opening : DESKTOP_OBSTACLE_RULES.opening
      );
    }
  });

  it('uses the gentler desktop curve', () => {
    expect(DESKTOP_OBSTACLE_RULES.opening).toEqual({ chance: 0.55, oneLaneShare: 1 });
    expect(DESKTOP_OBSTACLE_RULES.mid).toEqual({ chance: 0.65, oneLaneShare: 0.85 });
    expect(DESKTOP_OBSTACLE_RULES.late).toEqual({ chance: 0.75, oneLaneShare: 0.7 });
    expect(getObstacleRule(50, false)).toEqual(DESKTOP_OBSTACLE_RULES.opening);
    expect(getObstacleRule(80, false)).toEqual(DESKTOP_OBSTACLE_RULES.opening);
    expect(getObstacleRule(80.1, false)).toEqual(DESKTOP_OBSTACLE_RULES.mid);
    expect(getObstacleRule(250, false)).toEqual(DESKTOP_OBSTACLE_RULES.mid);
    expect(getObstacleRule(250.1, false)).toEqual(DESKTOP_OBSTACLE_RULES.late);
  });

  it('uses the lighter touch curve', () => {
    expect(TOUCH_OBSTACLE_RULES.opening).toEqual({ chance: 0.42, oneLaneShare: 1 });
    expect(TOUCH_OBSTACLE_RULES.mid).toEqual({ chance: 0.52, oneLaneShare: 1 });
    expect(TOUCH_OBSTACLE_RULES.late).toEqual({ chance: 0.62, oneLaneShare: 0.9 });
    expect(getObstacleRule(50, true)).toEqual(TOUCH_OBSTACLE_RULES.opening);
    expect(getObstacleRule(120, true)).toEqual(TOUCH_OBSTACLE_RULES.mid);
    expect(getObstacleRule(600, true)).toEqual(TOUCH_OBSTACLE_RULES.late);
  });

  it('rolls desktop thresholds on the new bands', () => {
    // Opening band: one lane, 55% chance.
    expect(resolveObstacleSpawn(50, false, sequence(0.54))).toEqual({ isObstacleSegment: true, laneCount: 1 });
    expect(resolveObstacleSpawn(50, false, sequence(0.55))).toEqual({ isObstacleSegment: false, laneCount: 0 });

    // Mid band: 65% chance, 85% of obstacle segments use one lane.
    expect(resolveObstacleSpawn(100, false, sequence(0.64, 0.84))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(100, false, sequence(0.64, 0.85))).toEqual({
      isObstacleSegment: true,
      laneCount: 2,
    });

    // Late band: 75% chance, 70% one lane.
    expect(resolveObstacleSpawn(300, false, sequence(0.74, 0.69))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(300, false, sequence(0.74, 0.7))).toEqual({
      isObstacleSegment: true,
      laneCount: 2,
    });
  });

  it('rolls touch thresholds with a single lane before 250m and 10% doubles after', () => {
    expect(resolveObstacleSpawn(50, true, sequence(0.41))).toEqual({ isObstacleSegment: true, laneCount: 1 });
    expect(resolveObstacleSpawn(50, true, sequence(0.42))).toEqual({ isObstacleSegment: false, laneCount: 0 });

    // Mid band never uses two lanes, even if the lane roll is huge.
    expect(resolveObstacleSpawn(150, true, sequence(0.51, 0.99))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });

    expect(resolveObstacleSpawn(300, true, sequence(0.61, 0.89))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(300, true, sequence(0.61, 0.9))).toEqual({
      isObstacleSegment: true,
      laneCount: 2,
    });
  });

  it('never occupies all three lanes in either mode', () => {
    const rand = mulberry32(7);
    let maxLanes = 0;
    for (let i = 0; i < 20_000; i++) {
      const distance = rand() * 900;
      for (const touch of [false, true]) {
        maxLanes = Math.max(maxLanes, resolveObstacleSpawn(distance, touch, rand).laneCount);
      }
    }
    expect(maxLanes).toBe(2);
  });
});

describe('obstacle density distributions', () => {
  it('desktop keeps roughly 55/65/75 percent obstacle coverage', () => {
    const rand = mulberry32(11);
    const bands = [
      { distance: 50, chance: 0.55 },
      { distance: 150, chance: 0.65 },
      { distance: 400, chance: 0.75 },
    ];
    for (const band of bands) {
      let obstacles = 0;
      const trials = 20_000;
      for (let i = 0; i < trials; i++) {
        if (resolveObstacleSpawn(band.distance, false, rand).isObstacleSegment) obstacles++;
      }
      expect(obstacles / trials).toBeCloseTo(band.chance, 1);
    }
  });

  it('touch reduces coverage to roughly 42/52/62 percent', () => {
    const rand = mulberry32(13);
    const bands = [
      { distance: 50, chance: 0.42 },
      { distance: 150, chance: 0.52 },
      { distance: 400, chance: 0.62 },
    ];
    for (const band of bands) {
      let obstacles = 0;
      const trials = 20_000;
      for (let i = 0; i < trials; i++) {
        if (resolveObstacleSpawn(band.distance, true, rand).isObstacleSegment) obstacles++;
      }
      expect(obstacles / trials).toBeCloseTo(band.chance, 1);
    }
  });

  it('touch late game uses two lanes about 10% of the time', () => {
    const rand = mulberry32(17);
    let obstacleSegments = 0;
    let doubleLaneSegments = 0;
    for (let i = 0; i < 60_000; i++) {
      const decision = resolveObstacleSpawn(400, true, rand);
      if (!decision.isObstacleSegment) continue;
      obstacleSegments++;
      if (decision.laneCount === 2) doubleLaneSegments++;
    }
    expect(doubleLaneSegments / obstacleSegments).toBeCloseTo(0.1, 1);
  });
});

describe('reachable corridor', () => {
  it('never moves the open lane more than one lane between segments', () => {
    const rand = mulberry32(23);
    let previous: number | null = null;
    let outOfRangeFreeLane = 0;
    let wrongBlockerCount = 0;
    let blockedFreeLane = 0;
    let unreachableJump = 0;

    for (let i = 0; i < 10_000; i++) {
      const laneCount = rand() < 0.7 ? 1 : 2;
      const corridor = resolveCorridorSpawn(previous, laneCount, rand);

      if (corridor.freeLane < 0 || corridor.freeLane > 2) outOfRangeFreeLane++;
      if (corridor.occupiedLanes.length !== laneCount) wrongBlockerCount++;
      if (corridor.occupiedLanes.includes(corridor.freeLane)) blockedFreeLane++;
      if (previous !== null && Math.abs(corridor.freeLane - previous) > 1) unreachableJump++;

      previous = corridor.freeLane;
    }

    expect(outOfRangeFreeLane).toBe(0);
    expect(wrongBlockerCount).toBe(0);
    expect(blockedFreeLane).toBe(0);
    expect(unreachableJump).toBe(0);
  });

  it('always leaves a lane open, even for a two-lane block', () => {
    const rand = mulberry32(29);
    let overlappingLanes = 0;
    let wrongCount = 0;

    for (let i = 0; i < 5_000; i++) {
      const corridor = resolveCorridorSpawn(i % 3, 2, rand);
      if (new Set(corridor.occupiedLanes).size !== 2) overlappingLanes++;
      if (corridor.occupiedLanes.length !== 2) wrongCount++;
      if (corridor.occupiedLanes.includes(corridor.freeLane)) wrongCount++;
    }

    expect(overlappingLanes).toBe(0);
    expect(wrongCount).toBe(0);
  });
});
