/**
 * Procedural Web Audio Synthesizer for Slap & Run.
 * 100% native, zero external asset dependencies, zero lag, zero network failures.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgGain: GainNode | null = null;
  private isBeatRunning: boolean = false;
  private beatInterval: number | null = null;
  private tempo: number = 110; // BPM

  constructor() {
    // Read mute preference from localStorage
    try {
      const saved = localStorage.getItem('slap_run_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // Storage access disabled
    }

    // Modern browser AudioContext unlock on first user gesture
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('slap_run_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (this.isMuted && this.bgGain) {
      this.bgGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  /**
   * Crisp, punchy cartoon SLAP sound (noise burst + punch envelope)
   */
  public playSlap(comboLevel: number = 1): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Noise burst for the "crack/smack"
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Highpass filter for crispness
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    const noiseGain = ctx.createGain();
    const vol = Math.min(0.8, 0.45 + comboLevel * 0.05);
    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // 2. Tonal "thump"
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 220 + Math.min(200, comboLevel * 25);
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);

    // 3. Arcade Combo Musical Pitch Chime (Scales musically with combo streak)
    if (comboLevel > 0) {
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      // Climbs musically in semitones (A4 = 440Hz base up to 18 semitones)
      const semitone = Math.min(18, comboLevel);
      const chimeFreq = 440 * Math.pow(2, semitone / 12);
      chime.frequency.setValueAtTime(chimeFreq, t);
      chime.frequency.exponentialRampToValueAtTime(chimeFreq * 1.35, t + 0.12);

      const chimeVol = Math.min(0.32, 0.12 + comboLevel * 0.02);
      chimeGain.gain.setValueAtTime(chimeVol, t);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(t);
      chime.stop(t + 0.13);
    }
  }

  /**
   * Crisp whoosh & chime for near-miss obstacle dodging
   */
  public playNearMiss(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, t + 0.1); // B5

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Heavy cartoon Whack / Bonk (for fever mode or high multipliers)
   */
  public playWhack(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.16);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  /**
   * Whiff / Whoosh when slapping thin air
   */
  public playWhoosh(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    filter.Q.setValueAtTime(3, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
  }

  /**
   * Slide whistle / slip sound (banana peel)
   */
  public playSlip(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    // Slide up then steep slide down
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.linearRampToValueAtTime(750, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.28);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Bright gold coin pickup ping
   */
  public playCoin(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    osc2.frequency.setValueAtTime(1318.51, t);
    osc2.frequency.setValueAtTime(1760.00, t + 0.06); // A6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  /**
   * Powerup pickup fanfare (Soda / Soap)
   */
  public playPowerup(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const freqs = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = t + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  /**
   * Chaos level up siren pulse
   */
  public playChaosAlarm(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.08);
    osc.frequency.linearRampToValueAtTime(600, t + 0.16);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  /**
   * FEVER RUN Mode activation fanfare
   */
  public playFeverStart(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major triumph
    chords.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  /**
   * Comedic Game Over / Busted sound (sad cartoon slide down)
   */
  public playBusted(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.15);
    osc.frequency.linearRampToValueAtTime(220, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.7);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.76);
  }

  /**
   * Subway Surfers police whistle / siren alert when officer rushes on-screen
   */
  public playPoliceWhistle(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Dual trilling high-pitched whistle burst
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = t + i * 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1760, st); // A6
      osc.frequency.linearRampToValueAtTime(2200, st + 0.05);
      osc.frequency.linearRampToValueAtTime(1760, st + 0.1);

      gain.gain.setValueAtTime(0.24, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.13);
    }
  }

  /**
   * Escape chime when player clears obstacles and chaser drops off-screen
   */
  public playEscaped(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const notes = [587.33, 739.99, 880]; // D5, F#5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.21);
    });
  }

  /**
   * Crisp emerald health/stamina refill chime upon landing a slap
   */
  public playStaminaRefill(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.12); // C6

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  /**
   * Tactile button click
   */
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Energetic arcade run start jingle
   */
  public playStart(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const freqs = [330, 440, 554.37, 659.25]; // E4, A4, C#5, E5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = t + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.19);
    });
  }

  /**
   * Dynamic procedural arcade rhythm beat that scales tempo with Chaos level
   */
  public startArcadeBeat(): void {
    if (this.isBeatRunning) return;
    this.isBeatRunning = true;
    this.scheduleNextBeat();
  }

  public stopArcadeBeat(): void {
    this.isBeatRunning = false;
    if (this.beatInterval) {
      clearTimeout(this.beatInterval);
      this.beatInterval = null;
    }
  }

  public updateBeatChaos(chaosMultiplier: number): void {
    // 1x = 110bpm, 2x = 120, 4x = 135, 8x = 150, 16x = 165
    this.tempo = 110 + (Math.log2(chaosMultiplier) * 14);
  }

  private step = 0;
  private scheduleNextBeat(): void {
    if (!this.isBeatRunning) return;

    if (!this.isMuted) {
      const ctx = this.initContext();
      if (ctx) {
        const t = ctx.currentTime;
        // Kick on 0 and 2, hihat on 1 and 3
        if (this.step % 2 === 0) {
          // Soft arcade kick
          const kick = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kick.type = 'sine';
          kick.frequency.setValueAtTime(120, t);
          kick.frequency.exponentialRampToValueAtTime(45, t + 0.08);

          kickGain.gain.setValueAtTime(0.12, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          kick.connect(kickGain);
          kickGain.connect(ctx.destination);
          kick.start(t);
          kick.stop(t + 0.09);
        } else {
          // Soft hihat
          const hatSize = ctx.sampleRate * 0.025;
          const buf = ctx.createBuffer(1, hatSize, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < hatSize; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const hFilter = ctx.createBiquadFilter();
          hFilter.type = 'highpass';
          hFilter.frequency.setValueAtTime(6000, t);
          const hGain = ctx.createGain();
          hGain.gain.setValueAtTime(0.04, t);
          hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

          src.connect(hFilter);
          hFilter.connect(hGain);
          hGain.connect(ctx.destination);
          src.start(t);
        }
      }
    }

    this.step = (this.step + 1) % 4;
    const intervalMs = (60 / this.tempo) * 1000 * 0.5; // Eighth notes
    this.beatInterval = window.setTimeout(() => this.scheduleNextBeat(), intervalMs);
  }

  /**
   * Jump / Booster ramp swoosh sound
   */
  public playJump(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.22);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  /**
   * Character unlock fanfare
   */
  public playUnlock(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.26);
    });
  }
}

export const sounds = new SoundEngine();
