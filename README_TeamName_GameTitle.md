# Digit7 Jam - Game Submission README

### 1. Game Title
**SlapDash**

### 2. Team Name
**Team Champion / Indie Creator**

### 3. Main Contact Person
- **Developer / Team Lead**: Sithu Nyein
- **Email**: sithunyein.mailto@gmail.com
- **Competition**: Digit7 Jam 2026 (HTML Arcade Game Tournament by Digit7s Myanmar)
- **Primary Playable Game URL**: [https://slapdash.sithunyein.com](https://slapdash.sithunyein.com)
- **Staging / Backup Game URL**: [https://ais-pre-alfbjfea4crrbrwj2pcfeu-727803041253.asia-southeast1.run.app](https://ais-pre-alfbjfea4crrbrwj2pcfeu-727803041253.asia-southeast1.run.app)
- **Source Code Repository**: [https://github.com/thesithunyein/56](https://github.com/thesithunyein/56)

---

### 4. Short Game Description
**SlapDash** is a fast-paced, high-energy 3D / 2.5D retro arcade runner engineered with a custom Three.js WebGL engine, procedural Web Audio synthesis, and an engaging mobile-first PWA experience. Set along vibrant world boulevards (Parisian City Boulevard, Neon Night Market, Cyber Highway, and Desert Bazaar), players sprint forward dodging hazards, collecting gold coins, leaping over barricades, and slapping comical pedestrians to replenish constantly draining stamina. 

Every run begins with an interactive **Opening Mega Slap Kickoff** against a smug rival standing in the middle of the street. Consecutive slaps escalate the **Chaos Multiplier** (`1x` → `2x` → `4x` → `8x`), crowning in an invulnerable `16x` **FEVER RUN** where the procedural soundtrack tempo surges from 110 BPM to 165 BPM. Hitting obstacles triggers the intense **Two-Hit Subway Surfers Police Pursuit Rule**, where an enraged inspector and mob chase the player down.

---

### 5. How to Open and Play the Game
1. Open the hosted playable HTTPS link in any modern web browser on PC or Mobile:
   - **Production URL**: [https://slapdash.sithunyein.com](https://slapdash.sithunyein.com)
   - **Live Preview URL**: [https://ais-pre-alfbjfea4crrbrwj2pcfeu-727803041253.asia-southeast1.run.app](https://ais-pre-alfbjfea4crrbrwj2pcfeu-727803041253.asia-southeast1.run.app)
2. **No Installation Required**: The game runs instantly inside any modern web browser (HTML5 / WebGL).
3. **PWA Installable**: Players on Android, iOS, or Chrome/Edge Desktop can tap the in-game **Install App** button to add SlapDash directly to their home screen for an offline, fullscreen experience.
4. **Choose Mode**:
   - **Endless Rush**: Infinite sprint with dynamic pace selection (Chill 0.8x, Normal 1.0x, Turbo 1.3x).
   - **Stage Mode**: 10 progressive handcrafted campaign levels with 1-to-3 star ratings and coin bounties.
5. Tap or click **PLAY NOW** / **DELIVER SLAP** to kick off the run!

---

### 6. Supported Browsers
- **Google Chrome** (v100+ on Windows, macOS, Android, Linux)
- **Apple Safari** (v15+ on macOS & iOS Safari)
- **Mozilla Firefox** (v100+ on Desktop & Android)
- **Microsoft Edge** (Chromium-based on Windows & macOS)
- **Mobile WebViews & PWA standalone mode**

---

### 7. Supported Devices
- **Mobile**: Android smartphones and tablets (Android 10+), Apple iPhone and iPad (iOS 16+).
- **Desktop**: Windows 10/11, macOS, and Linux PCs with hardware-accelerated WebGL.
- **Form Factors**: Fully responsive across compact mobile screens (360x640), tablets (768x1024), and wide desktop monitors (1920x1080).

---

### 8. Controls and Gameplay Instructions

#### Mobile Touch Controls:
- **Steer / Lane Switch**: Ergonomic virtual thumb joystick in lower-left corner, quick lane buttons (`◀` `▶`), or horizontal swipe left/right.
- **Jump / Vault**: Tap the green **JUMP** button in lower-right or swipe up anywhere on screen to vault over crates, tables, and rolling barrels.
- **Slap / Kickoff**: Large tactile crimson **SLAP!** button in lower-right corner, or tap anywhere on the screen.
- **Haptic Feedback**: Native vibration impulses on slaps, near-misses, and impact collisions.

#### Desktop Keyboard & Mouse Controls:
- **Steer**: `A` / `D` or `ArrowLeft` / `ArrowRight` (clean lane shifting) or click-and-drag horizontally.
- **Jump / Vault**: `W`, `ArrowUp`, or `Space` (when not slapping) to leap over low obstacles.
- **Slap**: `Spacebar`, `C`, or **Left-Click** anywhere on screen.
- **Global Shortcuts**:
  - `P` or `Escape`: Pause / Resume game
  - `M`: Toggle Sound / Mute
  - `F`: Toggle Fullscreen
  - `H` or `?`: Open "How to Play" Guide
  - `L`: Open Stage / Level Select

#### Gameplay Mechanics & Systems:
1. **Interactive Opening Mega Slap**: Deliver a face-slap to the rival in the road to initiate the run with dynamic camera swoop and comic knockout effects.
2. **Mandatory Slapping (Stamina Drain)**: Stamina depletes continuously. Slapping sidewalk pedestrians restores +35% stamina to prevent collapsing.
3. **Subway Surfers Two-Hit Chase Rule**: Hitting 1 obstacle alerts the chasing police officer onto your screen for 6 seconds. Hitting a 2nd obstacle in a row while alerted triggers an instant Busted capture!
4. **Chaos Meter & 16x Fever Run**: Chaining slaps fills the Chaos gauge (`1x` → `2x` → `4x` → `8x` → `16x FEVER`). In Fever mode, the player turns invulnerable, bursts through obstacles, and sprints at turbo speed.
5. **Near-Miss Dodges & Jump Bonuses**: Skimming closely past barrels or launching off boost ramps awards bonus points and comic speed lines.
6. **4 Biomes / Maps**: Select between City Boulevard, Night Market, Cyber Highway, and Desert Bazaar.
7. **10 Campaign Stages**: Complete specific distance, score, and slap quotas to earn 1, 2, or 3 stars and unlock subsequent stages.
8. **Daily Rewards & Daily Missions**: 7-day login streak rewards calendar and 3 refreshed daily objectives.
9. **Wardrobe & Customization**: 6 distinct runner skins with custom outfits, hats, crowns, and speed bonuses.

---

### 9. Known Bugs or Limitations
- **None**. Tested extensively for zero memory leaks, consistent 60 FPS performance, graceful WebGL context recovery, and smooth window resizing.

---

### 10. Third-Party Tools or Libraries Used
- **Runtime & UI**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Neo-brutalist arcade UI theme)
- **3D Graphics Engine**: Three.js (Flat-shaded voxel geometry, custom materials, dynamic shadows, and cinematic camera tracking)
- **Audio Engine**: 100% Native Web Audio API procedural synthesizer (oscillators, noise buffers, and biquad filters)
- **Icons**: Lucide React
- **Packaging & Build Tool**: Vite 8 & TSX

---

### 11. Asset Credit Summary
- **Code Architecture**: 100% custom-built for Digit7 Jam 2026.
- **3D Voxel Models & Environments**: 100% procedurally generated voxel meshes created directly in code (bystanders, chasers, obstacles, buildings, shop awnings, collectibles). No external 3D model files (`.obj`, `.gltf`, `.fbx`) required.
- **Audio & Sound Effects**: 100% procedurally synthesized in real-time via the Web Audio API. Zero external `.mp3` or `.wav` sample dependencies.
- **Icons**: Lucide React open-source icon library.

---

### 12. Special Testing Instructions
- **Browser Testing**: Verified on Chrome, Edge, Safari, and Firefox.
- **Viewport Testing**: Verified responsive layout from 360x640 mobile viewports up to 4K desktop screens.
- **Offline Playability**: Once loaded, all gameplay logic, 3D assets, procedural audio, and local storage progress operate completely offline without internet connectivity.

---

### 13. Recommended Orientation, Resolution, and Aspect Ratio
- **Recommended Orientation**:
  - **Mobile**: Portrait (optimized two-thumb ergonomic controls) or Landscape.
  - **Desktop / Tablet**: Landscape (16:9 or 16:10).
- **Recommended Resolutions**: 360 x 640 (Mobile) up to 1920 x 1080 (Desktop Fullscreen).
- **Responsive Standard**: Automatic dynamic vertical FOV adjustment ensures all lanes and sidewalks remain visible across any aspect ratio.

---

### 14. Internet Connection & External API Requirements
- **None for Core Gameplay**: All game mechanics, levels, maps, audio synthesis, and progress save locally via `localStorage`.
- **Optional API**: An optional REST API proxy (`/api/leaderboard`) is provided for tournament leaderboard synchronization with instant local fallback if offline.

---

### 15. AI Tools Used & Purpose Declaration (Digit7 Jam Section 9 Compliance)
- **AI Tool Used**: Google AI Studio Build (Gemini 2.5 / Flash)
- **Purpose**: Assisted in algorithmic 3D camera projection mathematics, Web Audio procedural oscillator wave shaping, and frontend component modularization.
- **Human Review & Testing**: Thoroughly designed, architected, refined, playtested, and optimized by the team to ensure authentic arcade feel, responsive controls, and high-performance 60 FPS execution.

---

### 16. Private Repository Access Instructions
- **Repository**: [https://github.com/thesithunyein/56](https://github.com/thesithunyein/56)
- **Access Granted**: Reviewer access granted to official Digit7 Jam review accounts.
- **Submission Commit / Tag**: `v1.0.0-final`

---

### 17. Build Version & Release Identifier
- **Release Identifier**: `Digit7Jam_SlapDash_v1.0.0_Production`
- **Build Output**: Standard browser-playable HTML5 bundle in `dist/` (< 3 MB total size).
