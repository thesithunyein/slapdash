# Digit7 Jam - Game Submission README

### 1. Game Title
**SlapDash**

### 2. Team Name
**Team Champion / Indie Creator**

### 3. Main Contact Person
- **Contact Person**: Sithu Nyein
- **Email**: sithunyein.mailto@gmail.com
- **Event**: Digit7 Jam 2026 (HTML Arcade Game Tournament by Digit7s Myanmar)

---

### 4. Short Game Description
**SlapDash** is a fast-paced, high-energy 3D / 2.5D arcade runner built with a custom Three.js WebGL engine and synthesized Web Audio. Players sprint down a vibrant, sunlit boulevard lined with Parisian facades and travertine pavers, slapping comical bystanders with cartoon impact while dodging crazy hazards (rolling barrels, boost launch ramps, fruit crates, market pushcarts). Each slap lands with tactile comic punchlines, knocking off accessories (chef hats, sunglasses, selfie phones, flying fish), replenishing stamina, and charging the **Chaos Meter** from 1x up to a 16x **FEVER RUN**. Slapped pedestrians join an enraged pursuer mob that sprints relentlessly behind the player with hilarious steam-puff animations.

---

### 5. How to Open and Play the Game
1. Open the hosted playable HTTPS game link in any modern web browser on PC or Mobile.
2. No installation, plugins, or account login are required.
3. On the Start Screen, select your unlocked runner skin (or unlock new ones with collected coins) and choose Stage Mode or Endless Mode.
4. Tap or click **PLAY NOW** to start running immediately.

---

### 6. Supported Browsers
- Google Chrome (Stable, Desktop & Mobile)
- Apple Safari (macOS & iOS Safari)
- Mozilla Firefox (Stable, Desktop & Mobile)
- Microsoft Edge (Desktop & Mobile)

---

### 7. Supported Devices
- **Mobile**: Android devices (Android 10+) and Apple iOS devices (iOS 16+ / iPhone & iPad).
- **Desktop**: Windows 10/11, macOS, and Linux PCs.

---

### 8. Controls and Gameplay Instructions
#### Mobile Controls:
- **Steer**: Virtual ergonomic thumb joystick in the lower-left corner, quick lane buttons (◀ ▶), or swipe left/right.
- **Jump / Vault**: Tap the emerald **JUMP** button in the lower-right or swipe up anywhere on screen to vault over crates and rolling barrels.
- **Slap**: Large tactile crimson **SLAP!** button in the lower-right corner, or quick tap anywhere on screen.
- **Haptics**: Native vibration feedback on slap impacts (supported Android & mobile browsers).

#### Desktop PC Controls:
- **Steer**: `A` / `D` or `ArrowLeft` / `ArrowRight` keys, or click-and-drag horizontally with mouse.
- **Jump / Vault**: Press `W` or `ArrowUp` to jump over low obstacles.
- **Slap**: Press `Spacebar` or **Left-Click** anywhere on the screen.
- **Pause**: Press `P`, `Escape`, or click the top-right Pause button in the HUD.

#### Gameplay Mechanics & Scoring:
- **Slap Bystanders**: Approach bystanders and hit SLAP within reach to score points, replenish stamina, and knock accessories flying.
- **Jump & Dodge**: Leap over crates, barrels, and pushcarts for `LEAP OVER! +80` bonus points, or launch off boost ramps for aerial vaults.
- **Subway Surfers Chaser Rule**: Hitting 1 obstacle alerts the chasing officer onto your screen for 6 seconds. Hit a 2nd obstacle in a row while alerted = Busted! Run cleanly to escape.
- **Chaos Multiplier**: Consecutive slaps escalate the score multiplier: `1x` → `2x` → `4x` → `8x`.
- **FEVER RUN (16x)**: Filling the gauge to 100% unleashes invulnerable supersonic sprint speed and obstacle smashing.
- **Dynamic Procedural Beat**: Built-in audio tempo dynamically increases from 110 BPM to 165 BPM as Chaos rises.
- **Collect Coins & Powerups**: Grab floating gold medallions to spend in the Runner Wardrobe (6 distinct skins). Pick up Turbo Soda and Soap Bars.

---

### 9. Known Bugs or Limitations
**None**. Tested for zero memory leaks, 60 FPS steady frame rate, clean canvas resizing, and instant restart.

---

### 10. Third-Party Tools or Libraries Used
- **Runtime Framework**: React 18 & TypeScript
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React (standalone SVGs for HUD & UI buttons)
- **Engine**: Three.js WebGL 3D renderer & custom isometric camera system
- **Audio Engine**: 100% native Web Audio API procedural synthesizer (zero audio sample dependencies)

---

### 11. Asset Credit Summary
- **Code & Logic**: 100% custom-written during the competition period.
- **Audio**: 100% procedural synthesized audio created natively in code via Web Audio oscillators, filters, and gain envelopes. No third-party audio files used.
- **Graphics & Visuals**: 100% procedurally modeled 3D voxel geometry, flat-shaded arcade materials, and dynamic lighting. No third-party copyrighted art used.

---

### 12. Special Testing Instructions
- Tested on standard 360 x 640 mobile viewports, iPhone viewports (390 x 844, 430 x 932), iPad tablets, and desktop 1280 x 720 / 1920 x 1080 screens.
- Completely playable offline once loaded; persistent data (High Scores, Total Coins, Unlocked Skins, Tournament Leaderboard) is saved locally via `localStorage`.

---

### 13. Recommended Orientation, Resolution, and Aspect Ratio
- **Recommended Mobile Orientation**: Portrait (optimized layout with two-thumb touch controls) or Landscape.
- **Recommended Desktop Resolution**: 1280 x 720 or 1920 x 1080 (16:9).
- **Responsive Layout**: Fluid viewport adaptation with CSS touch-none, overscroll-none, and sub-pixel scaling.

---

### 14. Internet Connection & External API Requirements
- **None**. The game requires zero external API connections, zero authentication services, and zero tracking scripts. Operates cleanly in standalone/offline mode.

---

### 15. AI Tools Used & Purpose Declaration (Digit7 Jam Section 9 Compliance)
- **AI Tool Used**: Google AI Studio Build (Gemini 2.5 / Flash)
- **Purpose**: Assisted in algorithmic isometric projection mathematics, Web Audio oscillator synthesis design, and frontend code structuring.
- **Human Review & Testing**: Thoroughly reviewed, refined, styled with senior AAA art direction, tested on multiple mobile and desktop browsers, and verified for 60 FPS performance and bug-free execution.

---

### 16. Private Repository Access Instructions
- **Repository**: Private GitHub repository
- **Access Granted**: Reviewer invitation granted to official Digit7s reviewer account.
- **Commit Tag**: `v1.0.0-final`

---

### 17. Build Version & Release Identifier
- **Release Identifier**: `Digit7Jam_SlapDash_v1.0.0_Production`
