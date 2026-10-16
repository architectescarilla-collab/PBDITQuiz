/**
 * Tiny synthesized sound effects (Web Audio API) — no audio files to load.
 * Browsers only allow audio after a user gesture, so call `unlock()` from a tap/key handler.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      // half a second of white noise, reused for whooshes and crashes
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate / 2, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private ready() {
    return !this.muted && this.ctx && this.ctx.state === "running" ? this.ctx : null;
  }

  /** A quick upward chirp with a soft wing whoosh. */
  flap() {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    this.noiseBurst(ctx, t, 0.09, 0.07, "bandpass", 1800);
  }

  /** A heavy thump with a crunchy noise hit. */
  crash() {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.42);

    this.noiseBurst(ctx, t, 0.35, 0.3, "lowpass", 1400);
  }

  /** A softer thud when hitting the street after a crash. */
  land() {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
    this.noiseBurst(ctx, t, 0.15, 0.12, "lowpass", 600);
  }

  private noiseBurst(ctx: AudioContext, t: number, dur: number, vol: number, type: BiquadFilterType, freq: number) {
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + dur + 0.02);
  }
}
