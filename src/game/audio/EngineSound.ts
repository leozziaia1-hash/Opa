/**
 * EngineSound.ts - Web Audio API Synthesizer for high-performance race cars
 * Procedurally generates a balanced 50/50 hybrid acoustic profile:
 * - Deep, heavy, guttural American Racing V8 muscle roar (cross-plane firing order, 35-360 Hz)
 * - Subtle, progressive, high-tech F1 hybrid turbo / MGU-K whine (silky sine wave, 1.5-3.4 kHz)
 * - Pure zero-backfire acoustics: no pops, bangs, or artificial detonations.
 */

export class EngineSound {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Branch A: American Muscle Competition V8 Synthesizer (Heavy Low-Mid Core & High-Pressure Exhaust)
  private oscBase: OscillatorNode | null = null;
  private oscHarmonic1: OscillatorNode | null = null;
  private oscHarmonic2: OscillatorNode | null = null;
  private oscIntake: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private combustionWave: PeriodicWave | null = null;
  private collectorWave: PeriodicWave | null = null;
  private gainBase: GainNode | null = null;
  private gainH1: GainNode | null = null;
  private gainH2: GainNode | null = null;
  private gainIntake: GainNode | null = null;
  private gainSub: GainNode | null = null;
  private intakeFilter: BiquadFilterNode | null = null;
  private exhaustResonance: BiquadFilterNode | null = null;
  private exhaustBassPunch: BiquadFilterNode | null = null;
  private revLimiterGain: GainNode | null = null;
  private isAtLimiterActive: boolean = false;
  private nextLimiterTime: number = 0;
  private limiterBarkBuffer: AudioBuffer | null = null;
  private engineBusGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private distortionPreGain: GainNode | null = null;
  private distortionPostGain: GainNode | null = null;

  // Branch B: Subtle High-Tech F1 Hybrid Aero / MGU-K Whine Synthesizer (50/50 Balance)
  private f1WhineOsc: OscillatorNode | null = null;
  private f1WhineFilter: BiquadFilterNode | null = null;
  private f1WhineGain: GainNode | null = null;

  // Turbo whistle
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;

  // Aeroacoustic Wind Roar (V^2 quadratic scaling)
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;

  // Straight-Cut Gearbox Whine & Tarmac Hum
  private gearWhineOsc: OscillatorNode | null = null;
  private gearWhineGain: GainNode | null = null;

  // 3-Band Acoustic Tire Screech & Granular Rubber Friction
  private screechGain: GainNode | null = null;
  private screechFilter: BiquadFilterNode | null = null;
  private screechNoiseBuffer: AudioBuffer | null = null;
  private screechSource: AudioBufferSourceNode | null = null;
  private tireRumbleGain: GainNode | null = null;
  private tireRumbleFilter: BiquadFilterNode | null = null;
  private tireTearGain: GainNode | null = null;
  private tireTearFilter: BiquadFilterNode | null = null;

  // Granular metal barrier scraping & spark crackle synthesizer
  private scrapeGain: GainNode | null = null;
  private scrapeFilter: BiquadFilterNode | null = null;
  private scrapeCrackleGain: GainNode | null = null;
  private scrapeCrackleFilter: BiquadFilterNode | null = null;
  private scrapeNoiseBuffer: AudioBuffer | null = null;
  private scrapeSource: AudioBufferSourceNode | null = null;
  private scrapeCrackleSource: AudioBufferSourceNode | null = null;

  // Flat Tire / Puncture Rhythmic Flapping & Metal Rim Grinding
  private flatTireGain: GainNode | null = null;
  private flatTireFilter: BiquadFilterNode | null = null;
  private flatTireOsc: OscillatorNode | null = null;
  private flatTireThumpGain: GainNode | null = null;

  // Pre-baked noise buffers for zero runtime GC / allocation latency
  private backfireBuffer: AudioBuffer | null = null;
  private crashBuffer: AudioBuffer | null = null;
  private radioSquelchBuffer: AudioBuffer | null = null;
  private lastAudioUpdateTimestamp: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private createCombustionPeriodicWave(): PeriodicWave | null {
    if (!this.ctx) return null;
    const n = 24;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    real[0] = 0;
    imag[0] = 0;

    // Acoustic physical profile of heavy American Competition V8 (cross-plane muscle):
    // Massive visceral fundamental (chest impact), thick manifold growl, heavy mid body, zero shrill treble.
    const amplitudes = [
      0.0,   // 0: DC
      1.35,  // 1: Primary massive cylinder pulse (deep chest punch core)
      1.10,  // 2: Dual exhaust cross-flow rumble
      0.85,  // 3: Cross-plane firing cadence growl
      0.55,  // 4: Cylinder bark
      0.32,  // 5: Low-mid mechanical presence
      0.18,  // 6: Header chamber resonance
      0.09,  // 7
      0.04,  // 8
      0.02,  // 9
      0.008, // 10
      0.004, // 11
    ];
    for (let i = 1; i < Math.min(n, amplitudes.length); i++) {
      imag[i] = amplitudes[i];
    }
    return this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  private createCollectorPeriodicWave(): PeriodicWave | null {
    if (!this.ctx) return null;
    const n = 20;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    real[0] = 0;
    imag[0] = 0;

    // High-pressure manifold collector wave for heavy muscle rumble
    const amplitudes = [
      0.0,  // 0: DC
      1.10, // 1: Manifold throat core
      1.25, // 2: Collector merge rumble
      0.85, // 3: Mid-pressure roar
      0.45, // 4
      0.22, // 5
      0.08, // 6
      0.02, // 7
    ];
    for (let i = 1; i < Math.min(n, amplitudes.length); i++) {
      imag[i] = amplitudes[i];
    }
    return this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  public init(): void {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.48, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Studio-grade Dynamics Compressor for broadcast punch and zero-clipping mix
      // Attack of 12ms and release of 120ms prevents low-frequency waveform cycle modulation / buzzing
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.012, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);
      this.compressor.connect(this.masterGain);

      // Dedicated Competition Racing Engine Bus (Amplified authority & presence)
      this.engineBusGain = this.ctx.createGain();
      this.engineBusGain.gain.setValueAtTime(1.35, this.ctx.currentTime);
      this.engineBusGain.connect(this.compressor);

      // Rev Limiter Staccato Gate (cuts engine combustion instantly on redline)
      this.revLimiterGain = this.ctx.createGain();
      this.revLimiterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.revLimiterGain.connect(this.engineBusGain);

      // Waveshaper Pre-Gain Attenuator: Keeps combined multi-oscillator voltage safely within [-0.92, 0.92]
      // to eliminate intermodulation hard-clipping hash (background interference artifact)
      this.distortionPreGain = this.ctx.createGain();
      this.distortionPreGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

      this.distortion = this.ctx.createWaveShaper();
      this.distortion.curve = this.makeDistortionCurve(4.5) as unknown as Float32Array<ArrayBuffer>;
      this.distortion.oversample = '4x';

      // Waveshaper Post-Gain: Restores the full muscular acoustic volume cleanly after smooth saturation
      this.distortionPostGain = this.ctx.createGain();
      this.distortionPostGain.gain.setValueAtTime(3.6, this.ctx.currentTime);

      // Deep American Exhaust Chamber Resonator (massive open-pipe pressure body)
      this.exhaustResonance = this.ctx.createBiquadFilter();
      this.exhaustResonance.type = 'peaking';
      this.exhaustResonance.frequency.setValueAtTime(230, this.ctx.currentTime);
      this.exhaustResonance.Q.setValueAtTime(2.2, this.ctx.currentTime);
      this.exhaustResonance.gain.setValueAtTime(8.5, this.ctx.currentTime);

      // Visceral Sub-Bass / Exhaust Pressure Punch Resonator (65 - 125 Hz chest punch)
      this.exhaustBassPunch = this.ctx.createBiquadFilter();
      this.exhaustBassPunch.type = 'peaking';
      this.exhaustBassPunch.frequency.setValueAtTime(75, this.ctx.currentTime);
      this.exhaustBassPunch.Q.setValueAtTime(1.9, this.ctx.currentTime);
      this.exhaustBassPunch.gain.setValueAtTime(9.5, this.ctx.currentTime);

      // Warm Engine low-pass filter (strictly removes any shrill high frequencies, keeps muscle body)
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(580, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Branch A Signal Chain:
      // DistortionPreGain -> Distortion -> DistortionPostGain -> Exhaust Resonance -> Exhaust Bass Punch -> Engine Filter -> Rev Limiter Gain -> Engine Bus -> Compressor -> Master
      this.distortionPreGain.connect(this.distortion);
      this.distortion.connect(this.distortionPostGain);
      this.distortionPostGain.connect(this.exhaustResonance);
      this.exhaustResonance.connect(this.exhaustBassPunch);
      this.exhaustBassPunch.connect(this.engineFilter);
      this.engineFilter.connect(this.revLimiterGain);

      // Generate physical cylinder combustion wave and collector wave
      this.combustionWave = this.createCombustionPeriodicWave();
      this.collectorWave = this.createCollectorPeriodicWave();

      // Branch A: Oscillator 1: Primary American V8 ignition pulse train (2.25 pulses per crank revolution)
      this.oscBase = this.ctx.createOscillator();
      if (this.combustionWave) {
        this.oscBase.setPeriodicWave(this.combustionWave);
      } else {
        this.oscBase.type = 'sawtooth';
      }
      this.oscBase.frequency.setValueAtTime(37.5, this.ctx.currentTime); // 37.5 Hz = deep 1000 RPM American V8 idle
      this.gainBase = this.ctx.createGain();
      this.gainBase.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.oscBase.connect(this.gainBase);
      this.gainBase.connect(this.distortionPreGain);
      this.oscBase.start();

      // Branch A: Oscillator 2: Exhaust collector resonance (Collector wave, 2x order harmonic growl)
      this.oscHarmonic1 = this.ctx.createOscillator();
      if (this.collectorWave) {
        this.oscHarmonic1.setPeriodicWave(this.collectorWave);
      } else if (this.combustionWave) {
        this.oscHarmonic1.setPeriodicWave(this.combustionWave);
      } else {
        this.oscHarmonic1.type = 'sawtooth';
      }
      this.oscHarmonic1.frequency.setValueAtTime(75, this.ctx.currentTime);
      this.gainH1 = this.ctx.createGain();
      this.gainH1.gain.setValueAtTime(0.52, this.ctx.currentTime);
      this.oscHarmonic1.connect(this.gainH1);
      this.gainH1.connect(this.distortionPreGain);
      this.oscHarmonic1.start();

      // Branch A: Oscillator 3: Cross-plane firing texture (1.5x order guttural rasp)
      this.oscHarmonic2 = this.ctx.createOscillator();
      this.oscHarmonic2.type = 'triangle';
      this.oscHarmonic2.frequency.setValueAtTime(56, this.ctx.currentTime);
      this.gainH2 = this.ctx.createGain();
      this.gainH2.gain.setValueAtTime(0.44, this.ctx.currentTime);
      this.oscHarmonic2.connect(this.gainH2);
      this.gainH2.connect(this.distortionPreGain);
      this.oscHarmonic2.start();

      // Branch A: Oscillator 4: Big-block Airbox Intake Roar (Deep induction growl)
      this.oscIntake = this.ctx.createOscillator();
      this.oscIntake.type = 'sawtooth';
      this.oscIntake.frequency.setValueAtTime(38, this.ctx.currentTime);
      this.intakeFilter = this.ctx.createBiquadFilter();
      this.intakeFilter.type = 'bandpass';
      this.intakeFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
      this.intakeFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);
      this.gainIntake = this.ctx.createGain();
      this.gainIntake.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.oscIntake.connect(this.intakeFilter);
      this.intakeFilter.connect(this.gainIntake);
      this.gainIntake.connect(this.distortionPreGain);
      this.oscIntake.start();

      // Branch A: Oscillator 5: Sub-bass engine block physical displacement (visceral 40 Hz - 145 Hz rumble)
      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(38, this.ctx.currentTime);
      this.gainSub = this.ctx.createGain();
      this.gainSub.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.oscSub.connect(this.gainSub);
      this.gainSub.connect(this.revLimiterGain); // Sub bass is gated by rev limiter for razor-sharp staccato cuts
      this.oscSub.start();

      // Branch B: Subtle F1 Hybrid Turbo / MGU-K Whine (Smooth pure sine with silky bandpass sweep)
      this.f1WhineOsc = this.ctx.createOscillator();
      this.f1WhineOsc.type = 'sine'; // Pure sine wave: silky, high-tech, zero buzzer harshness
      this.f1WhineOsc.frequency.setValueAtTime(1500, this.ctx.currentTime);

      this.f1WhineFilter = this.ctx.createBiquadFilter();
      this.f1WhineFilter.type = 'bandpass';
      this.f1WhineFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      this.f1WhineFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.f1WhineGain = this.ctx.createGain();
      this.f1WhineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.f1WhineOsc.connect(this.f1WhineFilter);
      this.f1WhineFilter.connect(this.f1WhineGain);
      this.f1WhineGain.connect(this.engineBusGain); // Connected directly into engine bus (sings uninterrupted during limiter cut!)
      this.f1WhineOsc.start();

      // Aeroacoustic Wind Roar (Gear Whine is completely silenced to eliminate any whistle)
      this.setupWindAndGearWhineSound();

      // Tire Screech Loop
      this.setupTireScreech();

      // Granular Metal Barrier Scraping & Spark Sputter Loop
      this.setupScrapeSound();

      // Flat Tire Rhythmic Grinding and Flapping Loop
      this.setupFlatTireSound();

      // Pre-bake staccato rev-limiter bark buffer (0.035s crisp unburnt-fuel crack)
      const barkSize = Math.floor(this.ctx.sampleRate * 0.035);
      this.limiterBarkBuffer = this.ctx.createBuffer(1, barkSize, this.ctx.sampleRate);
      const barkData = this.limiterBarkBuffer.getChannelData(0);
      for (let i = 0; i < barkSize; i++) {
        const env = Math.exp(-i / (this.ctx.sampleRate * 0.007));
        barkData[i] = ((Math.random() * 2 - 1) * 0.85 + Math.sin(i * 0.24) * 0.5) * env;
      }

      // Pre-bake backfire noise buffer (0.16s sharp explosive crack)
      const bfSize = Math.floor(this.ctx.sampleRate * 0.16);
      this.backfireBuffer = this.ctx.createBuffer(1, bfSize, this.ctx.sampleRate);
      const bfData = this.backfireBuffer.getChannelData(0);
      for (let i = 0; i < bfSize; i++) {
        // Exponential shockwave with high initial amplitude
        bfData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.024));
      }

      // Pre-bake crash crunch noise buffer (0.4s)
      const crSize = Math.floor(this.ctx.sampleRate * 0.4);
      this.crashBuffer = this.ctx.createBuffer(1, crSize, this.ctx.sampleRate);
      const crData = this.crashBuffer.getChannelData(0);
      for (let i = 0; i < crSize; i++) {
        crData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      // Pre-bake VHF radio squelch chirp buffer (0.09s)
      const sqSize = Math.floor(this.ctx.sampleRate * 0.09);
      this.radioSquelchBuffer = this.ctx.createBuffer(1, sqSize, this.ctx.sampleRate);
      const sqData = this.radioSquelchBuffer.getChannelData(0);
      for (let i = 0; i < sqSize; i++) {
        sqData[i] = (Math.random() * 2 - 1) * 0.45;
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio could not initialize automatically:', e);
    }
  }

  private playStaccatoBark(time: number): void {
    if (!this.ctx || !this.limiterBarkBuffer || !this.engineBusGain) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.limiterBarkBuffer;

      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'bandpass';
      bFilter.frequency.setValueAtTime(780, time);
      bFilter.Q.setValueAtTime(2.2, time);

      const bGain = this.ctx.createGain();
      bGain.gain.setValueAtTime(0.42, time);
      bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

      src.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.engineBusGain);

      src.start(time);
      src.stop(time + 0.04);
    } catch {}
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      // High-SPL racing exhaust manifold compression:
      // Tanh soft-saturation compresses high pressure peaks while generating warm even and odd overtones
      const driven = x * amount;
      curve[i] = Math.tanh(driven * 1.25) * 0.85 + 0.15 * Math.sin(x * Math.PI * 0.9);
    }
    return curve;
  }

  private setupTireScreech(): void {
    if (!this.ctx || !this.masterGain) return;

    // Create 2 seconds of pink/white noise for multi-band tire friction
    const bufferSize = this.ctx.sampleRate * 2;
    this.screechNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.screechNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }
    // Seamless Hann window taper to eliminate 2-second loop click/interference
    const screechFade = 2048;
    for (let i = 0; i < screechFade; i++) {
      const w = 0.5 * (1 - Math.cos((i * Math.PI) / screechFade));
      data[i] *= w;
      data[bufferSize - 1 - i] *= w;
    }

    // 1. Mid-Band Screech (800 - 2400 Hz elastic rubber peel)
    this.screechFilter = this.ctx.createBiquadFilter();
    this.screechFilter.type = 'bandpass';
    this.screechFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.screechFilter.Q.setValueAtTime(3.8, this.ctx.currentTime);
    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.screechFilter.connect(this.screechGain);
    this.screechGain.connect(this.masterGain);

    // 2. Low-Band Asphalt Scrub Rumble (120 - 450 Hz contact patch vibration)
    this.tireRumbleFilter = this.ctx.createBiquadFilter();
    this.tireRumbleFilter.type = 'lowpass';
    this.tireRumbleFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.tireRumbleGain = this.ctx.createGain();
    this.tireRumbleGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.tireRumbleFilter.connect(this.tireRumbleGain);
    this.tireRumbleGain.connect(this.masterGain);

    // 3. High-Band Rubber Tear & Grain Hiss (Muted to eliminate static noise)
    this.tireTearFilter = this.ctx.createBiquadFilter();
    this.tireTearFilter.type = 'highpass';
    this.tireTearFilter.frequency.setValueAtTime(3800, this.ctx.currentTime);
    this.tireTearGain = this.ctx.createGain();
    this.tireTearGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.tireTearFilter.connect(this.tireTearGain);
    this.tireTearGain.connect(this.masterGain);

    this.startScreechLoop();
  }

  private startScreechLoop(): void {
    if (!this.ctx || !this.screechNoiseBuffer || !this.screechFilter) return;
    this.screechSource = this.ctx.createBufferSource();
    this.screechSource.buffer = this.screechNoiseBuffer;
    this.screechSource.loop = true;

    this.screechSource.connect(this.screechFilter);
    if (this.tireRumbleFilter) this.screechSource.connect(this.tireRumbleFilter);

    this.screechSource.start();
  }

  private setupScrapeSound(): void {
    if (!this.ctx || !this.masterGain) return;

    // 1. High-frequency metallic friction noise buffer (1.5s loop with rapid micro-irregularities)
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
    this.scrapeNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.scrapeNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const raw = (Math.random() * 2 - 1);
      data[i] = raw * 0.55;
    }
    // Seamless Hann window taper to eliminate loop boundary clicks
    const scrapeFade = 2048;
    for (let i = 0; i < scrapeFade; i++) {
      const w = 0.5 * (1 - Math.cos((i * Math.PI) / scrapeFade));
      data[i] *= w;
      data[bufferSize - 1 - i] *= w;
    }

    // Resonant bandpass filter (metal grinding timbre)
    this.scrapeFilter = this.ctx.createBiquadFilter();
    this.scrapeFilter.type = 'bandpass';
    this.scrapeFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    this.scrapeFilter.Q.setValueAtTime(4.2, this.ctx.currentTime);

    this.scrapeGain = this.ctx.createGain();
    this.scrapeGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.scrapeFilter.connect(this.scrapeGain);
    this.scrapeGain.connect(this.masterGain);

    // 2. High-pass spark sputtering crackle layer (muted to prevent electrical interference sound)
    this.scrapeCrackleFilter = this.ctx.createBiquadFilter();
    this.scrapeCrackleFilter.type = 'highpass';
    this.scrapeCrackleFilter.frequency.setValueAtTime(5800, this.ctx.currentTime);

    this.scrapeCrackleGain = this.ctx.createGain();
    this.scrapeCrackleGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.scrapeCrackleFilter.connect(this.scrapeCrackleGain);
    this.scrapeCrackleGain.connect(this.masterGain);

    this.startScrapeLoop();
  }

  private startScrapeLoop(): void {
    if (!this.ctx || !this.scrapeNoiseBuffer) return;
    this.scrapeSource = this.ctx.createBufferSource();
    this.scrapeSource.buffer = this.scrapeNoiseBuffer;
    this.scrapeSource.loop = true;
    if (this.scrapeFilter) {
      this.scrapeSource.connect(this.scrapeFilter);
    }
    this.scrapeSource.start();
  }

  private setupWindAndGearWhineSound(): void {
    if (!this.ctx || !this.masterGain) return;

    // 1. Aeroacoustic High-Speed Wind Roar (Pink/white noise with dynamic speed-bandpass sweep)
    const windBufferSize = Math.floor(this.ctx.sampleRate * 2.0);
    const windBuffer = this.ctx.createBuffer(1, windBufferSize, this.ctx.sampleRate);
    const data = windBuffer.getChannelData(0);
    // 1/f Pink-filtered distribution for rich low-frequency wind rush
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < windBufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.5;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.16;
      b6 = white * 0.115926;
    }
    // Seamless Hann window taper to eliminate 2-second loop click
    const windFade = 2048;
    for (let i = 0; i < windFade; i++) {
      const w = 0.5 * (1 - Math.cos((i * Math.PI) / windFade));
      data[i] *= w;
      data[windBufferSize - 1 - i] *= w;
    }

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = windBuffer;
    this.windSource.loop = true;
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windSource.start();

    // 2. Straight-Cut Transmission Gearbox Whine (Muted to eliminate artificial whistle)
    this.gearWhineGain = this.ctx.createGain();
    this.gearWhineGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gearWhineGain.connect(this.masterGain);
  }

  /**
   * Real-time continuous scraping / metal friction sound modulation
   * @param intensity 0.0 to 1.0 friction force
   * @param speedKmh vehicle speed in km/h
   */
  public updateScrape(intensity: number, speedKmh: number): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const targetGain = Math.min(0.7, Math.max(0, intensity * 0.65)) * Math.min(1.0, speedKmh / 15.0);

    if (this.scrapeGain) {
      this.scrapeGain.gain.setTargetAtTime(targetGain, t, 0.035);
    }
    if (this.scrapeCrackleGain) {
      this.scrapeCrackleGain.gain.setTargetAtTime(0, t, 0.025);
    }
    if (this.scrapeFilter) {
      // Frequency shifts with speed (grinding pitch rises with speed)
      const targetFreq = Math.min(6500, 2400 + speedKmh * 24.0);
      this.scrapeFilter.frequency.setTargetAtTime(targetFreq, t, 0.04);
    }
  }

  public resume(): void {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Update engine sound parameters every frame
   * @param rpm Current engine RPM (e.g. 1000 - 9500)
   * @param throttle Throttle pedal position (0.0 - 1.0)
   * @param slipRatio Lateral/longitudinal tire slip factor (0.0 - 1.0)
   * @param speed Car speed in m/s
   * @param engineHealth Factor 0.0 to 1.0
   */
  public update(rpm: number, throttle: number, slipRatio: number, speed: number, engineHealth: number = 1.0): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const now = performance.now();
    // Throttle high-frequency AudioParam updates to ~38 Hz (26ms).
    // Web Audio's setTargetAtTime seamlessly and continuously interpolates across updates.
    if (now - this.lastAudioUpdateTimestamp < 26) return;
    this.lastAudioUpdateTimestamp = now;

    const t = this.ctx.currentTime;

    // Competition American Muscle V8 firing profile (2.25 pulses per crank rev):
    // 37.5 Hz at idle (1000 RPM) to 356 Hz at redline (9500 RPM) - heavy, deep guttural roar
    const rps = rpm / 60;
    const baseFreq = Math.max(34, rps * 2.25);
    const rpmNorm = Math.min(1.0, Math.max(0.0, (rpm - 1000) / (9500 - 1000)));
    const throttleNorm = Math.min(1.0, Math.max(0.0, throttle));
    const throttleSq = Math.pow(throttleNorm, 1.25);

    // American Cross-Plane V8 Camshaft Idle Lope ("chug-chug-chug" uneven muscle lope at idle)
    const camLope = (1.0 - rpmNorm) * (Math.sin(now * 0.024) * 0.16 + Math.sin(now * 0.012) * 0.10);

    // Smooth mechanical misfire lope when engine is damaged (eliminates random white-noise jitter that sounded like interference)
    const healthJitter = engineHealth < 0.6 ? Math.sin(now * 0.018) * (1 - engineHealth) * 8.0 : 0;

    // --- ULTRA-RAPID AGGRESSIVE COMPETITION STACCATO REV LIMITER ("AL CORTE") ---
    const isAtRevLimiter = rpm >= 9320 && throttleNorm > 0.45;

    if (isAtRevLimiter) {
      if (!this.isAtLimiterActive || this.nextLimiterTime < t) {
        this.isAtLimiterActive = true;
        this.nextLimiterTime = t;
      }

      // 19.2 Hz machine-gun competition ignition cut: 52ms total cycle
      // 28ms explosive firing burst + 24ms instantaneous dead spark cut
      const cyclePeriod = 0.052;
      const fireDuration = 0.028;

      while (this.nextLimiterTime < t + 0.09) {
        const tFire = this.nextLimiterTime;
        const tCut = tFire + fireDuration;

        if (this.revLimiterGain) {
          // Instant high-amplitude refire pulse
          this.revLimiterGain.gain.setValueAtTime(1.25, tFire);
          // Razor-sharp dead cut
          this.revLimiterGain.gain.setValueAtTime(0.03, tCut);
        }

        // Trigger violent unburnt-fuel exhaust crack transient
        this.playStaccatoBark(tFire);

        this.nextLimiterTime += cyclePeriod;
      }
    } else {
      if (this.isAtLimiterActive) {
        this.isAtLimiterActive = false;
        if (this.revLimiterGain) {
          this.revLimiterGain.gain.cancelScheduledValues(t);
          this.revLimiterGain.gain.setValueAtTime(this.revLimiterGain.gain.value, t);
          this.revLimiterGain.gain.setTargetAtTime(1.0, t, 0.018);
        }
        this.nextLimiterTime = t;
      }
    }

    // Branch A: Dynamic American Muscle Oscillator Frequency Modulation
    if (this.oscBase) {
      this.oscBase.frequency.setTargetAtTime(baseFreq + (camLope * 5.0) + healthJitter, t, 0.035);
    }
    if (this.oscHarmonic1) {
      // 2nd order harmonic (manifold collector growl)
      this.oscHarmonic1.frequency.setTargetAtTime(baseFreq * 2.0, t, 0.035);
    }
    if (this.oscHarmonic2) {
      // 1.5 order cross-plane texture (exact harmonic integer ratio, eliminates intermodulation beating)
      this.oscHarmonic2.frequency.setTargetAtTime(baseFreq * 1.5, t, 0.035);
    }
    if (this.oscIntake) {
      // Big-block intake scoop roar
      this.oscIntake.frequency.setTargetAtTime(baseFreq * 1.0, t, 0.04);
    }
    if (this.oscSub) {
      // Sub-bass crankshaft displacement (punchy 40 - 145 Hz)
      this.oscSub.frequency.setTargetAtTime(Math.max(40, rps * 1.45), t, 0.035);
    }

    // Branch B: Synthetic F1 Hybrid / MGU-K Whine completely silenced to permanently eliminate radio interference whistle
    if (this.f1WhineGain) {
      this.f1WhineGain.gain.setTargetAtTime(0.0, t, 0.04);
    }

    // Branch A Mix: massive guttural American muscle roar with reinforced deep bass
    if (this.gainBase) {
      const baseVol = (0.75 + 0.28 * rpmNorm + 0.32 * throttleSq) * (1.0 + camLope);
      this.gainBase.gain.setTargetAtTime(baseVol, t, 0.03);
    }
    if (this.gainH1) {
      const h1Vol = 0.52 + 0.30 * rpmNorm + 0.28 * throttleSq;
      this.gainH1.gain.setTargetAtTime(h1Vol, t, 0.03);
    }
    if (this.gainH2) {
      const h2Vol = 0.44 + 0.24 * rpmNorm + 0.22 * throttleSq;
      this.gainH2.gain.setTargetAtTime(h2Vol, t, 0.03);
    }
    if (this.gainIntake && this.intakeFilter) {
      const intakeVol = throttleSq * (0.55 + 0.35 * rpmNorm);
      this.gainIntake.gain.setTargetAtTime(Math.max(0.001, intakeVol), t, 0.035);
      this.intakeFilter.frequency.setTargetAtTime(240 + rpmNorm * 280 + throttleNorm * 140, t, 0.04);
    }
    if (this.gainSub) {
      const subVol = 0.85 + 0.45 * throttleSq;
      this.gainSub.gain.setTargetAtTime(subVol, t, 0.03);
    }

    // Visceral Sub-Bass & Exhaust Pressure Punch (65 - 125 Hz chest punch)
    if (this.exhaustBassPunch) {
      const bassPunchFreq = 70 + rpmNorm * 45 + throttleNorm * 20;
      this.exhaustBassPunch.frequency.setTargetAtTime(bassPunchFreq, t, 0.04);
      this.exhaustBassPunch.gain.setTargetAtTime(8.5 + throttleSq * 4.5, t, 0.04);
    }

    // American Exhaust chamber resonance (warm 230 Hz - 440 Hz body)
    if (this.exhaustResonance) {
      const resonanceFreq = 230 + rpmNorm * 180 + throttleNorm * 80;
      this.exhaustResonance.frequency.setTargetAtTime(resonanceFreq, t, 0.04);
      this.exhaustResonance.gain.setTargetAtTime(7.5 + throttleNorm * 3.5, t, 0.04);
    }

    // Engine lowpass filter (warm cutoff 520 Hz to 1850 Hz - strictly zero shrill buzzers)
    if (this.engineFilter) {
      const minCutoff = 520;
      const maxCutoff = 1850;
      const targetCutoff = minCutoff + (maxCutoff - minCutoff) * Math.pow(Math.max(throttleNorm, 0.30 * rpmNorm), 1.15);
      this.engineFilter.frequency.setTargetAtTime(targetCutoff, t, 0.04);
    }

    // 3-Band Dynamic Acoustic Tire Friction Modulation
    const speedGate = Math.min(1.0, Math.max(0, (speed - 1.5) / 4.0));
    const slipIntensity = Math.min(1.0, Math.max(0.0, (slipRatio - 0.22) * 1.6)) * speedGate;

    // 1. Mid-Band Squeal
    if (this.screechGain && this.screechFilter) {
      this.screechGain.gain.setTargetAtTime(slipIntensity * 0.32, t, 0.04);
      const screechPitch = 1050 + slipRatio * 750 + speed * 12.0;
      this.screechFilter.frequency.setTargetAtTime(screechPitch, t, 0.04);
    }

    // 2. Low-Band Heavy Scrub Rumble
    if (this.tireRumbleGain && this.tireRumbleFilter) {
      const rumbleIntensity = Math.min(1.0, Math.max(0.0, (slipRatio - 0.18) * 1.8)) * speedGate;
      this.tireRumbleGain.gain.setTargetAtTime(rumbleIntensity * 0.24, t, 0.04);
      const rumbleFreq = 180 + Math.min(220, speed * 4.0);
      this.tireRumbleFilter.frequency.setTargetAtTime(rumbleFreq, t, 0.04);
    }
    // 3. High-Band Rubber Tear & Grain Hiss (Muted to eliminate static noise/interference)
    if (this.tireTearGain) {
      this.tireTearGain.gain.setTargetAtTime(0, t, 0.04);
    }

    // 1. Aeroacoustic Wind Roar: Smooth quadratic profile starting only at high speeds (> 43 km/h)
    if (this.windGain && this.windFilter) {
      const speedKmh = speed * 3.6;

      let buffetingBonus = 0;
      if (speedKmh > 200) {
        buffetingBonus = Math.pow(Math.min(1.0, (speedKmh - 200) / 140.0), 1.8) * 0.32;
      }

      const windMinSpeed = 12.0; // ~43 km/h
      const windTargetGain = speed < windMinSpeed
        ? 0.0
        : (Math.pow(Math.max(0, (speed - windMinSpeed) / 86.0), 2.2) * 0.35) + buffetingBonus;
      this.windGain.gain.setTargetAtTime(windTargetGain, t, 0.05);

      // Lowpass cutoff expands gently with speed, avoiding any high-frequency radio static hiss
      const targetCutoff = 250 + Math.pow(Math.max(0, (speed - windMinSpeed) / 86.0), 1.5) * 2600 + buffetingBonus * 800;
      this.windFilter.frequency.setTargetAtTime(targetCutoff, t, 0.05);
    }

    // Transmission Gear Whine is muted to eliminate artificial whistle sounds
    if (this.gearWhineGain) {
      this.gearWhineGain.gain.setTargetAtTime(0, t, 0.05);
    }
  }

  /**
   * Sound effect for gear changes, rev-limiters and lift-off backfires
   * Intentionally silenced per user specification: ZERO pops, bangs, or backfires
   */
  public triggerBackfire(_isHighRpm: boolean = false): void {
    // Zero-backfire acoustic profile: completely muted
    return;
  }

  /**
   * Collision sound effect with volume and pitch scaled by impact force (zero-allocation)
   */
  public triggerCrash(impactForce: number): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const normalizedForce = Math.min(1.0, Math.max(0.1, impactForce / 35));

    // Low frequency punch
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(normalizedForce * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.4);

    // Crunch noise using pre-baked buffer
    const noise = this.ctx.createBufferSource();
    if (this.crashBuffer) {
      noise.buffer = this.crashBuffer;
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(2.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(normalizedForce * 0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    noise.start(t);
  }

  /**
   * Sound effect for pneumatic hydraulic car lift jacks (hiss & clank)
   */
  public triggerPneumaticJack(isUp: boolean): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Compressed air burst (noise with bandpass sweep)
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isUp ? 2200 : 1200, t);
    filter.frequency.exponentialRampToValueAtTime(isUp ? 600 : 300, t + 0.35);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(t);

    // Mechanical jack latch clank
    const clankOsc = this.ctx.createOscillator();
    const clankGain = this.ctx.createGain();
    clankOsc.type = 'triangle';
    clankOsc.frequency.setValueAtTime(isUp ? 380 : 180, t + 0.05);
    clankOsc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    clankGain.gain.setValueAtTime(0.4, t + 0.05);
    clankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    clankOsc.connect(clankGain);
    clankGain.connect(this.masterGain!);
    clankOsc.start(t + 0.05);
    clankOsc.stop(t + 0.22);
  }

  /**
   * Sound effect for high-speed pneumatic impact wrench unbolting/bolting wheel nuts
   */
  public triggerWheelGunRattle(): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Rapid rat-tat-tat pulses
    const pulseCount = 6;
    for (let p = 0; p < pulseCount; p++) {
      const pt = t + p * 0.038;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400 + Math.random() * 400, pt);
      osc.frequency.exponentialRampToValueAtTime(350, pt + 0.03);

      gain.gain.setValueAtTime(0.22, pt);
      gain.gain.exponentialRampToValueAtTime(0.001, pt + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(pt);
      osc.stop(pt + 0.04);
    }
  }

  private setupFlatTireSound(): void {
    if (!this.ctx || !this.masterGain) return;

    // Rhythmic rim grinding / flat tire noise bandpass
    this.flatTireFilter = this.ctx.createBiquadFilter();
    this.flatTireFilter.type = 'bandpass';
    this.flatTireFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.flatTireFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.flatTireGain = this.ctx.createGain();
    this.flatTireGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.flatTireFilter.connect(this.flatTireGain);
    this.flatTireGain.connect(this.masterGain);

    // Low-frequency cyclic thumping oscillator (slapping rubber on wheel rotation)
    this.flatTireOsc = this.ctx.createOscillator();
    this.flatTireOsc.type = 'sawtooth';
    this.flatTireOsc.frequency.setValueAtTime(14, this.ctx.currentTime);

    this.flatTireThumpGain = this.ctx.createGain();
    this.flatTireThumpGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const thumpFilter = this.ctx.createBiquadFilter();
    thumpFilter.type = 'lowpass';
    thumpFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

    this.flatTireOsc.connect(thumpFilter);
    thumpFilter.connect(this.flatTireThumpGain);
    this.flatTireThumpGain.connect(this.masterGain);
    this.flatTireOsc.start();

    // Connect noise buffer to flat tire filter
    if (this.scrapeNoiseBuffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.scrapeNoiseBuffer;
      source.loop = true;
      source.connect(this.flatTireFilter);
      source.start();
    }
  }

  /**
   * Real-time continuous flat tire flapping / rim grinding sound modulation
   */
  public updateFlatTireSound(hasPuncture: boolean, speedMs: number): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const speedKmh = speedMs * 3.6;

    if (hasPuncture && speedKmh > 2.0) {
      // Flapping frequency scales directly with wheel rotational velocity
      const flapFreq = Math.max(3, Math.min(35, speedMs * 2.8));
      const targetGain = Math.min(0.65, 0.15 + (speedKmh / 50.0) * 0.45);

      if (this.flatTireOsc) {
        this.flatTireOsc.frequency.setTargetAtTime(flapFreq, t, 0.04);
      }
      if (this.flatTireThumpGain) {
        this.flatTireThumpGain.gain.setTargetAtTime(targetGain * 0.75, t, 0.04);
      }
      if (this.flatTireGain) {
        this.flatTireGain.gain.setTargetAtTime(targetGain * 0.55, t, 0.04);
      }
      if (this.flatTireFilter) {
        const centerFreq = 320 + speedKmh * 18.0;
        this.flatTireFilter.frequency.setTargetAtTime(centerFreq, t, 0.05);
      }
    } else {
      if (this.flatTireThumpGain) {
        this.flatTireThumpGain.gain.setTargetAtTime(0, t, 0.06);
      }
      if (this.flatTireGain) {
        this.flatTireGain.gain.setTargetAtTime(0, t, 0.06);
      }
    }
  }

  /**
   * Explosive pneumatic tire blowout sound effect ("BANG! PSHHHHH!")
   */
  public triggerTireBlowout(): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Explosive Shockwave Burst (Heavy Low-Mid Transient Pop)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sawtooth';
    popOsc.frequency.setValueAtTime(320, t);
    popOsc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    popGain.gain.setValueAtTime(0.85, t);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain!);
    popOsc.start(t);
    popOsc.stop(t + 0.25);

    // 2. High-Pressure Air Decompression Hiss ("PSHHHHH!")
    const hissLen = Math.floor(this.ctx.sampleRate * 0.85);
    const hissBuffer = this.ctx.createBuffer(1, hissLen, this.ctx.sampleRate);
    const hissData = hissBuffer.getChannelData(0);
    for (let i = 0; i < hissLen; i++) {
      hissData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.28));
    }

    const hissSource = this.ctx.createBufferSource();
    hissSource.buffer = hissBuffer;

    const hissFilter = this.ctx.createBiquadFilter();
    hissFilter.type = 'highpass';
    hissFilter.frequency.setValueAtTime(1800, t);
    hissFilter.frequency.exponentialRampToValueAtTime(600, t + 0.7);

    const hissGain = this.ctx.createGain();
    hissGain.gain.setValueAtTime(0.6, t);
    hissGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    hissSource.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(this.masterGain!);
    hissSource.start(t);

    // 3. Metallic Rim Hit Transient
    const rimOsc = this.ctx.createOscillator();
    const rimGain = this.ctx.createGain();
    rimOsc.type = 'square';
    rimOsc.frequency.setValueAtTime(980, t + 0.02);
    rimOsc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    rimGain.gain.setValueAtTime(0.45, t + 0.02);
    rimGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    rimOsc.connect(rimGain);
    rimGain.connect(this.masterGain!);
    rimOsc.start(t + 0.02);
    rimOsc.stop(t + 0.16);
  }

  /**
   * Pit stop completion sound
   */
  public triggerPitChime(): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.3);
    });
  }

  /**
   * Synthesize authentic F1 Pit Radio communications with VHF static, bandpass filter & roger beeps
   */
  public triggerPitRadio(cue: 'box' | 'tyres' | 'go' | 'puncture'): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. VHF Radio Static Squelch Burst (Opening chirp - 0 runtime allocations)
    if (this.radioSquelchBuffer) {
      const squelchSource = this.ctx.createBufferSource();
      squelchSource.buffer = this.radioSquelchBuffer;

      const squelchFilter = this.ctx.createBiquadFilter();
      squelchFilter.type = 'bandpass';
      squelchFilter.frequency.setValueAtTime(2100, t);
      squelchFilter.Q.setValueAtTime(4.0, t);

      const squelchGain = this.ctx.createGain();
      squelchGain.gain.setValueAtTime(0, t);
    }

    // 2. F1 Team Radio Audio Bus with telephone bandpass filter (400Hz to 3200Hz)
    const radioFilter = this.ctx.createBiquadFilter();
    radioFilter.type = 'bandpass';
    radioFilter.frequency.setValueAtTime(1400, t);
    radioFilter.Q.setValueAtTime(1.8, t);

    const radioGain = this.ctx.createGain();
    radioGain.gain.setValueAtTime(0.24, t);
    radioGain.connect(this.masterGain!);
    radioFilter.connect(radioGain);

    // 3. Formant Vocal Cues depending on event
    if (cue === 'box' || cue === 'puncture') {
      // "Puncture / Box now" - urgent high-low dual tones
      [0.08, 0.24, 0.42, 0.58].forEach((timeOffset, idx) => {
        const osc = this.ctx!.createOscillator();
        const oGain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 520 : 380, t + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(280, t + timeOffset + 0.11);

        oGain.gain.setValueAtTime(0.32, t + timeOffset);
        oGain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.12);

        osc.connect(oGain);
        oGain.connect(radioFilter);
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.13);
      });
    } else if (cue === 'tyres') {
      // "Tyres on" - dual harmonic vocal burst
      [0.08, 0.26].forEach((timeOffset, idx) => {
        const osc = this.ctx!.createOscillator();
        const oGain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440 - idx * 60, t + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(300, t + timeOffset + 0.14);

        oGain.gain.setValueAtTime(0.28, t + timeOffset);
        oGain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.15);

        osc.connect(oGain);
        oGain.connect(radioFilter);
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.16);
      });
    } else if (cue === 'go') {
      // "Go, Go, Go!" - rising triple urgent burst
      [0.08, 0.22, 0.36].forEach((timeOffset, idx) => {
        const osc = this.ctx!.createOscillator();
        const oGain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380 + idx * 90, t + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(540 + idx * 80, t + timeOffset + 0.1);

        oGain.gain.setValueAtTime(0.32, t + timeOffset);
        oGain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.11);

        osc.connect(oGain);
        oGain.connect(radioFilter);
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.12);
      });
    }

    // 4. Roger Beep (Transmission end chirp at t + 0.68s)
    const beepTime = t + 0.68;
    const beepOsc = this.ctx.createOscillator();
    const beepGain = this.ctx.createGain();
    beepOsc.type = 'sine';
    beepOsc.frequency.setValueAtTime(1920, beepTime);
    beepGain.gain.setValueAtTime(0.15, beepTime);
    beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.05);

    beepOsc.connect(beepGain);
    beepGain.connect(this.masterGain!);
    beepOsc.start(beepTime);
    beepOsc.stop(beepTime + 0.06);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.40, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public pause(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public dispose(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        if (this.oscBase) { this.oscBase.stop(); this.oscBase.disconnect(); }
        if (this.oscHarmonic1) { this.oscHarmonic1.stop(); this.oscHarmonic1.disconnect(); }
        if (this.oscHarmonic2) { this.oscHarmonic2.stop(); this.oscHarmonic2.disconnect(); }
        if (this.oscIntake) { this.oscIntake.stop(); this.oscIntake.disconnect(); }
        if (this.oscSub) { this.oscSub.stop(); this.oscSub.disconnect(); }
        if (this.gearWhineOsc) { this.gearWhineOsc.stop(); this.gearWhineOsc.disconnect(); }
        if (this.f1WhineOsc) { this.f1WhineOsc.stop(); this.f1WhineOsc.disconnect(); }
        if (this.flatTireOsc) { this.flatTireOsc.stop(); this.flatTireOsc.disconnect(); }
        if (this.revLimiterGain) { this.revLimiterGain.disconnect(); }
        if (this.exhaustBassPunch) { this.exhaustBassPunch.disconnect(); }
        if (this.distortionPreGain) { this.distortionPreGain.disconnect(); }
        if (this.distortionPostGain) { this.distortionPostGain.disconnect(); }
      } catch {
        // Safe catch for already stopped nodes
      }
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}
