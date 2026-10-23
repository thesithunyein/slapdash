# Swiposaur: Tail Frenzy

A 3D voxel dinosaur runner for the browser. Swipe between three lanes, whip prehistoric
critters to refill stamina, charge the Primal Roar and outrun the stampede.

Built for **Digit7 Jam 2026** (HTML arcade game tournament) by **Sithu Nyein**.

- Playable build: `v1.0.0` (see [Deployment](#deployment))
- Engine: React 19 + Three.js, custom voxel meshes, synthesized Web Audio
- Entry point: `index.html` → `src/main.tsx`

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build (this is the folder to zip for the jam submission):

```bash
npm run build      # outputs ./dist
npm run preview    # serve ./dist locally
```

Type check:

```bash
npm run typecheck
```

The optional Express/leaderboard server is not needed to play. If you want to run the
original full-stack dev server (API + Vite middleware):

```bash
npm run dev:api    # http://localhost:3000
```

---

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Change lane | `A` / `D`, `←` / `→` | Swipe left / right |
| Jump | `W`, `↑`, or `Space` when not near a critter | Swipe up |
| Slide | `S`, `↓` | Swipe down |
| Tail-whip | `Space`, `F`, `Enter`, or the whip button | Tap the whip button / tap screen |
| Pause | `P` / `Esc` | Pause button |

The whip is the core mechanic: each landed hit refills **+35 stamina** and charges the
Roar meter. Miss everything and stamina drains until the run ends.

---

## How a run works

- **Opening cinematic.** A rival blocks the road; the first tap lands a mega tail-whip.
- **Safe start (6 s).** After the intro the road is clear, the mob is off-camera and a
  mistake cannot end the run.
- **Three-hit stamina.** Every stumble costs 35–45 stamina (three hits from full health).
  After the first mistake the stampede appears behind you and stays for 6 s unless you
  run clean or land whips.
- **Score** comes from distance, coins, vaults, near-misses and whip combos multiplied by
  the Roar meter (`1x → 2x → 4x → 8x → 16x`).
- **Grades** are earned on survival plus whip chaining, not on the inflated
  multiplier: B 350 m · A 800 m · S 1,400 m with a 10× combo · S+ 2,000 m with a 15× combo.

---

## Features

- Custom Three.js renderer: voxel dinosaur built from primitives, 6 skins, 6 biomes,
  dynamic shadows, weather and camera shake.
- Procedural Web Audio soundtrack and SFX — no audio files, no sample licensing.
- Persistence: high score, coins, skins, levels, achievements, daily rewards and missions
  are stored locally (`localStorage`).
- Mobile-first layout: safe-area insets, 360×640 minimum viewport, large touch targets.
- Local Hall of Fame that works with no server.

---

## Configuration

The game is static and works with **no backend**. Two optional Vite environment variables
enable extra online features when a server is available:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_LEADERBOARD_API` | unset (off) | `true` sends scores to `/api/leaderboard` and merges the online board |
| `VITE_ANALYTICS_URL` | unset (off) | POST endpoint for optional gameplay telemetry (off by default) |

With both unset the build makes **no network requests except Google Fonts** and never
shows failing API calls.

---

## Supported environments

- Chrome, Edge, Firefox and Safari (current stable), desktop and mobile.
- Android 10+, iOS 16+ (Safari), Windows 10/11, recent macOS.
- Requires WebGL. Tested at 360×640, 390×844 and 1280×720.
- Recommended: portrait on phones, any orientation on desktop.

---

## Known limitations

- **No service worker / offline install.** The app ships a web manifest so "Add to Home
  Screen" creates a shortcut, but there is no offline cache and no install prompt.
- **Leaderboard is local by default** (see Configuration). The bundled Express server and
  `api/leaderboard.ts` are demo implementations with seeded scores, not a production
  ranking service.
- External font requests to `fonts.googleapis.com`; if the network blocks them the game
  falls back to system sans-serif.
- Very old low-end Android devices with weak GPUs may drop below 30 FPS at 2× pixel ratio.

---

## Project structure

```
index.html                 page shell, fonts, meta tags
src/main.tsx               React entry
src/App.tsx                screen state, persistence, HUD wiring
src/components/            Start screen, HUD, modals (skins, maps, missions, guide…)
src/game/GameEngine.ts     run loop, collisions, whip, stamina, chase, scoring
src/game/ThreeGameRenderer.ts   scene, camera, track and world rendering
src/game/DinoMeshBuilder.ts     voxel dinosaur construction
src/game/SoundEngine.ts    Web Audio synthesis
src/game/*.ts              constants, maps, levels, missions, rewards, achievements
api/leaderboard.ts         optional demo serverless endpoint (off by default)
server.ts                  optional Express dev server with the same endpoints
```

---

## Asset credits

| Asset | Source | License |
| --- | --- | --- |
| All 3D models, textures and UI art | Generated in code with Three.js primitives and inline SVG | Original work, Apache-2.0 |
| Logo and icons | Inline SVG components in `src/components/GameLogo.tsx` | Original work, Apache-2.0 |
| Music and sound effects | Synthesized at runtime with the Web Audio API | Original work, Apache-2.0 |
| Fonts: Fredoka, Lilita One, Titan One, Sniglet, Press Start 2P | Google Fonts | SIL Open Font License 1.1 |
| React, React DOM | react.dev | MIT |
| Three.js | threejs.org | MIT |
| Vite, Tailwind CSS | vitejs.dev, tailwindcss.com | MIT |
| lucide-react | lucide.dev | ISC |
| TypeScript | typescriptlang.org | Apache-2.0 |
| Express (optional dev server) | expressjs.com | MIT |

No third-party art, audio, sprites or templates are included. No paid assets.

## AI use

AI tools were used during development and are disclosed here as required:

- **Google AI Studio (Gemini)** — initial project scaffolding, component drafts and UI copy.
- **An AI coding assistant** — refactors, gameplay tuning, documentation and code review.

Human review: every file was read, tested and modified by the developer; behaviour was
verified in Chrome at 360×640, 390×844 and 1280×720; no generated art or audio is used
(all visuals are code-drawn and all sound is synthesized). The developer is responsible
for the submitted code and can explain any part of it.

## License

Apache-2.0. See [LICENSE](LICENSE).
