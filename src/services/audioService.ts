import { SoundType } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.6;
  private isEnabled: boolean = false;
  private soundType: SoundType = 'soft-bell';

  constructor() {
    // Lazy init - will be initialized on first user interaction
  }

  public init(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return false;

      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
      return false;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    } else if (enabled) {
      if (!this.ctx) {
        this.init();
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public stopAll(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setSoundType(type: SoundType): void {
    this.soundType = type;
  }

  public getSoundType(): SoundType {
    return this.soundType;
  }

  public playTap(overrideType?: SoundType): void {
    const activeType = overrideType || this.soundType;
    if (!this.isEnabled || activeType === 'silent') return;
    if (!this.ctx && !this.init()) return;
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    switch (activeType) {
      case 'soft-bell':
        this.playPureBell(440, 0.28, 1.0);
        break;
      case 'wood-click':
      case 'soft-click':
        this.playWoodClick();
        break;
      case 'water-drop':
        this.playWaterDrop();
        break;
      case 'crystal':
        this.playCrystalChime();
        break;
      case 'tibetan-bowl':
        this.playTibetanBowl();
        break;
      case 'bamboo':
        this.playBamboo();
        break;
      case 'ceramic':
        this.playCeramicBead();
        break;
      case 'gentle-pulse':
        this.playGentlePulse();
        break;
      case 'reed-pipe':
        this.playReedPipe();
        break;
      case 'stone-pebble':
        this.playStonePebble();
        break;
      default:
        this.playPureBell(440, 0.25, 1.0);
    }
  }

  public playBeatTick(): void {
    if (!this.isEnabled || this.soundType === 'silent') return;
    if (!this.ctx && !this.init()) return;
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Gentle short rhythm tick matching the cadence
    this.playPureBell(587.33, 0.1, 0.35); // D5 soft ping
  }

  public playCompletionChime(): void {
    if (!this.isEnabled || this.soundType === 'silent') return;
    if (!this.ctx && !this.init()) return;
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Peaceful 3-tone ascending chord: C5 (523.25), E5 (659.25), G5 (783.99)
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPureBell(freq, 0.8, 0.6);
      }, idx * 90);
    });
  }

  // 1. Soft Bell: Clean sine with gentle metallic harmonic
  private playPureBell(freq: number, duration: number, gainMultiplier: number = 1.0): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, now);

    const peakGain = 0.35 * gainMultiplier;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    overtone.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.05);
    overtone.stop(now + duration + 0.05);
  }

  // 2. Wood Click: Authentic wooden prayer beads clicking
  private playWoodClick(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.032);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 3. Water Drop: Ascending resonant droplet
  private playWaterDrop(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(1750, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 4. Crystal: High-register glistening chime
  private playCrystalChime(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now); // C6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093.0, now); // C7

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.24);
    osc2.stop(now + 0.24);
  }

  // 5. Tibetan Singing Bowl: Deep warm meditative fundamental with long decay
  private playTibetanBowl(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now); // A3

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(587.33, now); // D5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 0.48);
    harmonic.stop(now + 0.48);
  }

  // 6. Bamboo: Hollow wooden percussion tap
  private playBamboo(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 7. Ceramic Bead: Crisp glazed ceramic contact
  private playCeramicBead(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1300, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.025);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2800, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.04);
    osc2.stop(now + 0.04);
  }

  // 8. Gentle Pulse: Warm low-frequency heartbeat
  private playGentlePulse(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 9. Reed Pipe: Meditative soft breath flute tone
  private playReedPipe(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(1046.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 0.24);
    harmonic.stop(now + 0.24);
  }

  // 10. Stone Pebble: Mineral smooth river stone click
  private playStonePebble(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const audioService = new AudioService();
