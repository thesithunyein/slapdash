import { describe, expect, it } from 'vitest';
import {
  DESKTOP_OBSTACLE_RULES,
  TOUCH_OBSTACLE_RULES,
  getObstacleRule,
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
  it('leaves the first 15 metres clear in both modes', () => {
    for (const touch of [false, true]) {
      expect(resolveObstacleSpawn(0, touch, () => 0)).toEqual({ isObstacleSegment: false, laneCount: 0 });
      expect(resolveObstacleSpawn(15, touch, () => 0)).toEqual({ isObstacleSegment: false, laneCount: 0 });
      expect(getObstacleRule(15, touch)).toBeNull();
    }
  });

  it('keeps the original desktop curve', () => {
    expect(DESKTOP_OBSTACLE_RULES.opening).toEqual({ chance: 0.7, oneLaneShare: 1 });
    expect(DESKTOP_OBSTACLE_RULES.mid).toEqual({ chance: 0.82, oneLaneShare: 0.65 });
    expect(DESKTOP_OBSTACLE_RULES.late).toEqual({ chance: 0.9, oneLaneShare: 0.4 });
    expect(getObstacleRule(40, false)).toEqual(DESKTOP_OBSTACLE_RULES.opening);
    expect(getObstacleRule(80, false)).toEqual(DESKTOP_OBSTACLE_RULES.opening);
    expect(getObstacleRule(80.1, false)).toEqual(DESKTOP_OBSTACLE_RULES.mid);
    expect(getObstacleRule(250, false)).toEqual(DESKTOP_OBSTACLE_RULES.mid);
    expect(getObstacleRule(250.1, false)).toEqual(DESKTOP_OBSTACLE_RULES.late);
  });

  it('uses the lighter touch curve', () => {
    expect(TOUCH_OBSTACLE_RULES.opening).toEqual({ chance: 0.52, oneLaneShare: 1 });
    expect(TOUCH_OBSTACLE_RULES.mid).toEqual({ chance: 0.62, oneLaneShare: 1 });
    expect(TOUCH_OBSTACLE_RULES.late).toEqual({ chance: 0.72, oneLaneShare: 0.85 });
    expect(getObstacleRule(40, true)).toEqual(TOUCH_OBSTACLE_RULES.opening);
    expect(getObstacleRule(120, true)).toEqual(TOUCH_OBSTACLE_RULES.mid);
    expect(getObstacleRule(600, true)).toEqual(TOUCH_OBSTACLE_RULES.late);
  });

  it('rolls desktop thresholds exactly as before', () => {
    // Opening band: one lane, 70% chance.
    expect(resolveObstacleSpawn(40, false, sequence(0.69))).toEqual({ isObstacleSegment: true, laneCount: 1 });
    expect(resolveObstacleSpawn(40, false, sequence(0.7))).toEqual({ isObstacleSegment: false, laneCount: 0 });

    // Mid band: 82% chance, 65% of obstacle segments use one lane.
    expect(resolveObstacleSpawn(100, false, sequence(0.81, 0.64))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(100, false, sequence(0.81, 0.65))).toEqual({
      isObstacleSegment: true,
      laneCount: 2,
    });

    // Late band: 90% chance, 40% one lane.
    expect(resolveObstacleSpawn(300, false, sequence(0.89, 0.39))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(300, false, sequence(0.89, 0.4))).toEqual({
      isObstacleSegment: true,
      laneCount: 2,
    });
  });

  it('rolls touch thresholds with a single lane before 250m and 15% doubles after', () => {
    expect(resolveObstacleSpawn(40, true, sequence(0.51))).toEqual({ isObstacleSegment: true, laneCount: 1 });
    expect(resolveObstacleSpawn(40, true, sequence(0.52))).toEqual({ isObstacleSegment: false, laneCount: 0 });

    // Mid band never uses two lanes, even if the lane roll is huge.
    expect(resolveObstacleSpawn(150, true, sequence(0.61, 0.99))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });

    expect(resolveObstacleSpawn(300, true, sequence(0.71, 0.84))).toEqual({
      isObstacleSegment: true,
      laneCount: 1,
    });
    expect(resolveObstacleSpawn(300, true, sequence(0.71, 0.85))).toEqual({
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
  it('desktop keeps roughly 70/82/90 percent obstacle coverage', () => {
    const rand = mulberry32(11);
    const bands = [
      { distance: 50, chance: 0.7 },
      { distance: 150, chance: 0.82 },
      { distance: 400, chance: 0.9 },
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

  it('touch reduces coverage to roughly 52/62/72 percent', () => {
    const rand = mulberry32(13);
    const bands = [
      { distance: 50, chance: 0.52 },
      { distance: 150, chance: 0.62 },
      { distance: 400, chance: 0.72 },
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

  it('touch late game uses two lanes about 15% of the time', () => {
    const rand = mulberry32(17);
    let obstacleSegments = 0;
    let doubleLaneSegments = 0;
    for (let i = 0; i < 60_000; i++) {
      const decision = resolveObstacleSpawn(400, true, rand);
      if (!decision.isObstacleSegment) continue;
      obstacleSegments++;
      if (decision.laneCount === 2) doubleLaneSegments++;
    }
    expect(doubleLaneSegments / obstacleSegments).toBeCloseTo(0.15, 1);
  });
});
