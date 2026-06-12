export interface Milestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  image?: string; // base64 string or URL
  iconType: 'heart' | 'star' | 'plane' | 'camera' | 'coffee' | 'cookie' | 'gift' | 'music' | 'home';
}

export interface CoupleConfig {
  partner1: string;
  partner2: string;
  startDate: string; // YYYY-MM-DD
  letterTitle: string;
  letterContent: string;
  backgroundTheme: 'rose' | 'sunset' | 'indigo' | 'slate' | 'natural';
  bgMusicEnabled: boolean;
  bgMusicType: 'synth-lofi' | 'synth-piano' | 'synth-space' | 'custom-url';
  customMusicUrl?: string;
  scrollAudioEffect: boolean;
  // Customizable phrases
  phraseSubtitle: string;
  phraseTimerPrefix: string;
  phraseTimerSuffix: string;
  phraseTimelineTitle: string;
  phraseTimelineSubtitle: string;
  phraseFooterMessage: string;
}
