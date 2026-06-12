import { CoupleConfig } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private loopIntervalId: any = null;
  private starIntervalId: any = null;
  private chordIndex = 0;
  
  // Custom audio element
  private customAudio: HTMLAudioElement | null = null;
  private customSource: MediaElementAudioSourceNode | null = null;
  
  private config: CoupleConfig | null = null;
  private isPlaying = false;
  private volumeValue = 0.5;
  private currentScrollPercent = 0;

  constructor() {
    // Lazy initialized on play to comply with browser audio policies
  }

  public init() {
    if (this.ctx) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Setup audio graph
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.Q.value = 1.0;
      // Default warm starting filter frequency
      this.filter.frequency.value = 500;
      
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);

      // Create a warm delay lines effect
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayGain = this.ctx.createGain();
      
      this.delayNode.delayTime.value = 0.6; // 600ms delay
      this.delayGain.gain.value = 0.35; // 350% feedback feedback
      
      // Connect delay loop
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.delayNode);

      // Connect standard flow
      this.primaryGain.connect(this.filter);
      
      // Connect filter directly to destination
      this.filter.connect(this.ctx.destination);
      
      // Connect secondary filter to delay too for starry echoes
      this.delayGain.connect(this.filter);
    } catch (e) {
      console.error('Falha ao iniciar o sintetizador de áudio:', e);
    }
  }

  public setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    if (this.primaryGain && this.ctx) {
      this.primaryGain.gain.setTargetAtTime(this.volumeValue, this.ctx.currentTime, 0.1);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volumeValue;
    }
  }

  public updateScroll(percent: number) {
    this.currentScrollPercent = percent;
    if (!this.isPlaying || !this.ctx || !this.filter) return;

    if (this.config?.scrollAudioEffect) {
      // Brighter lowpass cut-off as user scrolls right/down (350Hz to 3200Hz)
      const targetFreq = 350 + (percent * 2850);
      this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    } else {
      // Keep it wide open and clean
      this.filter.frequency.setTargetAtTime(3000, this.ctx.currentTime, 0.2);
    }
  }

  public play(config: CoupleConfig) {
    this.config = config;
    this.isPlaying = true;
    
    this.init();
    
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Apply scroll value right away
    this.updateScroll(this.currentScrollPercent);

    if (config.bgMusicType === 'custom-url') {
      this.stopProcedural();
      this.playCustomUrl(config.customMusicUrl || '');
    } else {
      this.stopCustomUrl();
      this.playProcedural();
    }
  }

  private playCustomUrl(url: string) {
    if (!url) return;
    
    // Stop if existing custom audio is playing
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    // Ignore YouTube URLs so they don't break the native HTML Audio element
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      this.stopCustomUrl();
      return;
    }

    try {
      this.customAudio = new Audio();
      this.customAudio.src = url;
      this.customAudio.loop = true;
      this.customAudio.crossOrigin = 'anonymous';
      this.customAudio.volume = this.volumeValue;

      // Try routing it into the Web Audio context so it gets the gorgeous scroll lowpass filters!
      if (this.ctx && this.primaryGain) {
        this.ctx.resume().then(() => {
          try {
            if (this.customAudio) {
              this.customSource = this.ctx!.createMediaElementSource(this.customAudio);
              this.customSource.connect(this.primaryGain!);
            }
          } catch (corsErr) {
            // CORS error or other problem: Fallback to playing directly through browser speakers
            console.warn('CORS restrege o processamento de áudio. Tocando diretamente via tag de áudio padrão.', corsErr);
          }
          if (this.customAudio) {
            this.customAudio.play().catch(e => console.error('Erro de reprodução de áudio:', e));
          }
        });
      } else {
        this.customAudio.play().catch(e => console.error('Erro de reprodução simples de áudio:', e));
      }
    } catch (e) {
      console.error('Dificuldade para reproduzir a música personalizada:', e);
    }
  }

  private stopCustomUrl() {
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch (e) {}
      this.customAudio = null;
    }
    if (this.customSource) {
      try {
        this.customSource.disconnect();
      } catch (e) {}
      this.customSource = null;
    }
  }

  private playProcedural() {
    this.stopProcedural();
    if (!this.ctx || !this.primaryGain) return;

    // Start procedural play loops
    this.chordIndex = 0;
    this.tickProceduralLoop();
    this.loopIntervalId = setInterval(() => this.tickProceduralLoop(), 4500);

    // Starry sparkles random melody ticks
    this.tickStarryNote();
    this.starIntervalId = setInterval(() => {
      if (Math.random() > 0.4) {
        this.tickStarryNote();
      }
    }, 1500);
  }

  private tickProceduralLoop() {
    if (!this.ctx || !this.primaryGain || !this.config) return;

    // Harmonious chord notes (G major pentatonic & beautiful emotional keys)
    const chords = {
      'synth-piano': [
        [196.00, 293.66, 392.00, 493.88], // G3, D4, G4, B4 (G major)
        [220.00, 329.63, 440.00, 523.25], // A3, E4, A4, C5 (A minor)
        [164.81, 246.94, 329.63, 392.00], // E3, B3, E4, G4 (E minor)
        [174.61, 261.63, 349.23, 440.00], // F3, C4, F4, A4 (F major)
      ],
      'synth-lofi': [
        [196.00, 246.94, 293.66, 349.23, 440.00], // G3, B3, D4, F4, A4 (G7/9)
        [164.81, 220.00, 261.63, 329.63, 392.00], // E3, A3, C4, E4, G4 (Am7/9)
        [130.81, 196.00, 246.94, 293.66, 392.00], // C3, G3, B3, D4, G4 (Cmaj9)
        [146.83, 220.00, 293.66, 369.99, 440.00], // D3, A3, D4, F#4, A4 (D6/9)
      ],
      'synth-space': [
        [146.83, 220.00, 329.63, 440.00], // D3, A3, E4, A4
        [164.81, 246.94, 392.00, 493.88], // E3, B3, G4, B4
        [130.81, 196.00, 261.63, 329.63], // C3, G3, C4, E4
        [196.00, 293.66, 440.00, 587.33], // G3, D4, A4, D5
      ]
    };

    const currentGenre = this.config.bgMusicType in chords 
      ? (this.config.bgMusicType as 'synth-piano' | 'synth-lofi' | 'synth-space')
      : 'synth-piano';

    const selectedChord = chords[currentGenre][this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % chords[currentGenre].length;

    // Play all notes inside the chord with a soft attack
    const t0 = this.ctx.currentTime;
    const duration = 4.2;

    selectedChord.forEach((freq, idx) => {
      if (!this.ctx || !this.primaryGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Configure oscillator wave shapes for appropriate texture
      if (currentGenre === 'synth-piano') {
        osc.type = 'triangle';
      } else if (currentGenre === 'synth-lofi') {
        osc.type = 'sine';
        // Add tiny detunes for raw nostalgic lofi feeling
        osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), t0);
      } else {
        osc.type = 'sine'; // Super lush space organ
      }

      if (currentGenre !== 'synth-lofi') {
        osc.frequency.setValueAtTime(freq, t0);
      }

      // Gentle strum/arpeggio entry
      const offset = idx * 0.08;
      
      oscGain.gain.setValueAtTime(0, t0);
      oscGain.gain.linearRampToValueAtTime(0.08, t0 + 0.3 + offset);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(oscGain);
      oscGain.connect(this.primaryGain);

      osc.start(t0);
      osc.stop(t0 + duration);

      this.activeOscillators.push({ osc, gain: oscGain });
    });

    // Cleanup ended oscillators
    setTimeout(() => {
      this.activeOscillators = this.activeOscillators.filter(item => {
        try {
          item.osc.disconnect();
          item.gain.disconnect();
        } catch(e) {}
        return false;
      });
    }, duration * 1000 + 500);
  }

  private tickStarryNote() {
    if (!this.ctx || !this.primaryGain || !this.config || !this.delayNode) return;

    const notesPentatonic = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77, 1174.66]; // G5 to D6 pentatonic
    const freq = notesPentatonic[Math.floor(Math.random() * notesPentatonic.length)];

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);

    // Dynamic bells
    oscGain.gain.setValueAtTime(0, t0);
    oscGain.gain.linearRampToValueAtTime(0.03, t0 + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);

    osc.connect(oscGain);
    
    // Connect to primary gain and the delay echo line for stellar trails
    oscGain.connect(this.primaryGain);
    oscGain.connect(this.delayNode);

    osc.start(t0);
    osc.stop(t0 + 1.5);

    this.activeOscillators.push({ osc, gain: oscGain });
  }

  private stopProcedural() {
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    if (this.starIntervalId) {
      clearInterval(this.starIntervalId);
      this.starIntervalId = null;
    }
    this.activeOscillators.forEach(item => {
      try {
        item.osc.stop();
        item.osc.disconnect();
        item.gain.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  public playStarChime(frequency?: number) {
    if (!this.ctx || !this.primaryGain || !this.isPlaying || !this.delayNode) return;
    try {
      const notesPentatonic = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77, 1174.66];
      const freq = frequency || notesPentatonic[Math.floor(Math.random() * notesPentatonic.length)];

      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      // Delicate synth chime/bell attack with echo tail
      oscGain.gain.setValueAtTime(0, t0);
      oscGain.gain.linearRampToValueAtTime(0.06, t0 + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.0);

      osc.connect(oscGain);
      oscGain.connect(this.primaryGain);
      oscGain.connect(this.delayNode);

      osc.start(t0);
      osc.stop(t0 + 2.2);
    } catch (e) {
      console.warn('Note synthesis failed:', e);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopProcedural();
    this.stopCustomUrl();
    
    if (this.ctx) {
      try {
        this.ctx.suspend();
      } catch(e) {}
    }
  }
}

export const musicEngine = new AudioEngine();
