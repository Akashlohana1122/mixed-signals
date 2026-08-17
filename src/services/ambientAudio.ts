// Ambient lo-fi sound generator using Web Audio API (Ultra-Realistic Stereo Procedural Synthesis & Thunderclap Engine)

import { RainIntensityType } from '../types';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Realistic Multi-Layer Rain Engine Nodes
  private rainBedSource1: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private rainFilterPresence: BiquadFilterNode | null = null;
  private rainFilterLow: BiquadFilterNode | null = null;
  private rainFilterHigh: BiquadFilterNode | null = null;
  private rainDropInterval: number | null = null;
  private windLfoOsc: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;
  private isRainActive = false;
  private rainTargetVolume = 0.45;
  private rainIntensityLevel: RainIntensityType = 'pour';

  // Tape Hiss Nodes (Cassette Lounge)
  private tapeHissSource: AudioBufferSourceNode | null = null;
  private tapeGain: GainNode | null = null;
  private isTapeActive = false;
  private tapeTargetVolume = 0.26;

  // Night Drive Cabin Nodes (Midnight Synth)
  private driveSource: AudioBufferSourceNode | null = null;
  private driveGain: GainNode | null = null;
  private driveCityDroneOsc1: OscillatorNode | null = null;
  private driveCityDroneOsc2: OscillatorNode | null = null;
  private driveCityDroneGain: GainNode | null = null;
  private driveFilterLow: BiquadFilterNode | null = null;
  private driveFilterPavement: BiquadFilterNode | null = null;
  private isDriveActive = false;
  private driveTargetVolume = 0.24;

  // Sunset Coastal Ocean Waves & Twilight Breeze Nodes (Sunset Highway)
  private coastalSource: AudioBufferSourceNode | null = null;
  private coastalGain: GainNode | null = null;
  private coastalFilterLow: BiquadFilterNode | null = null;
  private coastalFilterResonance: BiquadFilterNode | null = null;
  private coastalWaveLfo: OscillatorNode | null = null;
  private coastalWaveGain: GainNode | null = null;
  private isCoastalActive = false;
  private coastalTargetVolume = 0.24;

  // Midnight Vinyl Groove & Dust Crackle Nodes (Midnight Vinyl)
  private vinylSource: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private vinylFilter: BiquadFilterNode | null = null;
  private isVinylActive = false;
  private vinylTargetVolume = 0.22;

  private isMuted = false;

  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Ensure AudioContext is running on user gesture (does NOT spuriously start unselected synths)
  public resumeOnInteraction() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Set Master Volume with smooth, clickless linear and exponential ramping
  public setMasterVolumeRamp(targetVolume: number, rampDuration = 0.18) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.0001, Math.min(1.0, targetVolume));
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(clamped, now + rampDuration);
    } catch {
      this.masterGain.gain.setValueAtTime(clamped, now);
    }
  }

  // Listening Mode Transition Audio Filter & Immediate Volume Ramp
  // (Prevents harsh speaker/headphone volume spikes & shapes acoustic profile smoothly)
  public applyListeningModeAcoustics(mode: 'headphones' | 'drive' | 'background' | 'speaker', rampDuration = 0.22) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    try {
      let targetMasterGain = 1.0;

      switch (mode) {
        case 'headphones':
          // Neutral pristine clarity with slight safety headroom
          targetMasterGain = 0.95;
          break;
        case 'speaker':
          // Smooth headroom limiter to prevent harsh clipping/spikes on external speakers
          targetMasterGain = 0.88;
          break;
        case 'drive':
          // Enhanced dynamic clarity for car / road cabin listening
          targetMasterGain = 1.0;
          break;
        case 'background':
          // Gentle warm pad reduction for ambient background focus
          targetMasterGain = 0.82;
          break;
      }

      // Smooth clickless volume ramp to prevent abrupt pops/spikes
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.95, now);
      this.masterGain.gain.linearRampToValueAtTime(targetMasterGain, now + rampDuration);
    } catch {
      // AudioContext safe
    }
  }

  // Set Rain Ambience volume independently
  public setRainVolume(volume: number) {
    this.rainTargetVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.rainGain && this.isRainActive) {
      const intensityScale = this.rainIntensityLevel === 'drizzle' ? 0.7 : this.rainIntensityLevel === 'storm' ? 1.25 : 1.0;
      const targetGain = this.rainTargetVolume * intensityScale;
      this.rainGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
  }

  // Set Rain Intensity Level ('drizzle' | 'pour' | 'storm')
  public setRainIntensity(level: RainIntensityType) {
    this.rainIntensityLevel = level;
    if (this.isRainActive) {
      this.applyRainIntensitySettings();
    }
  }

  private applyRainIntensitySettings() {
    if (!this.ctx || !this.rainFilterLow || !this.rainFilterPresence || !this.rainGain) return;

    let lowCutoff = 4200;
    let presenceGain = 4.0;
    let dropSpeedMs = 160;
    let intensityGainScale = 1.0;

    switch (this.rainIntensityLevel) {
      case 'drizzle':
        lowCutoff = 2600;
        presenceGain = 2.0;
        dropSpeedMs = 280;
        intensityGainScale = 0.7;
        break;
      case 'storm':
        lowCutoff = 6500;
        presenceGain = 6.5;
        dropSpeedMs = 85;
        intensityGainScale = 1.25;
        break;
      case 'pour':
      default:
        lowCutoff = 4200;
        presenceGain = 4.0;
        dropSpeedMs = 160;
        intensityGainScale = 1.0;
        break;
    }

    try {
      this.rainFilterLow.frequency.setTargetAtTime(lowCutoff, this.ctx.currentTime, 0.4);
      this.rainFilterPresence.gain.setTargetAtTime(presenceGain, this.ctx.currentTime, 0.4);
      this.rainGain.gain.setTargetAtTime(this.rainTargetVolume * intensityGainScale, this.ctx.currentTime, 0.2);

      // Re-setup droplet interval with new timing
      if (this.rainDropInterval) {
        clearInterval(this.rainDropInterval);
        this.rainDropInterval = null;
      }
      this.startDropletGenerator(dropSpeedMs);
    } catch {
      // AudioContext safe
    }
  }

  // Synthesize ultra-realistic stereo rain shower with window glass droplet physics
  public setRainAmbience(enabled: boolean, volume = 0.45, intensityLevel: RainIntensityType = 'pour') {
    this.rainTargetVolume = volume;
    this.rainIntensityLevel = intensityLevel;
    this.isRainActive = enabled;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!enabled) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
      }
      if (this.rainDropInterval) {
        clearInterval(this.rainDropInterval);
        this.rainDropInterval = null;
      }
      return;
    }

    if (!this.rainGain) {
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);
    }

    // 1. Generate stereo continuous rainfall bed + gentle mist
    if (!this.rainBedSource1) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 5; // 5 seconds seamless loop
      const rainBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      
      // Multi-pole pink/brown/velvet noise synthesis for authentic continuous downpour
      for (let channel = 0; channel < 2; channel++) {
        const output = rainBuffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          
          // Paul Kellet's refined 7-stage filter for pristine pink noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
          b6 = white * 0.115926;

          // Gentle Brownian integration (distant wet pavement wash)
          lastOut = (lastOut + 0.025 * white) / 1.025;

          // Velvet micro-texture for discrete rain particles
          const dropletGrit = Math.random() < 0.012 ? (Math.random() - 0.5) * 0.3 : 0;

          output[i] = pink * 0.65 + lastOut * 0.25 + dropletGrit * 0.10;
        }
      }

      this.rainBedSource1 = this.ctx.createBufferSource();
      this.rainBedSource1.buffer = rainBuffer;
      this.rainBedSource1.loop = true;

      // Filter Cascade:
      // Filter 1: Low-pass filter (window pane dampening)
      this.rainFilterLow = this.ctx.createBiquadFilter();
      this.rainFilterLow.type = 'lowpass';
      this.rainFilterLow.frequency.setValueAtTime(4200, this.ctx.currentTime);

      // Filter 2: High-pass (cut sub rumble below 160Hz)
      this.rainFilterHigh = this.ctx.createBiquadFilter();
      this.rainFilterHigh.type = 'highpass';
      this.rainFilterHigh.frequency.setValueAtTime(180, this.ctx.currentTime);

      // Filter 3: Peaking Filter (glass surface presence resonance at 1.5kHz)
      this.rainFilterPresence = this.ctx.createBiquadFilter();
      this.rainFilterPresence.type = 'peaking';
      this.rainFilterPresence.frequency.setValueAtTime(1500, this.ctx.currentTime);
      this.rainFilterPresence.gain.setValueAtTime(4.0, this.ctx.currentTime);
      this.rainFilterPresence.Q.setValueAtTime(1.1, this.ctx.currentTime);

      // Subtle Wind Gust LFO (0.07Hz gentle breeze modulating rain texture)
      try {
        this.windLfoOsc = this.ctx.createOscillator();
        this.windLfoGain = this.ctx.createGain();
        this.windLfoOsc.frequency.setValueAtTime(0.07, this.ctx.currentTime);
        this.windLfoGain.gain.setValueAtTime(400, this.ctx.currentTime);
        
        this.windLfoOsc.connect(this.windLfoGain);
        this.windLfoGain.connect(this.rainFilterLow.frequency);
        this.windLfoOsc.start(0);
      } catch {
        // LFO optional
      }

      this.rainBedSource1.connect(this.rainFilterLow);
      this.rainFilterLow.connect(this.rainFilterHigh);
      this.rainFilterHigh.connect(this.rainFilterPresence);
      this.rainFilterPresence.connect(this.rainGain);

      this.rainBedSource1.start(0);
    }

    this.applyRainIntensitySettings();
  }

  private startDropletGenerator(speedMs: number) {
    if (this.rainDropInterval) {
      clearInterval(this.rainDropInterval);
    }

    this.rainDropInterval = window.setInterval(() => {
      if (!this.ctx || !this.isRainActive || !this.rainGain) return;
      
      // Random batch of droplets hitting glass
      const maxDrops = this.rainIntensityLevel === 'drizzle' ? 1 : this.rainIntensityLevel === 'storm' ? 4 : 2;
      const dropCount = Math.floor(Math.random() * maxDrops) + 1;

      for (let i = 0; i < dropCount; i++) {
        try {
          const dropType = Math.random();
          const osc = this.ctx.createOscillator();
          const dropGain = this.ctx.createGain();
          const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

          if (dropType > 0.4) {
            // Medium-Light Droplet Glass Tap (Crisp high "ping")
            const baseFreq = 650 + Math.random() * 750;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, this.ctx.currentTime + 0.035);

            const dropVol = (0.02 + Math.random() * 0.05) * this.rainTargetVolume;
            dropGain.gain.setValueAtTime(dropVol, this.ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
          } else {
            // Heavy Droplet Impact (Deep resonant thud)
            const baseFreq = 260 + Math.random() * 220;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.ctx.currentTime + 0.05);

            const dropVol = (0.03 + Math.random() * 0.07) * this.rainTargetVolume;
            dropGain.gain.setValueAtTime(dropVol, this.ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
          }

          if (panner) {
            // Panoramic 3D stereo spread
            panner.pan.setValueAtTime(Math.random() * 1.8 - 0.9, this.ctx.currentTime);
            osc.connect(dropGain);
            dropGain.connect(panner);
            panner.connect(this.rainGain);
          } else {
            osc.connect(dropGain);
            dropGain.connect(this.rainGain);
          }

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 0.065);
        } catch {
          // Context might be paused
        }
      }
    }, speedMs);
  }

  // Procedural Cinematic Thunderclap Synthesizer (Crack + Deep Sub Boom + Rolling Stereo Rumble)
  public playThunderclap(intensity = 1.0) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const thunderGain = this.ctx.createGain();
      const panNode = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      // Master thunder volume scaled with rain loudness
      const volumeScale = Math.max(0.4, Math.min(1.0, this.rainTargetVolume * 1.2)) * intensity;
      thunderGain.gain.setValueAtTime(volumeScale, now);

      // Random lightning strike position in stereo field (-0.7 to +0.7)
      const strikePan = (Math.random() * 1.4 - 0.7);
      if (panNode) {
        panNode.pan.setValueAtTime(strikePan, now);
        // Slowly roll thunder across the sky
        panNode.pan.exponentialRampToValueAtTime(strikePan * -0.5, now + 3.2);
        thunderGain.connect(panNode);
        panNode.connect(this.masterGain || this.ctx.destination);
      } else {
        thunderGain.connect(this.masterGain || this.ctx.destination);
      }

      // 1. Initial High-Voltage Lightning Crack (Sharp fast attack transient)
      const crackBufferSize = Math.floor(sampleRate * 0.18);
      const crackBuffer = this.ctx.createBuffer(1, crackBufferSize, sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackBufferSize; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.035));
      }
      const crackSource = this.ctx.createBufferSource();
      crackSource.buffer = crackBuffer;
      const crackFilter = this.ctx.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(1100, now);
      crackFilter.Q.setValueAtTime(1.5, now);
      const crackGain = this.ctx.createGain();
      crackGain.gain.setValueAtTime(0.35 * volumeScale, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(thunderGain);
      crackSource.start(now);

      // 2. Sub-Bass Explosive Boom (55Hz - 32Hz deep resonant chest punch)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(80, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.55 * volumeScale, now + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      subOsc.connect(subGain);
      subGain.connect(thunderGain);
      subOsc.start(now);
      subOsc.stop(now + 2.3);

      // 3. Long Rolling Reverberant Brown Noise Rumble (3.8 seconds deep echo)
      const rumbleBufferSize = Math.floor(sampleRate * 3.8);
      const rumbleBuffer = this.ctx.createBuffer(2, rumbleBufferSize, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const out = rumbleBuffer.getChannelData(ch);
        let b0 = 0, b1 = 0, last = 0;
        for (let i = 0; i < rumbleBufferSize; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.992 * b0 + w * 0.08;
          b1 = 0.97 * b1 + w * 0.12;
          last = (last + 0.03 * (b0 + b1)) / 1.03;
          
          // Amplitude envelope with swell and realistic rolling rumble peaks
          const tNorm = i / rumbleBufferSize;
          const rumbleSwell = Math.sin(tNorm * Math.PI) * (1 + 0.35 * Math.sin(tNorm * 18));
          out[i] = last * rumbleSwell * 0.9;
        }
      }
      const rumbleSource = this.ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;

      const rumbleFilter = this.ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(260, now);
      rumbleFilter.frequency.exponentialRampToValueAtTime(95, now + 3.5);

      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.01, now);
      rumbleGain.gain.linearRampToValueAtTime(0.48 * volumeScale, now + 0.25);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(thunderGain);
      rumbleSource.start(now);
    } catch {
      // Safe fallback
    }
  }

  // Dynamic dynamic energy/tempo adaptation for rain audio
  public setDynamicRainScaling(energyMultiplier: number) {
    if (!this.ctx || !this.rainFilterPresence || !this.isRainActive) return;
    try {
      const baseFreq = (this.rainIntensityLevel === 'storm' ? 2200 : 1500) + energyMultiplier * 400;
      this.rainFilterPresence.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.4);
    } catch {
      // AudioContext safe
    }
  }

  // Synthesize warm vintage cassette tape hiss & flutter
  public setTapeHiss(enabled: boolean, volume = 0.26) {
    this.tapeTargetVolume = volume;
    this.isTapeActive = enabled;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!enabled) {
      if (this.tapeGain) {
        this.tapeGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
      }
      return;
    }

    if (!this.tapeGain) {
      this.tapeGain = this.ctx.createGain();
      this.tapeGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.tapeGain.connect(this.masterGain);
    }

    if (!this.tapeHissSource) {
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      
      for (let ch = 0; ch < 2; ch++) {
        const output = noiseBuffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.1) * 0.22;
        }
      }

      this.tapeHissSource = this.ctx.createBufferSource();
      this.tapeHissSource.buffer = noiseBuffer;
      this.tapeHissSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3400, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.tapeHissSource.connect(filter);
      filter.connect(highpass);
      highpass.connect(this.tapeGain);

      this.tapeHissSource.start(0);
    }

    this.tapeGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.35);
  }

  // Synthesize night highway cabin rumble / cruising ambience (road tire texture only, zero drone oscillators)
  public setNightDriveAmbience(enabled: boolean, volume = 0.24, crossfadeDuration = 0.8) {
    this.driveTargetVolume = Math.max(0, Math.min(1, volume));
    this.isDriveActive = enabled;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const timeConstant = Math.max(0.1, crossfadeDuration / 3);

    if (!enabled) {
      if (this.driveGain) {
        this.driveGain.gain.setTargetAtTime(0.0001, now, timeConstant);
      }
      return;
    }

    if (!this.driveGain) {
      this.driveGain = this.ctx.createGain();
      this.driveGain.gain.setValueAtTime(0.0001, now);
      this.driveGain.connect(this.masterGain);
    }

    if (!this.driveSource) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      
      for (let ch = 0; ch < 2; ch++) {
        const output = noiseBuffer.getChannelData(ch);
        let brown = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          brown = (brown + 0.02 * white) / 1.02;
          output[i] = brown * 0.8;
        }
      }

      this.driveSource = this.ctx.createBufferSource();
      this.driveSource.buffer = noiseBuffer;
      this.driveSource.loop = true;

      this.driveFilterLow = this.ctx.createBiquadFilter();
      this.driveFilterLow.type = 'lowpass';
      this.driveFilterLow.frequency.setValueAtTime(140, now);

      this.driveSource.connect(this.driveFilterLow);
      this.driveFilterLow.connect(this.driveGain);
      this.driveSource.start(now);
    }

    this.driveGain.gain.setTargetAtTime(this.driveTargetVolume, now, timeConstant);
  }

  // Synthesize sunset coastal ocean surf wash + warm twilight breeze (Sunset Highway)
  public setSunsetCoastalAmbience(enabled: boolean, volume = 0.24, crossfadeDuration = 1.6) {
    this.coastalTargetVolume = Math.max(0, Math.min(1, volume));
    this.isCoastalActive = enabled;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const timeConstant = Math.max(0.2, crossfadeDuration / 3);

    if (!enabled) {
      if (this.coastalGain) {
        this.coastalGain.gain.setTargetAtTime(0.0001, now, timeConstant);
      }
      return;
    }

    if (!this.coastalGain) {
      this.coastalGain = this.ctx.createGain();
      this.coastalGain.gain.setValueAtTime(0.0001, now);
      this.coastalGain.connect(this.masterGain);
    }

    if (!this.coastalSource) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 6; // 6s seamless ocean swell buffer
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0;
        let brown = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          brown = (brown + 0.03 * white) / 1.03;
          data[i] = (b0 + b1 + b2) * 0.35 + brown * 0.65;
        }
      }

      this.coastalSource = this.ctx.createBufferSource();
      this.coastalSource.buffer = noiseBuffer;
      this.coastalSource.loop = true;

      // Lowpass for warm rolling surf
      this.coastalFilterLow = this.ctx.createBiquadFilter();
      this.coastalFilterLow.type = 'lowpass';
      this.coastalFilterLow.frequency.setValueAtTime(480, now);

      // Peaking filter for water foam presence
      this.coastalFilterResonance = this.ctx.createBiquadFilter();
      this.coastalFilterResonance.type = 'peaking';
      this.coastalFilterResonance.frequency.setValueAtTime(850, now);
      this.coastalFilterResonance.gain.setValueAtTime(3.5, now);

      // Slow 0.12Hz wave swell modulation LFO
      try {
        this.coastalWaveLfo = this.ctx.createOscillator();
        this.coastalWaveGain = this.ctx.createGain();
        this.coastalWaveLfo.type = 'sine';
        this.coastalWaveLfo.frequency.setValueAtTime(0.12, now); // ~8.3 second surf swell
        this.coastalWaveGain.gain.setValueAtTime(280, now);

        this.coastalWaveLfo.connect(this.coastalWaveGain);
        this.coastalWaveGain.connect(this.coastalFilterLow.frequency);
        this.coastalWaveLfo.start(now);
      } catch {
        // LFO optional
      }

      this.coastalSource.connect(this.coastalFilterLow);
      this.coastalFilterLow.connect(this.coastalFilterResonance);
      this.coastalFilterResonance.connect(this.coastalGain);
      this.coastalSource.start(now);
    }

    this.coastalGain.gain.setTargetAtTime(this.coastalTargetVolume, now, timeConstant);
  }

  // Synthesize continuous spinning vinyl turntable groove & warm analog dust crackle (Midnight Vinyl)
  public setMidnightVinylAmbience(enabled: boolean, volume = 0.22, crossfadeDuration = 1.6) {
    this.vinylTargetVolume = Math.max(0, Math.min(1, volume));
    this.isVinylActive = enabled;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const timeConstant = Math.max(0.2, crossfadeDuration / 3);

    if (!enabled) {
      if (this.vinylGain) {
        this.vinylGain.gain.setTargetAtTime(0.0001, now, timeConstant);
      }
      return;
    }

    if (!this.vinylGain) {
      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0.0001, now);
      this.vinylGain.connect(this.masterGain);
    }

    if (!this.vinylSource) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 3.6; // 33 RPM loop (~1.8s x 2)
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brownian groove hum
          last = (last + 0.02 * white) / 1.02;
          
          // Organic vinyl micro-dust clicks (sparse probability)
          let crackle = 0;
          if (Math.random() < 0.004) {
            crackle = (Math.random() * 2 - 1) * 0.7;
          } else if (Math.random() < 0.015) {
            crackle = (Math.random() * 2 - 1) * 0.15;
          }

          data[i] = last * 0.35 + crackle * 0.65;
        }
      }

      this.vinylSource = this.ctx.createBufferSource();
      this.vinylSource.buffer = noiseBuffer;
      this.vinylSource.loop = true;

      this.vinylFilter = this.ctx.createBiquadFilter();
      this.vinylFilter.type = 'bandpass';
      this.vinylFilter.frequency.setValueAtTime(2200, now);
      this.vinylFilter.Q.setValueAtTime(1.2, now);

      this.vinylSource.connect(this.vinylFilter);
      this.vinylFilter.connect(this.vinylGain);
      this.vinylSource.start(now);
    }

    this.vinylGain.gain.setTargetAtTime(this.vinylTargetVolume, now, timeConstant);
  }

  // Smoothly apply theme-specific ambient environment backdrop based on selected Aesthetic theme
  public applyThemeAmbientEnvironment(themeId: string) {
    this.initContext();
    if (!this.ctx) return;

    if (themeId === 'rainy-tokyo') {
      this.setRainAmbience(true, 0.45, 'pour');
      this.setNightDriveAmbience(false);
      this.setSunsetCoastalAmbience(false);
      this.setMidnightVinylAmbience(false);
      this.setTapeHiss(false);
    } else if (themeId === 'night-drive') {
      // Midnight Synth is clean pure chill mode (zero background drone noise)
      this.setNightDriveAmbience(false);
      this.setRainAmbience(false);
      this.setSunsetCoastalAmbience(false);
      this.setMidnightVinylAmbience(false);
      this.setTapeHiss(false);
    } else if (themeId === 'vintage-cassette') {
      this.setTapeHiss(true, 0.28);
      this.setNightDriveAmbience(false);
      this.setRainAmbience(false);
      this.setSunsetCoastalAmbience(false);
      this.setMidnightVinylAmbience(false);
    } else if (themeId === 'sunset-coastal') {
      this.setSunsetCoastalAmbience(true, 0.26);
      this.setNightDriveAmbience(false);
      this.setRainAmbience(false);
      this.setMidnightVinylAmbience(false);
      this.setTapeHiss(false);
    } else if (themeId === 'vinyl-bedroom') {
      this.setMidnightVinylAmbience(true, 0.25);
      this.setNightDriveAmbience(false);
      this.setRainAmbience(false);
      this.setSunsetCoastalAmbience(false);
      this.setTapeHiss(false);
    }
  }

  // Distinct Thematic Acoustic Signatures for Late-Night Aesthetic Presets:
  // - 'night-drive': Neon midnight synth arpeggiated sweep + deep analog sub
  // - 'rainy-tokyo': Delicate rain droplets + glass resonance chime
  // - 'vintage-cassette': Cassette latch 'ka-chunk', mechanical tape head engagement & warm hiss flutter
  // - 'sunset-coastal': Warm seaside breeze wash + lush twilight harmonic chime
  // - 'vinyl-bedroom': Realistic needle drop onto revolving vinyl groove + micro static crackle
  public playThemeAcousticSignature(themeId: string) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    try {
      if (themeId === 'vintage-cassette') {
        // Cassette deck mechanical click + magnetic head engagement + motor spool flutter
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(60, now + 0.05);

        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(800, now);
        filter1.Q.setValueAtTime(3.0, now);

        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(this.masterGain!);
        osc1.start(now);
        osc1.stop(now + 0.08);

        // Secondary latch 'thump'
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(95, now + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.12);

        gain2.gain.setValueAtTime(0.22, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc2.connect(gain2);
        gain2.connect(this.masterGain!);
        osc2.start(now + 0.03);
        osc2.stop(now + 0.15);

      } else if (themeId === 'sunset-coastal') {
        // Coastal sunset warm twilight harmonic wash (Major 9th chords: D4 -> F#4 -> A4 -> C#5)
        const notes = [293.66, 369.99, 440.00, 554.37];
        notes.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);

          gain.gain.setValueAtTime(0.0001, now + i * 0.04);
          gain.gain.linearRampToValueAtTime(0.045, now + i * 0.04 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + i * 0.04);
          osc.stop(now + 0.9);
        });

      } else if (themeId === 'vinyl-bedroom') {
        // Realistic vinyl needle landing on lead-in groove with warm pops & micro crackles
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          // Sparse vinyl dust clicks
          if (Math.random() < 0.006) {
            data[i] = (Math.random() * 2 - 1) * 0.9;
          } else {
            data[i] = (Math.random() * 2 - 1) * 0.04;
          }
        }
        const needleSource = this.ctx.createBufferSource();
        needleSource.buffer = noiseBuffer;
        
        const needleFilter = this.ctx.createBiquadFilter();
        needleFilter.type = 'bandpass';
        needleFilter.frequency.setValueAtTime(1400, now);
        needleFilter.Q.setValueAtTime(1.5, now);

        const needleGain = this.ctx.createGain();
        needleGain.gain.setValueAtTime(0.001, now);
        needleGain.gain.linearRampToValueAtTime(0.18, now + 0.06);
        needleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        needleSource.connect(needleFilter);
        needleFilter.connect(needleGain);
        needleGain.connect(this.masterGain!);
        needleSource.start(now);

        // Sub bass tonearm drop 'thump'
        const armOsc = this.ctx.createOscillator();
        const armGain = this.ctx.createGain();
        armOsc.type = 'sine';
        armOsc.frequency.setValueAtTime(80, now + 0.04);
        armOsc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

        armGain.gain.setValueAtTime(0.2, now + 0.04);
        armGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        armOsc.connect(armGain);
        armGain.connect(this.masterGain!);
        armOsc.start(now + 0.04);
        armOsc.stop(now + 0.22);

      } else if (themeId === 'rainy-tokyo') {
        // High-clarity wet window rain drop chime
        const rainTones = [1200, 1650, 2100];
        rainTones.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + idx * 0.05 + 0.08);

          gain.gain.setValueAtTime(0.06, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.18);
        });

      } else if (themeId === 'night-drive') {
        // 'night-drive' / Midnight Synth is initial pure silent chill mode - zero sounds/clicks
        return;
      } else {
        // Fallback default
        this.playTunerClick();
      }
    } catch {
      // AudioContext safe
    }
  }

  // Smooth Radio Frequency Static Sweep / Crossfade Buffer for song changes
  public playSongChangeCrossfade() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    try {
      // 1. Soft radio tuner white/pink noise burst (0.28s smooth ramp)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.32);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.1 * white) / 1.1;
        data[i] = last * 0.8;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(900, now);
      bandpass.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
      bandpass.frequency.exponentialRampToValueAtTime(700, now + 0.3);
      bandpass.Q.setValueAtTime(2.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.31);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.masterGain!);
      noiseSource.start(now);

      // 2. Soft melodic frequency lock blip (two quick warm sine harmonics)
      const blip = this.ctx.createOscillator();
      const blipGain = this.ctx.createGain();
      blip.type = 'sine';
      blip.frequency.setValueAtTime(659.25, now + 0.06); // E5
      blip.frequency.setValueAtTime(987.77, now + 0.14); // B5

      blipGain.gain.setValueAtTime(0.001, now + 0.06);
      blipGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
      blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      blip.connect(blipGain);
      blipGain.connect(this.masterGain!);
      blip.start(now + 0.06);
      blip.stop(now + 0.3);
    } catch {
      // AudioContext safe
    }
  }

  // Tactile Radio Switch / Static Squelch Burst on UI interactions
  public playTunerClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext might be in background
    }
  }

  // Radio signal lock sound (soft warm chime)
  public playSignalLockedChime() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // AudioContext might be in background
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
