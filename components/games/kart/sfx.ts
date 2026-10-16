/**
 * PBDIT Kart sounds, synthesized with the Web Audio API (no audio files).
 * Call unlock() from a user gesture (browsers block audio until then).
 */
export class KartSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private engine: { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null = null;
  private _muted = false;

  get muted() {
    return this._muted;
  }
  set muted(m: boolean) {
    this._muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.02);
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.8;
      this.master.connect(this.ctx.destination);
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private live() {
    return this.ctx && this.master && this.ctx.state === "running" ? { ctx: this.ctx, out: this.master } : null;
  }

  private tone(
    freq: number,
    dur: number,
    opts: { type?: OscillatorType; vol?: number; to?: number; delay?: number } = {},
  ) {
    const a = this.live();
    if (!a) return;
    const t = a.ctx.currentTime + (opts.delay ?? 0);
    const o = a.ctx.createOscillator();
    const g = a.ctx.createGain();
    o.type = opts.type ?? "square";
    o.frequency.setValueAtTime(freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private hiss(dur: number, vol: number, type: BiquadFilterType, freq: number, delay = 0) {
    const a = this.live();
    if (!a || !this.noise) return;
    const t = a.ctx.currentTime + delay;
    const src = a.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = a.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.out);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Continuous engine hum; pitch follows speed. */
  setEngine(speed: number, on: boolean) {
    const a = this.live();
    if (!a) return;
    if (!this.engine) {
      const osc = a.ctx.createOscillator();
      const osc2 = a.ctx.createOscillator();
      const filter = a.ctx.createBiquadFilter();
      const gain = a.ctx.createGain();
      osc.type = "sawtooth";
      osc2.type = "square";
      filter.type = "lowpass";
      filter.frequency.value = 600;
      gain.gain.value = 0;
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain).connect(a.out);
      osc.start();
      osc2.start();
      this.engine = { osc, osc2, gain, filter };
    }
    const t = a.ctx.currentTime;
    const f = 55 + Math.max(0, speed) * 3.2;
    this.engine.osc.frequency.setTargetAtTime(f, t, 0.05);
    this.engine.osc2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.engine.filter.frequency.setTargetAtTime(400 + speed * 22, t, 0.05);
    this.engine.gain.gain.setTargetAtTime(on ? 0.045 : 0, t, 0.08);
  }

  countdown(n: number) {
    this.tone(n > 0 ? 440 : 880, n > 0 ? 0.18 : 0.45, { type: "square", vol: 0.14 });
  }
  pickup() {
    [660, 880, 1100].forEach((f, i) => this.tone(f, 0.08, { type: "triangle", vol: 0.12, delay: i * 0.06 }));
  }
  boost() {
    this.tone(220, 0.5, { type: "sawtooth", to: 900, vol: 0.1 });
    this.hiss(0.5, 0.18, "bandpass", 1600);
  }
  freeze() {
    this.tone(1800, 0.35, { type: "sine", to: 600, vol: 0.12 });
    this.hiss(0.25, 0.2, "highpass", 4000);
  }
  shield() {
    [523, 784, 1046].forEach((f, i) => this.tone(f, 0.25, { type: "sine", vol: 0.1, delay: i * 0.05 }));
  }
  swap() {
    this.tone(300, 0.35, { type: "sine", to: 1200, vol: 0.12 });
    this.tone(1200, 0.35, { type: "sine", to: 300, vol: 0.08, delay: 0.05 });
  }
  blocked() {
    this.tone(180, 0.2, { type: "square", vol: 0.12 });
    this.hiss(0.15, 0.2, "bandpass", 2500);
  }
  wall() {
    this.tone(90, 0.15, { type: "sine", to: 50, vol: 0.25 });
    this.hiss(0.12, 0.15, "lowpass", 800);
  }
  lap() {
    this.tone(988, 0.1, { type: "square", vol: 0.1 });
    this.tone(1318, 0.25, { type: "square", vol: 0.1, delay: 0.1 });
  }
  finish(won: boolean) {
    const notes = won ? [523, 659, 784, 1046, 784, 1046] : [523, 494, 440, 392];
    notes.forEach((f, i) => this.tone(f, 0.18, { type: "square", vol: 0.1, delay: i * 0.13 }));
  }
  fizzle() {
    this.tone(200, 0.2, { type: "triangle", to: 120, vol: 0.1 });
  }

  stop() {
    if (this.engine && this.ctx) this.engine.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }
  dispose() {
    this.engine?.osc.stop();
    this.engine?.osc2.stop();
    this.engine = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}
