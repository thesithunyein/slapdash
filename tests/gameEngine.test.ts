// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/game/ThreeGameRenderer.ts', () => {
  class RendererStub {
    setCharacterFocus() {}
    setSkin() {}
    setMap() {}
    resize() {}
    render() {}
    destroy() {}
    resetCamera() {}
    resetTrack() {}
    setReducedMotion() {}
    setShakeEnabled() {}
    triggerHitFreeze() {}
    triggerShake() {}
  }
  return { ThreeGameRenderer: RendererStub };
});

import { GameEngine } from '../src/game/GameEngine.ts';

function setTouchEnvironment(touch: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: touch,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: touch ? 5 : 0 });
  if (touch) {
    (window as unknown as Record<string, unknown>).ontouchstart = null;
  } else {
    delete (window as unknown as Record<string, unknown>).ontouchstart;
  }
}

function makeEngine() {
  const canvas = document.createElement('canvas');
  return new GameEngine(canvas, () => {}, () => {});
}

/** Spawn segments at a fixed distance and report how many contain obstacles. */
function sampleSegments(engine: GameEngine, distance: number, trials: number) {
  engine.stats.distanceRun = distance;
  let obstacleSegments = 0;
  let doubleLaneSegments = 0;
  for (let i = 0; i < trials; i++) {
    engine.obstacles = [];
    (engine as unknown as { spawnMarketSegment(y: number): void }).spawnMarketSegment(400 + i * 180);
    if (engine.obstacles.length > 0) obstacleSegments++;
    if (engine.obstacles.length === 2) doubleLaneSegments++;
  }
  return { obstacleRate: obstacleSegments / trials, doubleLaneShare: doubleLaneSegments / Math.max(1, obstacleSegments) };
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GameEngine touch mode', () => {
  it('freezes touch detection once at construction', () => {
    setTouchEnvironment(true);
    const touchEngine = makeEngine();
    expect(touchEngine.touchInputMode).toBe(true);

    // Flipping the device after construction must not change the run's tuning.
    setTouchEnvironment(false);
    expect(touchEngine.touchInputMode).toBe(true);

    const desktopEngine = makeEngine();
    expect(desktopEngine.touchInputMode).toBe(false);
  });

  it('uses the reduced touch obstacle rules', () => {
    setTouchEnvironment(true);
    const engine = makeEngine();
    const opening = sampleSegments(engine, 40, 2500);
    const late = sampleSegments(engine, 400, 2500);

    expect(opening.obstacleRate).toBeGreaterThan(0.46);
    expect(opening.obstacleRate).toBeLessThan(0.58);
    expect(late.obstacleRate).toBeGreaterThan(0.66);
    expect(late.obstacleRate).toBeLessThan(0.78);
    expect(late.doubleLaneShare).toBeGreaterThan(0.08);
    expect(late.doubleLaneShare).toBeLessThan(0.22);
  });

  it('keeps the original desktop obstacle rules', () => {
    setTouchEnvironment(false);
    const engine = makeEngine();
    const opening = sampleSegments(engine, 40, 2500);
    const late = sampleSegments(engine, 400, 2500);

    expect(opening.obstacleRate).toBeGreaterThan(0.65);
    expect(opening.obstacleRate).toBeLessThan(0.75);
    expect(late.obstacleRate).toBeGreaterThan(0.86);
    expect(late.obstacleRate).toBeLessThan(0.94);
    // Desktop late game always allows two lanes more often than touch.
    expect(late.doubleLaneShare).toBeGreaterThan(0.5);
  });
});

describe('personal best banner', () => {
  it('does not flag a score that only ties the previous best', () => {
    const engine = makeEngine();
    engine.stats.highScore = 1000;
    engine.startGame();
    engine.stats.score = 1000;
    (engine as unknown as { triggerGameOver(reason: string): void }).triggerGameOver('BUSTED');

    expect(engine.stats.highScore).toBe(1000);
    expect(engine.stats.isNewPersonalBest).toBe(false);
  });

  it('flags a strictly higher score', () => {
    const engine = makeEngine();
    engine.stats.highScore = 1000;
    engine.startGame();
    engine.stats.score = 1001;
    (engine as unknown as { triggerGameOver(reason: string): void }).triggerGameOver('BUSTED');

    expect(engine.stats.highScore).toBe(1001);
    expect(engine.stats.isNewPersonalBest).toBe(true);
  });
});
