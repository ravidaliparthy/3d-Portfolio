/**
 * Generative Web Audio API Synthesizer
 * Produces cinematic train ambiances, rhythmic wheel clatter, station arrival chimes,
 * train whistle, and passing train Doppler whoosh directly in code.
 * Zero licensing risk, zero payload overhead.
 */
class TrainAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private clatterInterval: number | null = null;

  public init(): boolean {
    if (this.ctx) return true;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupEngineHum();
      return true;
    } catch (e) {
      console.warn('[Audio] Web Audio API failed to initialize:', e);
      return false;
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupEngineHum(): void {
    if (!this.ctx || !this.masterGain) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.09, this.ctx.currentTime);

    // Deep sub-bass hum
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(54, this.ctx.currentTime);

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'sine';
    this.engineOsc2.frequency.setValueAtTime(108, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.engineOsc1.connect(filter);
    this.engineOsc2.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();

    this.startRailClatter();
  }

  private startRailClatter(): void {
    if (this.clatterInterval) clearInterval(this.clatterInterval);

    this.clatterInterval = window.setInterval(() => {
      this.playRailClick();
    }, 720);
  }

  private playRailClick(): void {
    if (!this.ctx || !this.masterGain || this.masterGain.gain.value < 0.01) return;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /**
   * Passing Train Doppler Whoosh Effect
   * Simulates high-speed oncoming train passing on counter-track with pitch shift and stereo panning
   */
  public playPassingTrainDoppler(): void {
    if (!this.ctx || !this.masterGain || this.masterGain.gain.value < 0.01) return;
    this.resume();

    const now = this.ctx.currentTime;
    const duration = 2.4;

    // Dual noise burst for air displacement
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      channel[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant bandpass filter with Doppler frequency shift
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.0, now);
    filter.frequency.setValueAtTime(260, now);
    // Peak approach
    filter.frequency.exponentialRampToValueAtTime(680, now + 0.95);
    // Sudden Doppler drop
    filter.frequency.exponentialRampToValueAtTime(190, now + 1.3);
    filter.frequency.exponentialRampToValueAtTime(90, now + duration);

    // Stereo Panner
    let panner: StereoPannerNode | GainNode;
    if (this.ctx.createStereoPanner) {
      const sp = this.ctx.createStereoPanner();
      sp.pan.setValueAtTime(-0.85, now);
      sp.pan.linearRampToValueAtTime(0.85, now + duration);
      panner = sp;
    } else {
      panner = this.ctx.createGain();
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 1.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * Train Whistle (dual harmonic sines in minor third)
   */
  public playWhistle(): void {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.linearRampToValueAtTime(620, now + 0.8);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(698.46, now); // F5
    osc2.frequency.linearRampToValueAtTime(730, now + 0.8);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.25);
    osc2.stop(now + 1.25);
  }

  /**
   * Station arrival chime (gentle pentatonic bell)
   */
  public playStationChime(): void {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.16;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.85);
    });
  }

  public setMuted(muted: boolean): void {
    if (!this.masterGain || !this.ctx) return;
    const target = muted ? 0 : 0.65;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }
}

export const trainAudio = new TrainAudioSynthesizer();
