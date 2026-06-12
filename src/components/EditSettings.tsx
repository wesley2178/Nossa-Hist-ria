import { useState, FormEvent } from 'react';
import { CoupleConfig } from '../types';
import { 
  Users, Calendar, Heart, Music, Check, LayoutGrid, X, FileText, Languages, ChevronDown, Volume2
} from 'lucide-react';

interface EditSettingsProps {
  config: CoupleConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: CoupleConfig) => void;
}

const THEME_OPTIONS = [
  { id: 'natural', label: 'Tons Naturais (Principal)', class: 'bg-[#fce7e4] border-[#e8d5cc]' },
  { id: 'rose', label: 'Rosa Romântico', class: 'bg-rose-100 border-rose-400' },
  { id: 'sunset', label: 'Pôr do Sol Quente', class: 'bg-amber-100 border-amber-400' },
  { id: 'indigo', label: 'Céu Estrelado', class: 'bg-indigo-100 border-indigo-400' },
  { id: 'slate', label: 'Cinza Minimalista', class: 'bg-slate-100 border-slate-400' },
];

const MUSIC_OPTIONS = [
  { id: 'synth-piano', label: 'Piano Romântico (Sintetizador)', desc: 'Melodias de piano quentes e sussurrantes' },
  { id: 'synth-lofi', label: 'Nostalgia Lofi (Sintetizador)', desc: 'Acordes e batidas lofi analógicas envelhecidas' },
  { id: 'synth-space', label: 'Ambient Celestial (Sintetizador)', desc: 'Tons de sintetizador lentos e orquestra cósmica' },
  { id: 'custom-url', label: 'Link do YouTube ou MP3 Direto', desc: 'Suporta vídeos/músicas do YouTube ou arquivos .mp3' }
];

export function EditSettings({ config, isOpen, onClose, onSave }: EditSettingsProps) {
  const [partner1, setPartner1] = useState(config.partner1);
  const [partner2, setPartner2] = useState(config.partner2);
  const [startDate, setStartDate] = useState(config.startDate);
  const [letterTitle, setLetterTitle] = useState(config.letterTitle);
  const [letterContent, setLetterContent] = useState(config.letterContent);
  const [backgroundTheme, setBackgroundTheme] = useState(config.backgroundTheme);
  const [musicEnabled, setMusicEnabled] = useState(config.bgMusicEnabled);

  // New music configurations
  const [bgMusicType, setBgMusicType] = useState<any>(config.bgMusicType || 'synth-piano');
  const [customMusicUrl, setCustomMusicUrl] = useState(config.customMusicUrl || '');
  const [scrollAudioEffect, setScrollAudioEffect] = useState(config.scrollAudioEffect !== false);

  // New customizable text phrases
  const [phraseSubtitle, setPhraseSubtitle] = useState(config.phraseSubtitle || 'Cada segundo, sorriso, viagem e desafio superados guardados para sempre, no nosso cantinho especial.');
  const [phraseTimerPrefix, setPhraseTimerPrefix] = useState(config.phraseTimerPrefix || 'Estamos Juntos Há');
  const [phraseTimerSuffix, setPhraseTimerSuffix] = useState(config.phraseTimerSuffix || 'dias');
  const [phraseTimelineTitle, setPhraseTimelineTitle] = useState(config.phraseTimelineTitle || 'Nossos Momentos');
  const [phraseTimelineSubtitle, setPhraseTimelineSubtitle] = useState(config.phraseTimelineSubtitle || 'viva cada segundo');
  const [phraseFooterMessage, setPhraseFooterMessage] = useState(config.phraseFooterMessage || 'Feito com amor, para guardar todos os nossos dias juntos.');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      partner1: partner1 || 'Amor',
      partner2: partner2 || 'Você',
      startDate: startDate || '2025-06-12',
      letterTitle,
      letterContent,
      backgroundTheme,
      bgMusicEnabled: musicEnabled,
      bgMusicType,
      customMusicUrl,
      scrollAudioEffect,
      phraseSubtitle,
      phraseTimerPrefix,
      phraseTimerSuffix,
      phraseTimelineTitle,
      phraseTimelineSubtitle,
      phraseFooterMessage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-rose-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-rose-50 flex justify-between items-center bg-[#fdfaf8] rounded-t-[32px] sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
          <div className="flex items-center gap-2 text-rose-600">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <h3 className="font-title font-bold text-lg text-gray-800">Customização Total</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-rose-100 rounded-full transition-colors text-gray-400 hover:text-rose-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
          
          {/* Couple Names */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Users className="w-4 h-4 text-rose-400" /> Nossos Nomes
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Seu Nome / Apelido</label>
                <input
                  type="text"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Nome do seu Par</label>
                <input
                  type="text"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  placeholder="Nome do Par"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Relationship Date */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Calendar className="w-4 h-4 text-rose-400" /> Data de Início / Aniversário
            </h4>
            <div>
              <label className="block text-[11px] text-gray-500 font-semibold mb-1">Dia do vosso encontro (Para o Contador e Mapa Celeste)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-gray-700 font-medium"
              />
            </div>
          </div>

          {/* Background themes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <LayoutGrid className="w-4 h-4 text-rose-400" /> Tema de Paletas Visuais
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setBackgroundTheme(theme.id as any)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    backgroundTheme === theme.id
                      ? 'border-rose-500 bg-rose-50/60 text-rose-700 font-semibold shadow-xs'
                      : 'border-slate-100 bg-slate-50 text-gray-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs">{theme.label}</span>
                  <div className={`w-4.5 h-4.5 rounded-full ${theme.class} border flex items-center justify-center`}>
                    {backgroundTheme === theme.id && <Check className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Integrated Music Player Customizations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Music className="w-4 h-4 text-rose-400" /> Trilha Sonora & Efeito de Som
            </h4>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-gray-800">Habilitar Áudio de Fundo</p>
                <p className="text-[10px] text-gray-500">Permitir loop romântico no plano de fundo</p>
              </div>
              <button
                type="button"
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  musicEnabled ? 'bg-rose-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    musicEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {musicEnabled && (
              <div className="p-4 bg-rose-50/20 border border-rose-100/30 rounded-2xl space-y-4 animate-fade-in">
                {/* Select Instrumental Category */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">Estilo do Som</label>
                  <div className="grid grid-cols-1 gap-2">
                    {MUSIC_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBgMusicType(opt.id as any)}
                        className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                          bgMusicType === opt.id
                            ? 'border-rose-500 bg-white text-rose-700 shadow-xs'
                            : 'border-slate-100 bg-white text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Field */}
                {bgMusicType === 'custom-url' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-600">Link do YouTube ou arquivo de áudio (.mp3 / direct url)</label>
                    <input
                      type="url"
                      value={customMusicUrl}
                      onChange={(e) => setCustomMusicUrl(e.target.value)}
                      placeholder="Ex: https://www.youtube.com/watch?v=M5608hS5r_U ou arquivo .mp3"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:border-rose-400"
                    />
                  </div>
                )}

                {/* Scroll Filter Effect */}
                <div className="flex items-start justify-between border-t border-rose-100/20 pt-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                      Filtro de Rolagem Dinâmico
                    </label>
                    <p className="text-[10px] text-gray-500 max-w-[280px]">
                      A música inicia morna e abafada no topo, tornando-se brilhante e cristalina conforme você rola a página para baixo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScrollAudioEffect(!scrollAudioEffect)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      scrollAudioEffect ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        scrollAudioEffect ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full Customization of Page Phrases */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Languages className="w-4 h-4 text-rose-400" /> Personalizar Todas as Frases
            </h4>
            
            <div className="grid grid-cols-1 gap-3.5">
              {/* Main Subtitle / Description */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Subtítulo do Cabeçalho</label>
                <input
                  type="text"
                  value={phraseSubtitle}
                  onChange={(e) => setPhraseSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs focus:border-rose-400"
                />
              </div>

              {/* Timer Prefix */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Frase do Contador (Antes)</label>
                  <input
                    type="text"
                    value={phraseTimerPrefix}
                    onChange={(e) => setPhraseTimerPrefix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Frase do Contador (Depois)</label>
                  <input
                    type="text"
                    value={phraseTimerSuffix}
                    onChange={(e) => setPhraseTimerSuffix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Timeline Title */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Título da Linha do Tempo</label>
                <input
                  type="text"
                  value={phraseTimelineTitle}
                  onChange={(e) => setPhraseTimelineTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                />
              </div>

              {/* Timeline Subtitle / Caption */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Slogan de Rodapé / Linha do Tempo</label>
                <input
                  type="text"
                  value={phraseTimelineSubtitle}
                  onChange={(e) => setPhraseTimelineSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                />
              </div>

              {/* Footer text */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Mensagem de Rodapé</label>
                <input
                  type="text"
                  value={phraseFooterMessage}
                  onChange={(e) => setPhraseFooterMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Special Love Letter Customization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <FileText className="w-4 h-4 text-rose-400" /> Carta de Amor Virtual
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Título da Carta</label>
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  placeholder="Ex: Para o amor da minha vida"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold mb-1">Mensagem de Amor</label>
                <textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  rows={4}
                  placeholder="Escreva uma mensagem romântica especial..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:border-rose-400 whitespace-pre-wrap"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 border border-gray-150 text-xs font-bold uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-200 transition-colors cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
