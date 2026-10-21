class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.6;
  private beatInterval: number | null = null;
  private beatStep: number = 0;
  private chaosMult: number = 1;

  constructor() {
    try {
      const saved = localStorage.getItem('slap_run_muted');
      if (saved !== null) {
        this.isMuted = JSON.parse(saved);
      }
    } catch {}
  }

  private initCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch {
      // Audio not supported
    }
    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal: number = 0.3
  ): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), ctx.currentTime + duration);

      const effectiveGain = gainVal * this.sfxVolume;
      gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('slap_run_muted', JSON.stringify(muted));
    } catch {}
    if (muted) {
      this.stopArcadeBeat();
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  public setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
  }

  public playClick(): void {
    this.playTone(600, 400, 0.05, 'triangle', 0.15);
  }

  public playStart(): void {
    this.playTone(320, 640, 0.25, 'triangle', 0.35);
    setTimeout(() => this.playTone(480, 960, 0.3, 'sine', 0.35), 80);
  }

  public playSlap(combo: number = 1): void {
    const baseFreq = Math.min(800, 260 + combo * 25);
    this.playTone(baseFreq, 90, 0.16, 'sawtooth', 0.4);
    setTimeout(() => {
      this.playTone(180, 60, 0.12, 'square', 0.3);
    }, 20);
  }

  public playMegaSlap(): void {
    this.playTone(180, 45, 0.45, 'sawtooth', 0.6);
    this.playTone(900, 120, 0.35, 'square', 0.4);
    setTimeout(() => {
      this.playTone(140, 30, 0.4, 'sine', 0.5);
    }, 60);
  }

  public playWhoosh(): void {
    this.playTone(420, 150, 0.14, 'sine', 0.18);
  }

  public playJump(): void {
    this.playTone(240, 520, 0.18, 'sine', 0.25);
  }

  public playCoin(): void {
    this.playTone(987, 1318, 0.12, 'sine', 0.22);
  }

  public playPowerup(): void {
    this.playTone(440, 880, 0.2, 'triangle', 0.3);
    setTimeout(() => this.playTone(880, 1760, 0.25, 'sine', 0.3), 100);
  }

  public playStaminaRefill(): void {
    this.playTone(300, 600, 0.15, 'sine', 0.25);
  }

  public playWhack(): void {
    this.playTone(140, 40, 0.22, 'triangle', 0.45);
  }

  public playNearMiss(): void {
    this.playTone(550, 750, 0.1, 'sine', 0.2);
  }

  public playPoliceWhistle(): void {
    this.playTone(1200, 1100, 0.18, 'square', 0.25);
    setTimeout(() => this.playTone(1250, 1150, 0.18, 'square', 0.25), 100);
  }

  public playEscaped(): void {
    this.playTone(523, 659, 0.2, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 784, 0.25, 'triangle', 0.35), 100);
  }

  public playBusted(): void {
    this.playTone(320, 110, 0.4, 'sawtooth', 0.5);
    setTimeout(() => this.playTone(220, 70, 0.5, 'square', 0.45), 120);
  }

  public playFeverStart(): void {
    this.playTone(400, 800, 0.15, 'triangle', 0.35);
    setTimeout(() => this.playTone(600, 1200, 0.25, 'sawtooth', 0.4), 100);
  }

  public playChaosAlarm(): void {
    this.playTone(880, 440, 0.2, 'sawtooth', 0.3);
  }

  public playAchievement(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, f * 1.05, 0.18, 'triangle', 0.3), idx * 75);
    });
  }

  public playLevelUp(): void {
    this.playAchievement();
  }

  public playStageClear(): void {
    const notes = [440, 554, 659, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, f, 0.22, 'sine', 0.35), idx * 90);
    });
  }

  public playIntroWindup(): void {
    this.playTone(120, 360, 0.9, 'sawtooth', 0.3);
  }

  public startArcadeBeat(): void {
    if (this.beatInterval) return;
    if (this.isMuted) return;

    this.beatStep = 0;
    this.beatInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const ctx = this.initCtx();
      if (!ctx) return;

      const tempoSpeed = Math.min(2.5, 1 + (this.chaosMult - 1) * 0.3);
      const isKick = this.beatStep % 4 === 0;
      const isHiHat = this.beatStep % 2 === 1;

      if (isKick) {
        this.playTone(110, 45, 0.08, 'sine', 0.18 * this.musicVolume);
      } else if (isHiHat) {
        this.playTone(1200, 600, 0.03, 'square', 0.06 * this.musicVolume);
      }

      this.beatStep++;
    }, 280);
  }

  public stopArcadeBeat(): void {
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  public updateBeatChaos(mult: number): void {
    this.chaosMult = mult;
  }
}

export const sounds = new SoundEngine();
