# SlapDash: 3D Retro Arcade Boulevard Runner

<div align="center">

```
  ____  _             ____            _     
 / ___|| | __ _ _ __ |  _ \  __ _ ___| |__  
 \___ \| |/ _` | '_ \| | | |/ _` / __| '_ \ 
  ___) | | (_| | |_) | |_| | (_| \__ \ | | |
 |____/|_|\__,_| .__/|____/ \__,_|___/_| |_|
               |_|                          
```

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge&logo=shield)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Synth-orange.svg?style=for-the-badge&logo=soundcharts)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

A fast-paced, hilarious 3D / 2.5D retro arcade runner where you slap quirky pedestrians to maintain stamina, navigate dynamic multi-lane boulevards across 4 biomes, leap over dangerous hazards, and outsmart a relentless Subway Surfers-style chasing police mob.

**Live Game Links**: [Primary Production](https://slapdash.sithunyein.com) | [Live Staging Preview](https://ais-pre-alfbjfea4crrbrwj2pcfeu-727803041253.asia-southeast1.run.app) | [GitHub Repository](https://github.com/thesithunyein/56)

</div>

---

## Table of Contents
1. [Overview & Highlights](#overview--highlights)
2. [Interactive Opening Mega Slap](#interactive-opening-mega-slap)
3. [Gameplay Modes](#gameplay-modes)
   - [Endless Rush Mode](#endless-rush-mode)
   - [Stage Campaign Mode (10 Levels)](#stage-campaign-mode-10-levels)
4. [4 Biomes & World Maps](#4-biomes--world-maps)
5. [Controls and Keybindings](#controls-and-keybindings)
6. [Core Mechanics](#core-mechanics)
   - [The Stamina Mechanic](#the-stamina-mechanic)
   - [Subway Surfers Two-Hit Chase Rule](#subway-surfers-two-hit-chase-rule)
   - [Lane Centering & Escape Routes](#lane-centering--escape-routes)
   - [Chaos Multiplier & 16x Fever Run](#chaos-multiplier--16x-fever-run)
7. [Obstacle & Hazard Catalog](#obstacle--hazard-catalog)
8. [Player Retention Systems](#player-retention-systems)
   - [Daily Login Rewards](#daily-login-rewards)
   - [Daily Missions](#daily-missions)
   - [Achievements & Trophies](#achievements--trophies)
   - [Runner Wardrobe (Skins)](#runner-wardrobe-skins)
   - [Comprehensive Settings Suite](#comprehensive-settings-suite)
9. [System Architecture](#system-architecture)
10. [Local Development & Quick Start](#local-development--quick-start)
11. [Digit7 Jam 2026 Compliance](#digit7-jam-2026-compliance)

---

## Overview & Highlights

**SlapDash** is built from the ground up for instantaneous browser play on mobile and desktop devices without installations, downloads, or external dependencies.

- **Zero External Assets**: All 3D voxel meshes, street architecture, lighting shaders, and audio sound effects are generated procedurally in code via WebGL (Three.js) and the native Web Audio API. Total production footprint is **under 3 MB**.
- **PWA (Progressive Web App)**: Installable directly to home screens on iOS, Android, and Desktop Chrome/Edge with offline capability.
- **Dynamic Procedural Soundtrack**: Synthesizes real-time retro 8-bit chip music that dynamically accelerates from 110 BPM up to 165 BPM as Chaos level climbs.
- **Physical Game Feel**: Combines a 70ms visceral hit-stop frame freeze, dynamic camera screen shake, native mobile haptic feedback, and comic particle explosions.

---

## Interactive Opening Mega Slap

Every run begins with an over-the-shoulder showdown against a smug rival standing squarely in the middle of the street wearing sunglasses and a stylish suit:

```
[ WAITING ]   --->   [ WIND-UP (380ms) ]   --->   [ IMPACT (70ms Hit-Stop) ]   --->   [ KNOCKOUT & SWOOP ]
"You wouldn't         Arm draws far back;         💥 KA-POW! Mega Slap;               Sunglasses fly spinning;
 dare slap ME!"       Glove swells 1.8x;          White flash + 16 stars;             Victim hurtles backward;
 [TAP / SPACE]        Tension whoosh riser        Visceral screen shake               Camera swoops into sprint!
```

Players tap the screen, press `Space` / `Enter`, or tap **DELIVER MASSIVE SLAP!** to land the blow. If left untouched, an auto-safety timer delivers the strike after 2.4s so spectators are never stranded.

---

## Gameplay Modes

### Endless Rush Mode
- Infinite arcade sprint with high-score tracking and leaderboard submission.
- **3 Dynamic Pace Multipliers**:
  - **CHILL (0.8x)**: Relaxed speed for casual strolling and sightseeing.
  - **NORMAL (1.0x)**: The balanced, authentic tournament standard.
  - **TURBO (1.3x)**: Hyperspeed for seasoned speedrunners and high-score chasers.

### Stage Campaign Mode (10 Levels)
A handcrafted 10-stage level progression system featuring distinct objectives and star criteria:
- **Level 1**: Boulevard Rookie (Distance: 150m, Slaps: 3)
- **Level 2**: Speeding Up (Distance: 250m, Slaps: 6)
- **Level 3**: Obstacle Alley (Distance: 350m, Slaps: 10, Combos)
- **Levels 4–10**: Progressively challenging objectives featuring tighter obstacle densities, night markets, and relentless police chasers. Earn 1, 2, or 3 stars per stage plus coin bounties!

---

## 4 Biomes & World Maps

Players can choose between four visually distinctive environments:

| Biome | Atmosphere & Sky | Street Architecture | Specialty Hazards |
| :--- | :--- | :--- | :--- |
| **City Boulevard** | Vibrant midday cyan sky (`#38BDF8`), sunny haze | Travertine pavers, Parisian limestone facades, emerald cafe awnings | Fruit crates, construction barriers, rolling kegs |
| **Night Market** | Dark violet dusk (`#1E1B4B`), neon lanterns, wet asphalt | Cyber street stalls, dim lanterns, illuminated storefronts | Dimly lit pushcarts, neon boost ramps |
| **Cyber Highway** | Deep synthwave navy (`#0F172A`), digital speed lines | Glowing grid lines, neon cyan road dividers | Cyber barriers, high-speed energy obstacles |
| **Desert Bazaar** | Warm terracotta sunset (`#F59E0B`), warm dunes | Earthy stone pavers, striped market fabric, brass ornaments | Spice carts, clay urns, wooden hurdles |

---

## Controls and Keybindings

### Mobile & Tablet Touch Controls
- **Steer / Lane Switch**: Ergonomic virtual thumb joystick in lower-left corner, dedicated lane buttons (`◀` `▶`), or horizontal swipe left/right.
- **Jump / Vault**: Tap the emerald **JUMP** button in lower-right or swipe up anywhere on screen to leap over crates, barrels, and hurdles.
- **Slap / Kickoff**: Large tactile crimson **SLAP!** button in lower-right corner, or quick tap anywhere on screen.
- **Haptic Vibration**: Native vibration feedback on slap impacts, stumbles, and lane shifts.

### Desktop Keyboard & Mouse Controls
- **Steer**: `A` / `D` or `ArrowLeft` / `ArrowRight` (clean lane shifting) or click-and-drag horizontally.
- **Jump / Vault**: `W` or `ArrowUp` to jump over low obstacles.
- **Slap / Kickoff**: `Spacebar`, `C`, or **Left-Click** anywhere on screen.
- **Global Hotkeys**:
  - `P` or `Escape`: Pause / Resume game
  - `M`: Toggle Sound / Mute
  - `F`: Toggle Fullscreen
  - `H` or `?`: Open "How to Play" Guide
  - `L`: Open Stage / Level Select

---

## Core Mechanics

### The Stamina Mechanic
- **Continuous Drain**: Stamina depletes at approximately 3.3% per second (~30 seconds buffer from 100%).
- **Replenish Energy**: Landing a slap on a sidewalk pedestrian awards **+35% stamina** (capped at 100%), plays a chime, and displays `+35 STAMINA`.
- **Low Energy Warning**: When stamina drops below 25%, the HUD pulses red with an urgent heartbeat alert: *SLAP TO RECHARGE*.
- **Exhaustion**: If stamina hits 0%, the runner collapses, triggering *GAME OVER: OUT OF STAMINA*.

### Subway Surfers Two-Hit Chase Rule
```
[ CLEAN RUNNING ] ---> (Hit Obstacle 1) ---> [ POLICE ON-SCREEN ] ---> (Hit Obstacle 2) ---> [ BUSTED / GAME OVER ]
        ^                                              |
        +------------ (Run Cleanly for 6.0s) ----------+
```
1. **Off-Screen Stealth**: While running cleanly, the officer trails 180 units behind camera out of view.
2. **First Stumble**: Colliding with an obstacle slows you down, sounds a police whistle, and surges the officer directly onto screen (~40 units behind).
3. **Danger Window**: An urgent HUD alert warns: *CHASER ON-SCREEN! 1 MORE HIT = BUSTED*.
4. **Second Stumble**: Hitting another obstacle while the chaser is on-screen results in an immediate tackle and *Busted Game Over*.
5. **Clean Escape**: Dodging obstacles for 6.0 consecutive seconds shakes off the officer, granting an *ESCAPED CHASER +150* bonus.

### Lane Centering & Escape Routes
- **Discrete Multi-Lane System**: Moving left or right smoothly snaps the runner squarely into the center of the lane. No ambiguous drifting.
- **Guaranteed Escape Paths**: Obstacle waves occupy at most 2–3 lanes, always leaving open escape routes marked by breadcrumb coin trails.
- **Platform Risk vs. Reward**: Sidewalk platforms host bystanders to slap, but feature tighter hazard margins. Center lanes are safer for dodging but contain no pedestrians.

### Chaos Multiplier & 16x Fever Run
Consecutive slaps escalate the score multiplier:
- **25% Chaos**: `2x` Multiplier
- **50% Chaos**: `4x` Multiplier
- **75% Chaos**: `8x` Multiplier
- **100% Chaos**: **16x FEVER RUN**!
  - 5.5 seconds of invulnerable turbo sprint.
  - Smashes through all obstacles without stumbling.
  - Locks stamina at 100%.
  - Doubled coin values and psychedelic emerald lighting.

---

## Obstacle & Hazard Catalog

| Obstacle | Visual Description | Hazard Behavior | Avoidance Strategy |
| :--- | :--- | :--- | :--- |
| **Fruit Crate** | Wooden produce crate piled with voxel apples and oranges | Stationary solid block | Swerve into adjacent escape lane or leap over with Jump |
| **Construction Barrier** | Heavy orange and white striped barricade | Tall obstacle spanning a full lane | Cannot leap over; must swerve into an open lane |
| **Rolling Barrel** | Wooden keg with copper bands rolling toward runner | Dynamic rolling hazard with predictable lane velocity | Dodge laterally or time a clean aerial jump |
| **Market Pushcart** | Merchant wooden pushcart with striped fabric canopy | Wide obstacle with side clearance requirements | Maintain distance and steer into coin-marked escape path |
| **Boost Ramp** | Sloped wooden ramp with glowing neon directional arrows | Launch trigger: catapults runner into high-altitude air | Run directly into ramp for high leap bonus |

---

## Player Retention Systems

### Daily Login Rewards
A 7-day reward calendar tracking consecutive check-ins in `localStorage`, awarding increasing coin bounties and skin unlocks with a visible notification indicator on the start screen.

### Daily Missions
Refreshes daily with 3 tailored objectives (e.g., *Slap 15 pedestrians*, *Score 10,000 points*, *Achieve a 5x combo streak*) with one-click reward claims.

### Achievements & Trophies
12 trackable trophies (First Slap, Combo Master, Fever Frenzy, Obstacle Evader, Longest Escape, Coin Hoarder, etc.) complete with animated real-time toast alerts during runs.

### Runner Wardrobe (Skins)
6 distinct runner cosmetics purchasable using in-game coins:
- **Default Runner**: Classic green athletic tee & blue shorts.
- **Yangon Dasher**: Traditional Myanmar longyi & headband (+0.3 speed bonus).
- **Golden Champion**: Shimmering gold armor & champion crown (+0.6 speed bonus).
- **Market Ninja**: Stealthy black shinobi gear (+0.4 speed bonus).
- **Retro Sprinter**: 80s neon synthwave tracksuit (+0.3 speed bonus).
- **Cyber Phantom**: Translucent electric blue tech suit (+0.5 speed bonus).

### Comprehensive Settings Suite
- **Audio**: Separate sliders for Master Volume, Sound FX, Background Music, and Mute.
- **Graphics**: Quality presets (High, Medium, Low), Camera Shake toggle, Reduced Motion mode, and Character Focus illumination ring.
- **Controls**: Virtual joystick toggle (Auto/Always/Hidden), Lane Buttons toggle, and analog sensitivity adjustment.

---

## System Architecture

```
+---------------------------------------------------------------------------------+
|                                SlapDash Client                                  |
+---------------------------------------+-----------------------------------------+
                                        |
              +-------------------------+-------------------------+
              v                         v                         v
    +-------------------+     +-------------------+     +-------------------+
    |   Input System    |     |    Game Engine    |     |  Procedural Web   |
    |  - Touch Joystick |---->|  - State Machine  |<--->|  Audio Synthesizer|
    |  - Swipe / Tap    |     |  - Stamina Drain  |     |  - Dynamic BPM    |
    |  - Keyboard A/D   |     |  - Subway Chaser  |     |  - Sound FX       |
    |  - Native Haptics |     |  - Multi-Lanes    |     |  - 0 External MP3s|
    +-------------------+     +---------+---------+     +-------------------+
                                        |
              +-------------------------+-------------------------+
              v                         v                         v
    +-------------------+     +-------------------+     +-------------------+
    |   Three.js 3D     |     |  React 19 / HUD   |     | Full-Stack Proxy  |
    |  WebGL Renderer   |     |  - Neo-Brutalist  |     |  - Leaderboard API|
    |  - Voxel Geometry |     |  - Daily Missions |     |  - PWA Manifest   |
    |  - 4 Biomes       |     |  - Level Select   |     |  - LocalStorage   |
    |  - Camera Shake   |     |  - Achievement UI |     |    Persistence    |
    +-------------------+     +-------------------+     +-------------------+
```

---

## Local Development & Quick Start

### Prerequisites
- Node.js 18+ or Bun

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/thesithunyein/56.git
cd 56

# Install dependencies
npm install

# Start development server
npm run dev
# Server starts at http://localhost:3000

# Build production bundle
npm run build

# Validate TypeScript
npm run lint
```

---

## Digit7 Jam 2026 Compliance

- **Organized by**: Digit7s Myanmar
- **Submission Title**: SlapDash
- **Developer**: Sithu Nyein (`sithunyein.mailto@gmail.com`)
- **Technology**: 100% Browser-Playable HTML5 / WebGL (Three.js) & Web Audio API
- **Bundle Footprint**: < 3 MB (Complies with the 200 MB maximum threshold)
- **Security & Privacy**: Zero tracking, zero third-party cookies, zero unapproved external network requests.
- **AI Tool Disclosure**: Built with Google AI Studio Build (Gemini 2.5 / Flash) for mathematical projection and procedural synthesis design, with full human review, testing, and creative art direction.
