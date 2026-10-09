import type { Cue } from '../terminal/selector';
import { readFlag, writeFlag } from './prefs';

const SOUND_KEY = 'idlemullet:sound';

type Tone = [type: OscillatorType, freq: number, seconds: number, volume: number, delay?: number];

/** Short square-wave blips, like a terminal bell with opinions. */
const CUES: Record<Cue | 'boot' | 'toggle', Tone[]> = {
  tick: [['square', 880, 0.025, 0.03]],
  select: [['square', 1320, 0.045, 0.03]],
  back: [['square', 520, 0.035, 0.03]],
  deny: [['sawtooth', 140, 0.15, 0.04]],
  launch: [['square', 660, 0.05, 0.03], ['square', 990, 0.05, 0.03, 0.06], ['square', 1480, 0.08, 0.03, 0.12]],
  boot: [['square', 1600, 0.008, 0.012]],
  toggle: [['square', 1000, 0.025, 0.03]],
};

class TerminalSound {
  private ctx: AudioContext | null = null;
  enabled = readFlag(SOUND_KEY, true);

  get supported() { return typeof window !== 'undefined' && !!this.audioConstructor(); }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    writeFlag(SOUND_KEY, enabled);
  }

  play(cue: keyof typeof CUES) {
    if (!this.enabled || !this.supported) return;
    try {
      const context = this.ctx ??= new (this.audioConstructor()!)();
      const emit = () => {
        if (this.ctx !== context || context.state !== 'running') return;
        for (const [type, freq, seconds, volume, delay = 0] of CUES[cue]) {
          const oscillator = context.createOscillator(), gain = context.createGain();
          const start = context.currentTime + delay;
          oscillator.type = type;
          oscillator.frequency.value = freq;
          gain.gain.setValueAtTime(volume, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(start); oscillator.stop(start + seconds);
        }
      };
      if (context.state === 'suspended') void context.resume().then(emit).catch(() => {});
      else emit();
    } catch { /* Audio is optional, including in browsers that block its creation. */ }
  }

  dispose() {
    const context = this.ctx;
    this.ctx = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }

  private audioConstructor() {
    return window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  }
}

export const sfx = new TerminalSound();
if (import.meta.hot) import.meta.hot.dispose(() => sfx.dispose());
