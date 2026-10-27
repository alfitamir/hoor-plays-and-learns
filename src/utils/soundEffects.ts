/**
 * Natural Sound Effects Synthesizer (Web Audio API)
 * Strictly NO background music — only natural, organic sound effects
 * (chicken clucks, wing rustles, wooden pops, bird chirps, water drops).
 */

class NaturalSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private voiceEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSettings(soundEnabled: boolean, voiceEnabled: boolean) {
    this.enabled = soundEnabled;
    this.voiceEnabled = voiceEnabled;
  }

  /**
   * Natural Chicken Cluck ("بوك بوك") using dual formant bandpass filters
   */
  public playCluck(pitchScale = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Two quick natural cluck syllables
    [0, 0.13].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = (idx === 0 ? 370 : 440) * pitchScale;
      osc.frequency.setValueAtTime(baseFreq * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, t + 0.045);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.095);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950 * pitchScale, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  /**
   * Soft Feather / Wing Flap Rustle (filtered white noise)
   */
  public playWingFlap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.085;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  /**
   * Organic Bubble / Corn Toss Pop
   */
  public playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.065);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.075);
  }

  /**
   * Natural Egg Drop / Catch Sound (Water droplet / Wooden knock)
   */
  public playEggDrop(isGolden = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (isGolden) {
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
    } else {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.09);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Cheerful Morning Songbird Chirp (for correct educational answers & stage clear)
   */
  public playSuccessBirdChirp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { start: 0, f1: 1100, f2: 1550, dur: 0.09 },
      { start: 0.11, f1: 1300, f2: 1850, dur: 0.12 },
    ];

    notes.forEach((n) => {
      const t = now + n.start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f1, t);
      osc.frequency.exponentialRampToValueAtTime(n.f2, t + n.dur * 0.7);
      osc.frequency.exponentialRampToValueAtTime(n.f1 * 1.1, t + n.dur);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.dur + 0.01);
    });
  }

  /**
   * Gentle Wooden Tap (for UI clicks or gentle "try again")
   */
  public playWoodTap(low = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(low ? 220 : 360, now);
    osc.frequency.exponentialRampToValueAtTime(low ? 130 : 210, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Sweet Natural Kitten Meow ("مياو") for Hoor's photo with the cat
   */
  public playCatMeow() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.38);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * Offline English Word Pronunciation via Web Speech API
   */
  public speakEnglishWord(word: string) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playWoodTap();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.82; // Clear, unhurried pace for a 6-year-old
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.playWoodTap();
    }
  }
}

export const soundFX = new NaturalSoundEngine();
