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

  private masterVolume: number = 0.85;
  private sfxVolume: number = 1.0;
  private bgmVolume: number = 0.7;

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

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('slap_run_muted', String(this.isMuted));
    } catch {}
    if (this.isMuted && this.bgGain) {
      this.bgGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
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

  public setVolumes(master: number, sfx: number, bgm: number): void {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    if (this.bgGain && !this.isMuted) {
      this.bgGain.gain.setValueAtTime(this.masterVolume * this.bgmVolume * 0.25, this.ctx?.currentTime || 0);
    }
  }

  public getEffectiveSfxVolume(): number {
    return this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
  }

  /**
  /**
   * Authentic, natural, crisp human SLAP sound.
   * Carefully crafted with realistic physical foley acoustics:
   * 1. Ultra-sharp skin contact snap/crack (bandpass at 3000Hz, steep exponential drop)
   * 2. Natural micro-flam secondary transient (palm heel landing 3.5ms after fingertips)
   * 3. Flesh & air-compression mid body smack (bandpass at 1250Hz)
   * 4. Acoustic muscle/cheek damping thud (fast 220Hz -> 85Hz pitch drop)
   * Without electronic arcade chimes or synthetic laser sweeps.
   */
  public playSlap(comboLevel: number = 1): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    // Slight organic punch variation with combo while keeping 100% natural timbre
    const intensity = Math.min(1.3, 0.95 + comboLevel * 0.03);

    // Master bus for this slap instance
    const slapBus = ctx.createGain();
    slapBus.gain.setValueAtTime(sfxVol * intensity, t);
    slapBus.connect(ctx.destination);

    // -------------------------------------------------------------
    // LAYER 1: Sharp Skin Contact Snap / Crack (Fingertips on skin)
    // -------------------------------------------------------------
    const snapLen = Math.floor(ctx.sampleRate * 0.035);
    const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    }
    const snapSource = ctx.createBufferSource();
    snapSource.buffer = snapBuf;

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(3000, t);
    snapFilter.Q.setValueAtTime(2.4, t);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.9, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(slapBus);
    snapSource.start(t);

    // -------------------------------------------------------------
    // LAYER 2: Micro-Flam Palm Heel Contact (Lands ~3.5ms after fingertips)
    // -------------------------------------------------------------
    const flamDelay = 0.0035;
    const flamLen = Math.floor(ctx.sampleRate * 0.03);
    const flamBuf = ctx.createBuffer(1, flamLen, ctx.sampleRate);
    const flamData = flamBuf.getChannelData(0);
    for (let i = 0; i < flamLen; i++) {
      flamData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }
    const flamSource = ctx.createBufferSource();
    flamSource.buffer = flamBuf;

    const flamFilter = ctx.createBiquadFilter();
    flamFilter.type = 'bandpass';
    flamFilter.frequency.setValueAtTime(2100, t + flamDelay);
    flamFilter.Q.setValueAtTime(1.8, t + flamDelay);

    const flamGain = ctx.createGain();
    flamGain.gain.setValueAtTime(0.75, t + flamDelay);
    flamGain.gain.exponentialRampToValueAtTime(0.001, t + flamDelay + 0.026);

    flamSource.connect(flamFilter);
    flamFilter.connect(flamGain);
    flamGain.connect(slapBus);
    flamSource.start(t + flamDelay);

    // -------------------------------------------------------------
    // LAYER 3: Flesh & Air-Compression Mid Body Smack
    // -------------------------------------------------------------
    const bodyLen = Math.floor(ctx.sampleRate * 0.045);
    const bodyBuf = ctx.createBuffer(1, bodyLen, ctx.sampleRate);
    const bodyData = bodyBuf.getChannelData(0);
    for (let i = 0; i < bodyLen; i++) {
      bodyData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.010));
    }
    const bodySource = ctx.createBufferSource();
    bodySource.buffer = bodyBuf;

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(1250, t);
    bodyFilter.Q.setValueAtTime(1.5, t);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.7, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    bodySource.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(slapBus);
    bodySource.start(t);

    // -------------------------------------------------------------
    // LAYER 4: Acoustic Flesh / Cheek Damping Thud
    // -------------------------------------------------------------
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(220, t);
    thudOsc.frequency.exponentialRampToValueAtTime(85, t + 0.03);

    thudGain.gain.setValueAtTime(0.65, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    thudOsc.connect(thudGain);
    thudGain.connect(slapBus);
    thudOsc.start(t);
    thudOsc.stop(t + 0.048);

    // Auto-cleanup
    setTimeout(() => {
      try {
        slapBus.disconnect();
      } catch {}
    }, 150);
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
  private bassNotes = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81]; // A2, A2, C3, D3, A2, E3, D3, C3
  private scheduleNextBeat(): void {
    if (!this.isBeatRunning) return;

    if (!this.isMuted) {
      const ctx = this.initContext();
      if (ctx) {
        const t = ctx.currentTime;
        const bgmVol = this.masterVolume * this.bgmVolume;

        // 1. Drum Rhythm (Kick on 0 & 4, Snare/Clap on 2 & 6, Hihat on odd steps)
        if (this.step % 4 === 0) {
          // Punchy arcade kick
          const kick = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kick.type = 'sine';
          kick.frequency.setValueAtTime(140, t);
          kick.frequency.exponentialRampToValueAtTime(42, t + 0.08);

          kickGain.gain.setValueAtTime(0.18 * bgmVol, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          kick.connect(kickGain);
          kickGain.connect(ctx.destination);
          kick.start(t);
          kick.stop(t + 0.1);
        } else if (this.step % 4 === 2) {
          // Retro snare clap
          const snareSize = Math.floor(ctx.sampleRate * 0.06);
          const buf = ctx.createBuffer(1, snareSize, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < snareSize; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const sFilter = ctx.createBiquadFilter();
          sFilter.type = 'bandpass';
          sFilter.frequency.setValueAtTime(1800, t);
          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0.12 * bgmVol, t);
          sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

          src.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(ctx.destination);
          src.start(t);
        } else {
          // Soft hihat
          const hatSize = Math.floor(ctx.sampleRate * 0.02);
          const buf = ctx.createBuffer(1, hatSize, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < hatSize; i++) d[i] = (Math.random() * 2 - 1) * 0.25;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const hFilter = ctx.createBiquadFilter();
          hFilter.type = 'highpass';
          hFilter.frequency.setValueAtTime(6500, t);
          const hGain = ctx.createGain();
          hGain.gain.setValueAtTime(0.05 * bgmVol, t);
          hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

          src.connect(hFilter);
          hFilter.connect(hGain);
          hGain.connect(ctx.destination);
          src.start(t);
        }

        // 2. Energetic 8-Bit Synth Bassline!
        const bassFreq = this.bassNotes[this.step % this.bassNotes.length];
        const bassOsc = ctx.createOscillator();
        const bassFilter = ctx.createBiquadFilter();
        const bassGain = ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(500, t);
        bassFilter.frequency.exponentialRampToValueAtTime(180, t + 0.12);
        bassFilter.Q.setValueAtTime(4.0, t);

        bassGain.gain.setValueAtTime(0.14 * bgmVol, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.12);
      }
    }

    this.step = (this.step + 1) % 8;
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

  /**
   * Dramatic rising comic wind-up pitch for intro slap
   */
  public playIntroWindup(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.9);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  /**
   * Colossal mega slap impact sound for the introductory blow (heavy sub punch + crack + comic boom)
   */
  public playMegaSlap(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(sfxVol, t);
    bus.connect(ctx.destination);

    // 1. Heavy Sub-Bass Impact Boom
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(170, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    subOsc.connect(subGain);
    subGain.connect(bus);
    subOsc.start(t);
    subOsc.stop(t + 0.52);

    // 2. High-Frequency Authentic Slap Crack Noise (Fingertips & skin contact)
    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);
    filter.Q.setValueAtTime(2.2, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.95, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(bus);
    noise.start(t);

    // 3. Flesh & Air Compression Smack Body
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = 'bandpass';
    midFilter.frequency.setValueAtTime(1300, t);
    midFilter.Q.setValueAtTime(1.5, t);

    const midSource = ctx.createBufferSource();
    midSource.buffer = buffer;
    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.85, t);
    midGain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

    midSource.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(bus);
    midSource.start(t + 0.0035);

    setTimeout(() => {
      try { bus.disconnect(); } catch {}
    }, 550);
  }

  /**
   * Triumphant level up arpeggio
   */
  public playLevelUp(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.3, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.24);
    });
  }

  /**
   * Glorious stage clear victory fanfare
   */
  public playStageClear(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const chords = [
      { f: [523.25, 659.25], delay: 0, dur: 0.18 },
      { f: [587.33, 698.46], delay: 0.16, dur: 0.18 },
      { f: [659.25, 783.99], delay: 0.32, dur: 0.22 },
      { f: [783.99, 1046.5], delay: 0.52, dur: 0.6 },
    ];
    chords.forEach((chord) => {
      chord.f.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + chord.delay);
        gain.gain.setValueAtTime(0.35, t + chord.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + chord.delay + chord.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + chord.delay);
        osc.stop(t + chord.delay + chord.dur + 0.05);
      });
    });
  }

  /**
   * Golden achievement unlocked chime
   */
  public playAchievement(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const chimeFreqs = [587.33, 880.0, 1174.66, 1760.0];
    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.28, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.48);
    });
  }
}

export const sounds = new SoundEngine();
