import { storage } from '../storage/storage';

export type SoundName = 'confetti' | 'fireworks' | 'rainbows' | 'balloons';

/**
 * Local, bundled audio (see scripts/download-assets.mjs) so playback works
 * offline. AAC (.m4a) because iOS Safari cannot decode Ogg Vorbis.
 */
const BASE = import.meta.env.BASE_URL;
const SOURCES: Record<SoundName, string> = {
  confetti: `${BASE}audio/confetti.m4a`,
  fireworks: `${BASE}audio/fireworks.m4a`,
  rainbows: `${BASE}audio/rainbows.m4a`,
  balloons: `${BASE}audio/balloons.m4a`
};

const MUTED_KEY = 'muted';

class SoundManager {
  private audio = new Map<SoundName, HTMLAudioElement>();
  private _muted: boolean;

  constructor() {
    this._muted = storage.get<boolean>(MUTED_KEY, false);
    for (const [name, src] of Object.entries(SOURCES) as [SoundName, string][]) {
      const el = new Audio(src);
      el.preload = 'auto';
      this.audio.set(name, el);
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  toggleMuted(): boolean {
    this._muted = !this._muted;
    storage.set(MUTED_KEY, this._muted);
    return this._muted;
  }

  play(name: SoundName): void {
    if (this._muted) return;
    const el = this.audio.get(name);
    if (!el) return;
    el.currentTime = 0;
    // Autoplay policies require a prior user gesture; every play in this app
    // is triggered by a tap, but swallow rejections just in case.
    void el.play().catch(() => {});
  }
}

export const soundManager = new SoundManager();
