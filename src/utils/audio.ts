import { musicEngine } from '../lib/AudioEngine';
import { CoupleConfig } from '../types';

class LoveAudioWrapper {
  private config: CoupleConfig | null = null;

  public setConfig(config: CoupleConfig) {
    this.config = config;
    if (musicEngine) {
      // If already playing, update configuration on-the-fly!
      if (this.getIsPlaying()) {
        musicEngine.play(config);
      }
    }
  }

  public start() {
    if (this.config) {
      musicEngine.play(this.config);
    }
  }

  public stop() {
    musicEngine.stop();
  }

  public setVolume(vol: number) {
    musicEngine.setVolume(vol);
  }

  public updateScroll(percent: number) {
    musicEngine.updateScroll(percent);
  }

  public getIsPlaying() {
    // Check state inside the actual sound engine
    return (musicEngine as any).isPlaying;
  }
}

export const loveAudio = new LoveAudioWrapper();
export { musicEngine };
