# Slap & Run

A complete, production-ready arcade web game built for desktop browsers and mobile devices. Fast, hilarious, and immediately playable within seconds of opening.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The game is titled strictly **Slap & Run**. It is built as a complete, real game application—not a prototype, demo, or concept showcase. There are no AI panels, extraneous widgets, or dev project tools in the player interface. The experience is 100% focused on pure arcade gameplay, smooth performance, responsive controls, and high replay value.

- **Title**: **Slap & Run**
- **Core Loop**: Approach bystanders, slap them with cartoon impact, dodge obstacles, manage the Chaos Meter multiplier, and escape the growing angry mob.
- **Controls**:
  - **Mobile**: Touch drag / virtual thumb joystick on the left + large tactile SLAP button on the right (with haptic-like visual response).
  - **Desktop**: WASD or Arrow Keys to steer + Spacebar or Left Click to slap.
- **Audio & Visuals**: Pure synthesized Web Audio (punchy slaps, whooshes, comic whistles, chase alarms, coin dings) with mute toggle; 2.5D isometric cartoon graphics with depth sorting and particle effects.
- **Persistence**: High score, total slaps, coins, and best streak saved locally via `localStorage`.

---

### 1. Overview & Core Concept

- **What It Does**:
  - The player sprints through the vibrant, bustling Crazy Market street.
  - Diverse, hilarious NPCs line the street (grumpy vendors, selfie takers, bodybuilders, snoozing elders, suit workers).
  - Tapping **SLAP** when adjacent to an NPC triggers an instant cartoon strike with comic text bubbles (`SLAP!`, `POW!`, `WHACK!`), spinning hats, wobbling heads, and flying fruit.
  - Every slapped character turns red, puffs steam, and joins the angry mob sprinting right behind the player!
  - **The Chaos Meter**:
    - Each slap fills the Chaos gauge, boosting the score multiplier (1x -> 2x -> 4x -> 8x -> 16x).
    - Higher Chaos accelerates the pursuing crowd and triggers faster obstacles.
    - Hitting 100% activates **FEVER MODE** (temporary super-speed, rainbow trail, invulnerability, double coins).
  - **Obstacles**:
    - Banana peels (causes comic 360-degree slip), rolling watermelons, market pushcarts, and fruit crates.
  - **Powerups**:
    - Soda Can (Turbo sprint boost), Soap Bar (slick slipstream), Gold Coin pickups.
  - **Game Over & Instant Replay**:
    - When caught by the mob or crashing into heavy barriers, a comedic dogpile animation triggers.
    - Game over modal displays score, high score, slaps count, and max multiplier with an instant, zero-reload "PLAY AGAIN" button.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Title Screen**:
     - Punchy cartoon title marquee: **SLAP & RUN**.
     - High score display and quick sound/mute toggle.
     - Character skin selection (Casual Runner, Speedy Ninja, Retro Boxer).
     - Direct, bold "PLAY" button.
  2. **Gameplay View**:
     - 60 FPS HTML5 Canvas with smooth isometric projection.
     - Clean, unobtrusive HUD:
       - Top-left: Current Score & Best Score.
       - Top-center: Flaming Chaos Meter with active multiplier (e.g., `4x CHAOS`).
       - Top-right: Coin counter & Sound toggle button.
     - Responsive controls:
       - Mobile: Floating touch joystick (left thumb) + large SLAP button (right thumb).
       - Desktop: Keyboard (WASD / Arrows + Spacebar) + mouse click support.
     - Comedic visual juice: Screen shake on heavy slaps, flying hats, smoke puffs, and floating score numbers.
  3. **Game Over Screen**:
     - Instant appearance on capture.
     - Final score, new high score badge (if achieved), total slaps landed, and coins collected.
     - One-tap "PLAY AGAIN" button that resets game state immediately without page reloading.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: High-energy, colorful Saturday-morning cartoon style with bold black outlines and crisp geometry.
  - **Color Palette**:
    - Street & Canvas: Warm cobblestone gray (`#CBD5E1`) and warm asphalt.
    - Stalls & Environment: Terracotta reds, cedar wood, sun-bleached yellows, canopy greens.
    - Chaos Gauge: Dynamic gradient from bright amber (`#F59E0B`) to blazing neon crimson (`#EF4444`).
  - **Typography**:
    - Bold sans display font (`Plus Jakarta Sans`) for titles and comic impact callouts.
    - Monospace figures (`JetBrains Mono tabular-nums`) for scores and timers to avoid any UI jitter.
  - **Audio Design**:
    - Built-in Web Audio API synthesizer: slap claps, whoosh swings, comical slip whistles, coin pickup dings, and chase alarm sirens. Zero audio asset loading lag or broken URLs.

---

### 3. Key Product Decisions & Trade-Offs

- **Pure HTML5 Canvas 2.5D Engine**:
  - *Chosen Approach*: Lightweight 2.5D isometric vector and sprite engine rendered via standard `<canvas>`.
  - *Why*: Instant sub-second loading on any mobile device (Android/iOS) and desktop browser; zero heavy 3D assets to download; rock-solid 60 FPS stability with zero lag or stutter.
  - *Alternatives Considered*: Heavy 3D WebGL engine (higher initial download size and potential performance drops on older phones).
- **Embedded Web Audio Synthesis**:
  - *Chosen Approach*: Procedural audio using browser native Web Audio API oscillators and gain envelopes.
  - *Why*: 100% reliable, zero audio file download failures, zero licensing issues, instant response latency on touch.
- **Mobile First Touch Scheme**:
  - *Chosen Approach*: Floating virtual joystick on the left screen half, dedicated large SLAP button on the right half, plus keyboard/mouse desktop fallbacks.
  - *Why*: Perfectly accommodates single-hand and two-thumb mobile ergonomics across portrait and landscape screens.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Slap & Run                                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     HUD: Score · Best Score · Chaos Meter (1x-16x) · Mute        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    HTML5 Canvas 2.5D Viewport                    │  │
│  │                                                                  │  │
│  │   [Player Entity] ──> [Market Pedestrians] ──> [Slap FX / Stars] │  │
│  │          │                                          │            │  │
│  │   [Chasing Angry Mob] ◄── [Obstacles & Watermelons] ◄┘            │  │
│  │          │                                                       │  │
│  │   [Camera Follow & Procedural Infinite Market Generator]         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────┬───────────────────────────────┐  │
│  │   Left: Mobile Virtual Joystick  │   Right: Big Action SLAP Button│ │
│  │   (or Desktop WASD / Arrows)     │   (or Desktop Spacebar)       │  │
│  └──────────────────────────────────┴───────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Storage: LocalStorage High Scores, Coins, Best Streak           │  │
│  │  Audio: Web Audio API Procedural Sound Synthesizer               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **File & State Architecture**:
  - `src/game/GameEngine.ts`: Core game loop (requestAnimationFrame), delta-time physics, entity tracking, spatial collision detection, game state machine (`MENU`, `PLAYING`, `GAMEOVER`).
  - `src/game/IsometricRenderer.ts`: 2.5D isometric projection, entity depth-sorting, character drawing with cartoon wobble/run cycles, comic action words, particle systems.
  - `src/game/SoundEngine.ts`: Native Web Audio sound synthesizer for slaps, whacks, alarms, slip whistles, and chimes.
  - `src/game/types.ts`: Game models, entity coordinates, powerup types, and high score interfaces.
  - `src/components/TouchControls.tsx`: Virtual joystick and touch slap button with touch event cancellation to prevent mobile viewport scrolling.
  - `src/components/HUD.tsx`: Clean, reactive in-game heads-up display.
  - `src/components/GameOverModal.tsx`: Post-game summary and immediate restart.
  - `src/App.tsx`: Main responsive container adapting smoothly to mobile screens (360x640+) and desktop viewports (1280x720+).
