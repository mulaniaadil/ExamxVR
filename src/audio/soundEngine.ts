// Web Audio API Synthesizer for Examination Hall Ambient & Stress Cues

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private fanNode: { noise: AudioNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private clockInterval: number | null = null;
  private ambientInterval: number | null = null;
  private noiseLevel: number = 30;
  private timePressure: number = 20;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startFanHum();
      this.startAmbientLoop();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public updateParameters(noiseLevel: number, timePressure: number, fanSpeed: number) {
    this.noiseLevel = noiseLevel;
    this.timePressure = timePressure;

    // Adjust fan hum frequency and volume
    if (this.fanNode && this.ctx) {
      const targetFreq = 90 + fanSpeed * 1.5;
      const targetGain = 0.03 + (fanSpeed / 100) * 0.06;
      this.fanNode.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
      this.fanNode.gain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
    }

    // Adjust clock ticking interval
    this.setupClockTicking();
  }

  private startFanHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise
        lastOut = data[i];
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 140;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.04;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();

      this.fanNode = { noise, filter, gain };
    } catch (e) {
      console.warn('Could not start fan hum', e);
    }
  }

  private setupClockTicking() {
    if (this.clockInterval) {
      window.clearInterval(this.clockInterval);
      this.clockInterval = null;
    }

    // If time pressure is high, tick louder and every 1s; if medium, softer; if low, very faint
    const tickRateMs = 1000;
    this.clockInterval = window.setInterval(() => {
      if (this.timePressure > 40) {
        this.playClockTick();
      }
    }, tickRateMs);
  }

  public playClockTick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const isUrgent = this.timePressure > 70;

      osc.type = isUrgent ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(isUrgent ? 1200 : 800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);

      const vol = isUrgent ? 0.08 : 0.03;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext policy
    }
  }

  public playPageTurn() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 2;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.05 * (this.noiseLevel / 50);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch {
      // ignore
    }
  }

  public playWritingScratch() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650 + Math.random() * 300, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // ignore
    }
  }

  public playWriting() {
    this.playWritingScratch();
  }

  public playFootstep() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {
      // ignore
    }
  }

  public playCough() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 450;
      filter.Q.value = 3.5;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.035 * (this.noiseLevel / 50);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch {
      // ignore
    }
  }

  private startAmbientLoop() {
    if (this.ambientInterval) {
      window.clearInterval(this.ambientInterval);
    }
    this.ambientInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const roll = Math.random() * 100;
      if (roll < this.noiseLevel * 0.6) {
        // Play writing or page turn
        if (Math.random() > 0.4) {
          this.playWritingScratch();
        } else {
          this.playPageTurn();
        }
      }
      if (this.noiseLevel > 60 && Math.random() < 0.15) {
        this.playCough();
      }
    }, 1800);
  }

  public userGesture() {
    this.initContext();
  }

  public destroy() {
    if (this.clockInterval) window.clearInterval(this.clockInterval);
    if (this.ambientInterval) window.clearInterval(this.ambientInterval);
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

export const soundEngine = new SoundEngine();
