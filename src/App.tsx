import { useState, useEffect } from 'react';
import { 
  Heart, Settings, Music, Volume2, VolumeX, Sparkles, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Milestone, CoupleConfig } from './types';
import { INITIAL_MILESTONES, DEFAULT_CONFIG } from './data';
import { Timer } from './components/Timer';
import { MilestoneCard } from './components/MilestoneCard';
import { LoveLetter } from './components/LoveLetter';
import { AddMilestoneForm } from './components/AddMilestoneForm';
import { EditSettings } from './components/EditSettings';
import { ConstellationMap } from './components/ConstellationMap';
import { LoveStories } from './components/LoveStories';
import { FamilyTreasure } from './components/FamilyTreasure';
import { loveAudio } from './utils/audio';

// Theme styling map for fluid colors
const THEME_STYLES = {
  natural: {
    bg: 'bg-[#fdfaf8] text-[#5c4a44]',
    accentText: 'text-[#8b6b5e]',
    accentBg: 'bg-[#d98c8c]',
    border: 'border-[#e8d5cc]',
    cardL: 'border-[#f0e4e1]',
    navBg: 'bg-[#fce7e4] text-[#8b6b5e]',
    headingText: 'text-[#4a3a35]',
    bodyText: 'text-[#7d6b64]',
    counterText: 'text-[#b55d5d]',
  },
  rose: {
    bg: 'bg-radial from-rose-50/70 via-pink-50 to-rose-100/50 text-gray-800',
    accentText: 'text-rose-600',
    accentBg: 'bg-rose-500',
    border: 'border-rose-100',
    cardL: 'border-rose-400',
    navBg: 'bg-rose-500/10 text-rose-700',
    headingText: 'text-rose-700',
    bodyText: 'text-gray-600',
    counterText: 'text-rose-600',
  },
  sunset: {
    bg: 'bg-radial from-amber-50/70 via-orange-50 to-amber-100/50 text-gray-800',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-600',
    border: 'border-amber-100',
    cardL: 'border-amber-400',
    navBg: 'bg-amber-500/10 text-amber-700',
    headingText: 'text-amber-800',
    bodyText: 'text-gray-600',
    counterText: 'text-amber-700',
  },
  indigo: {
    bg: 'bg-radial from-indigo-50/60 via-purple-50 to-indigo-100/40 text-gray-800',
    accentText: 'text-indigo-750',
    accentBg: 'bg-indigo-600',
    border: 'border-indigo-100',
    cardL: 'border-indigo-400',
    navBg: 'bg-indigo-500/10 text-indigo-700',
    headingText: 'text-indigo-800',
    bodyText: 'text-gray-600',
    counterText: 'text-indigo-750',
  },
  slate: {
    bg: 'bg-radial from-slate-50/80 via-zinc-100 to-slate-200/40 text-gray-800',
    accentText: 'text-slate-800',
    accentBg: 'bg-slate-700',
    border: 'border-slate-200',
    cardL: 'border-slate-500',
    navBg: 'bg-slate-500/10 text-slate-800',
    headingText: 'text-slate-800',
    bodyText: 'text-gray-600',
    counterText: 'text-slate-800',
  },
};

export default function App() {
  // Load config & milestones from localStorage or default
  const [config, setConfig] = useState<CoupleConfig>(() => {
    try {
      const saved = localStorage.getItem('nossa_historia_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem('nossa_historia_milestones');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : INITIAL_MILESTONES;
      }
      return INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('nossa_historia_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    // Sort milestones chronologically before saving/rendering
    const sorted = [...milestones].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    localStorage.setItem('nossa_historia_milestones', JSON.stringify(sorted));
  }, [milestones]);

  // Helper to extract video ID from any YouTube URL format (shorts, share, embed, etc.)
  const getYouTubeId = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        return match[2];
      }
    } catch {
      // safe fallback
    }
    return null;
  };

  // Handle ambient or custom music initialization with smart instant-interaction-unlock
  useEffect(() => {
    if (!config.bgMusicEnabled) {
      loveAudio.stop();
      setIsMusicPlaying(false);
      return;
    }

    const startAudioOnInteraction = () => {
      loveAudio.setConfig(config);
      loveAudio.start();
      setIsMusicPlaying(true);
      removeInteractionListeners();
    };

    const removeInteractionListeners = () => {
      document.removeEventListener('click', startAudioOnInteraction);
      document.removeEventListener('touchstart', startAudioOnInteraction);
      document.removeEventListener('keydown', startAudioOnInteraction);
      document.removeEventListener('scroll', startAudioOnInteraction);
    };

    // 1. Immediate play attempt
    try {
      loveAudio.setConfig(config);
      loveAudio.start();
      setIsMusicPlaying(true);
    } catch (e) {
      console.warn('Autoplay blocked, waiting for user response/interaction');
    }

    // 2. Queue interaction listeners if blocked or suspended
    document.addEventListener('click', startAudioOnInteraction, { passive: true });
    document.addEventListener('touchstart', startAudioOnInteraction, { passive: true });
    document.addEventListener('keydown', startAudioOnInteraction, { passive: true });
    document.addEventListener('scroll', startAudioOnInteraction, { passive: true });

    return () => {
      removeInteractionListeners();
      loveAudio.stop();
    };
  }, [config.bgMusicEnabled, config.bgMusicType, config.customMusicUrl, config.scrollAudioEffect]);

  // Listen for scroll shifts to dynamically filter the background melody
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? window.scrollY / docHeight : 0;
      loveAudio.updateScroll(scrollPercent);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger immediately to match initial position
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.scrollAudioEffect, isMusicPlaying]);

  const toggleMusicManually = () => {
    if (isMusicPlaying) {
      loveAudio.stop();
      setIsMusicPlaying(false);
      setConfig(prev => ({ ...prev, bgMusicEnabled: false }));
    } else {
      loveAudio.setConfig({ ...config, bgMusicEnabled: true });
      loveAudio.start();
      setIsMusicPlaying(true);
      setConfig(prev => ({ ...prev, bgMusicEnabled: true }));
    }
  };

  // Timeline Mutations
  const handleAddMilestone = (newMilestone: Omit<Milestone, 'id'>) => {
    const created: Milestone = {
      ...newMilestone,
      id: Date.now().toString(),
    };
    setMilestones(prev => [...prev, created]);
  };

  const handleUpdateMilestone = (updated: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const activeTheme = THEME_STYLES[config.backgroundTheme] || THEME_STYLES.rose;

  return (
    <div className={`min-h-screen relative p-4 md:p-8 transition-colors duration-500 font-sans pb-24 ${activeTheme.bg}`}>
      
      {/* Decorative Elements */}
      {config.backgroundTheme === 'natural' ? (
        <>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#fce7e4] blur-3xl opacity-70 pointer-events-none select-none"></div>
          <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[#f2e6d9] blur-3xl opacity-50 pointer-events-none select-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-10 left-10 text-rose-300 opacity-30 select-none pointer-events-none animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-20 right-10 text-rose-300 opacity-20 select-none pointer-events-none animate-pulse">
            <Sparkles className="w-12 h-12" />
          </div>
        </>
      )}

      {/* Control Actions - Header Area */}
      <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-8">
        
        {/* Cute indicator of current setup */}
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full shadow-xs border border-rose-150/40">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="text-xs font-semibold text-gray-700">
            Nossa Linha do Tempo de Amor
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Synth ambient music toggle */}
          <button
            onClick={toggleMusicManually}
            className={`p-2.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              isMusicPlaying
                ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200 animate-bounce'
                : 'bg-white/80 border-rose-100 text-rose-500 hover:bg-rose-50'
            }`}
            title={isMusicPlaying ? 'Mudar música (Sintetizador ligado)' : 'Ativar melodia instrumental romântica'}
          >
            {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Toggle admin customization layout */}
          <button
            onClick={() => setIsEditingTimeline(!isEditingTimeline)}
            className={`px-4 py-2 rounded-full border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              isEditingTimeline 
                ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-white/80 border-rose-100 text-rose-500 hover:bg-rose-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEditingTimeline ? 'Sair da Edição' : 'Editar Histórias'}
          </button>

          {/* Configuration page drawer trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-white/80 border border-rose-100 text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center cursor-pointer"
            title="Configurar nomes, data de início e carta"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <header className="text-center mb-10 max-w-2xl mx-auto flex flex-col items-center justify-center z-10">
        {config.backgroundTheme === 'natural' ? (
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8b6b5e] mb-2">
            Nossa Jornada
          </span>
        ) : null}
        <h1 className={`leading-tight select-none ${
          config.backgroundTheme === 'natural' 
            ? 'font-serif text-5xl md:text-7xl font-light italic text-[#4a3a35] mb-4' 
            : 'font-title text-5xl md:text-6xl text-rose-600 mb-2 font-bold dark:text-rose-500'
        }`}>
          Nossa História de Amor
        </h1>
        <p className={`font-light text-sm md:text-base leading-relaxed max-w-xl ${
          config.backgroundTheme === 'natural' ? 'text-[#7d6b64] opacity-90' : 'text-gray-500'
        }`}>
          {config.phraseSubtitle || 'Cada segundo, sorriso, viagem e desafio superados guardados para sempre, no nosso cantinho especial.'}
        </p>

        {/* Visual representation of current config start date */}
        <div className="mt-6 w-full">
          <Timer 
            startDateStr={config.startDate}
            partner1={config.partner1}
            partner2={config.partner2}
            theme={config.backgroundTheme}
            timerPrefix={config.phraseTimerPrefix}
            timerSuffix={config.phraseTimerSuffix}
          />
        </div>
      </header>

      {/* Seeded Celestial Constellation Map Section */}
      <section className="max-w-2xl mx-auto px-4 mb-4">
        <ConstellationMap 
          startDateStr={config.startDate}
          theme={config.backgroundTheme}
        />
      </section>

      {/* Love Letter Special Box */}
      <section className="max-w-2xl mx-auto mb-16 px-4">
        <LoveLetter 
          title={config.letterTitle}
          content={config.letterContent}
          theme={config.backgroundTheme}
        />
      </section>

      {/* Config alert for browser playback requirement */}
      {config.bgMusicEnabled && !isMusicPlaying && (
        <div className="max-w-md mx-auto mb-8 bg-amber-50 border border-amber-250 p-3 rounded-2xl flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-amber-800">Interação Necessária</h4>
            <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
              O navegador bloqueia som automático. Clique em qualquer lugar ou toque no ícone de som 🔇 para ligar a música de fundo.
            </p>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <section className="max-w-2xl mx-auto px-4">
        
        {/* Separator title */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <span>•</span> {config.phraseTimelineTitle || 'Nossos Momentos'} {milestones.length > 0 && `(${milestones.length})`} <span>•</span>
          </h2>
        </div>

        {/* Add story collapsing form when Editing mode is active */}
        {isEditingTimeline && (
          <div className="mb-10">
            <AddMilestoneForm onAdd={handleAddMilestone} />
          </div>
        )}

        {/* Timeline wrapper line and card iterations */}
        <div className="relative" id="timeline">
          {milestones.length === 0 ? (
            <div className="text-center py-10 bg-white/40 rounded-3xl border border-dashed border-rose-200">
              <Heart className="w-10 h-10 text-rose-300 mx-auto mb-2 fill-rose-100" />
              <p className="text-sm text-gray-500 font-light">Nenhuma história adicionada de momento.</p>
              <button
                onClick={() => {
                  setIsEditingTimeline(true);
                }}
                className="text-xs text-rose-650 hover:underline mt-1 font-semibold"
              >
                Clique aqui para adicionar seu primeiro marco de namoro!
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <MilestoneCard 
                  key={milestone.id}
                  milestone={milestone}
                  isEditingMode={isEditingTimeline}
                  onUpdate={handleUpdateMilestone}
                  onDelete={handleDeleteMilestone}
                  theme={config.backgroundTheme}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Spectacular Instagram-style Romantic Stories segment */}
      <section className="max-w-2xl mx-auto px-4">
        <LoveStories 
          isEditingMode={isEditingTimeline}
          theme={config.backgroundTheme}
        />
      </section>

      {/* Spectacular Magical Family Treasure Chest segment */}
      <section className="max-w-2xl mx-auto px-4">
        <FamilyTreasure 
          isEditingMode={isEditingTimeline}
          theme={config.backgroundTheme}
        />
      </section>

      {/* Beautiful Footer */}
      {config.backgroundTheme === 'natural' ? (
        <footer className="py-12 flex flex-col items-center gap-2 z-10 text-center mt-20">
          <div className="h-[1px] w-32 bg-[#e8d5cc] mb-4"></div>
          <p className="text-[#bfa49a] text-[10px] font-bold tracking-widest uppercase">
            {config.phraseFooterMessage ? config.phraseFooterMessage.toUpperCase() : 'COM AMOR, PARA A ETERNIDADE'}
          </p>
          <p className="text-[#d98c8c] text-sm mt-1 flex items-center justify-center gap-1.5 font-medium">
            <span>{config.phraseTimelineSubtitle || 'viva cada segundo'}</span>
            <span className="text-[#d98c8c]">•</span>
            <span>{new Date().getFullYear()}</span>
          </p>
        </footer>
      ) : (
        <footer className="text-center mt-20 text-gray-450 text-xs font-light tracking-wide">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-300 mx-auto mb-2 animate-pulse" />
          {config.phraseFooterMessage || 'Feito com amor, para guardar todos os nossos dias juntos.'}
          {config.phraseTimelineSubtitle && (
            <div className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-widest">{config.phraseTimelineSubtitle}</div>
          )}
        </footer>
      )}

      {/* Backdrop Config Modal drawer */}
      <EditSettings 
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newConfig) => setConfig(newConfig)}
      />

      {/* Invisible YouTube Player for Streaming Custom YouTube Links */}
      {config.bgMusicEnabled && isMusicPlaying && config.bgMusicType === 'custom-url' && getYouTubeId(config.customMusicUrl) && (
        <div className="absolute opacity-0 pointer-events-none w-1 h-1 overflow-hidden" style={{ top: -1000, left: -1000 }}>
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(config.customMusicUrl)}?autoplay=1&mute=0&loop=1&playlist=${getYouTubeId(config.customMusicUrl)}&enablejsapi=1`}
            title="Trilha Sonora YouTube"
            allow="autoplay; encrypted-media"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
