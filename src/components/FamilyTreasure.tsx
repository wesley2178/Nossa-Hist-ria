import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, X, Edit3, Image as ImageIcon, Sparkle, 
  Check, Lock
} from 'lucide-react';
import { musicEngine } from '../lib/AudioEngine';

interface FamilyTreasureProps {
  isEditingMode: boolean;
  theme?: string;
}

const DEFAULT_FAMILY_IMAGE = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000';
const DEFAULT_TITLE = 'Nosso Maior Tesouro';
const DEFAULT_DESCRIPTION = 'A nossa família é a maior promessa de que o amor constrói as coisas mais sagradas. Você e nossa filha são o meu porto seguro, o meu universo inteiro e a minha maior felicidade nesta vida. Amo vocês além do infinito! ❤️';

export function FamilyTreasure({ isEditingMode, theme }: FamilyTreasureProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Customizable settings saved in localstorage
  const [photo, setPhoto] = useState(() => {
    return localStorage.getItem('nossa_historia_treasure_photo') || DEFAULT_FAMILY_IMAGE;
  });
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('nossa_historia_treasure_title') || DEFAULT_TITLE;
  });
  const [description, setDescription] = useState(() => {
    return localStorage.getItem('nossa_historia_treasure_description') || DEFAULT_DESCRIPTION;
  });

  const [inputPhoto, setInputPhoto] = useState(photo);
  const [inputTitle, setInputTitle] = useState(title);
  const [inputDescription, setInputDescription] = useState(description);
  const [isFormSaving, setIsFormSaving] = useState(false);

  // Sparkles and Hearts for the chest visual
  const [chestHearts, setChestHearts] = useState<{ id: number; x: number; y: number; delay: number; scale: number }[]>([]);
  const isNatural = theme === 'natural';

  useEffect(() => {
    // Generate gentle background sparkles/hearts near the treasure chest to draw attention
    const generated = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 160 - 80, // around the lock
      y: Math.random() * -65 - 15,  // float upwards
      delay: Math.random() * 3.0,
      scale: Math.random() * 0.6 + 0.6
    }));
    setChestHearts(generated);
  }, []);

  const handleOpenChest = () => {
    setIsOpen(true);
    // Play majestic synthesized celestial celebration chord sequence
    musicEngine.playStarChime(523.25); // C5
    setTimeout(() => musicEngine.playStarChime(659.25), 100); // E5
    setTimeout(() => musicEngine.playStarChime(783.99), 200); // G5
    setTimeout(() => musicEngine.playStarChime(1046.50), 300); // C6 chord resolution
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nossa_historia_treasure_photo', inputPhoto);
    localStorage.setItem('nossa_historia_treasure_title', inputTitle);
    localStorage.setItem('nossa_historia_treasure_description', inputDescription);
    setPhoto(inputPhoto);
    setTitle(inputTitle);
    setDescription(inputDescription);
    setIsFormSaving(true);
    
    // Play sweet chime feedback
    musicEngine.playStarChime(880.00);
    setTimeout(() => {
      setIsFormSaving(false);
    }, 1500);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setInputPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Hearts floating up when the treasure card is opened full screen
  const [floatingShowHearts, setFloatingShowHearts] = useState<{ id: number; x: number; size: number; delay: number; duration: number }[]>([]);
  useEffect(() => {
    if (isOpen) {
      const generated = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage x across screen
        size: Math.random() * 15 + 10, // 10px to 25px
        delay: Math.random() * 2.2,
        duration: Math.random() * 3.5 + 2.5 // seconds
      }));
      setFloatingShowHearts(generated);
    } else {
      setFloatingShowHearts([]);
    }
  }, [isOpen]);

  return (
    <div className="my-20 flex flex-col items-center">
      
      {/* Decorative intro with lines and stars */}
      <div className="flex items-center gap-3 mb-6 opacity-85 select-none">
        <div className={`h-[1px] w-14 ${isNatural ? 'bg-[#e8d5cc]' : 'bg-rose-200'}`}></div>
        <Sparkles className={`w-4 h-4 text-amber-500 animate-pulse`} />
        <span className={`text-xs font-extrabold uppercase tracking-widest ${isNatural ? 'text-[#8b6b5e]' : 'text-rose-500'}`}>
          Compartimento Eterno
        </span>
        <div className={`h-[1px] w-14 ${isNatural ? 'bg-[#e8d5cc]' : 'bg-rose-200'}`}></div>
      </div>

      {/* Main Chest Tap Area with glowing rings behind */}
      <div className="relative flex flex-col items-center justify-center min-h-[220px] w-full">
        
        {/* Pulsing deep glowing circles behind the chest */}
        <div className={`absolute w-72 h-72 rounded-full blur-3xl opacity-40 animate-pulse transition-opacity duration-1000 -z-10 ${
          isNatural ? 'bg-amber-100' : 'bg-rose-300'
        }`} />
        <div className="absolute w-56 h-56 rounded-full border border-dashed border-rose-300/30 animate-spin -z-10 [animation-duration:35s]" />
        <div className="absolute w-44 h-44 rounded-full border border-rose-400/10 animate-ping -z-10 [animation-duration:3.2s]" />

        {/* Floating background heart dust decoration */}
        {chestHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, y: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.8, 0], y: heart.y, scale: heart.scale }}
            transition={{
              duration: 3.5,
              delay: heart.delay,
              ease: 'easeInOut',
              repeat: Infinity
            }}
            className="absolute z-0 pointer-events-none text-rose-500"
            style={{ left: heart.x }}
          >
            <Heart className="w-3.5 h-3.5 fill-current opacity-30" />
          </motion.div>
        ))}

        {/* 3D-Look Chest Container (Interactively animates on hover and click) */}
        <motion.button
          onClick={handleOpenChest}
          whileHover={{ scale: 1.08, y: -6 }}
          whileTap={{ scale: 0.94 }}
          className="relative group w-52 h-44 flex flex-col items-center justify-end p-3 cursor-pointer outline-none focus:ring-0 z-10"
          title="Toque no baú de tesouro para abrir nossa lembrança especial"
        >
          {/* Glowing particle stars popping out from the lid */}
          <div className="absolute -top-6 flex gap-1.5 justify-center z-20">
            <motion.div animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-yellow-400">
              <Sparkles className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(250,204,21,1)]" />
            </motion.div>
            <motion.div animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }} className="text-rose-500">
              <Heart className="w-4 h-4 fill-current filter drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.8 }} className="text-pink-400">
              <Sparkle className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] animate-spin" />
            </motion.div>
          </div>

          {/* Floating Neon Red-Pink Heart directly above the chest */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1 z-30 pointer-events-none filter drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]"
          >
            <div className="bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-600 p-2 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
          </motion.div>

          {/* Main Chest Body with high detail, gold corner brackets, wood paneling and hearts */}
          <div className="w-40 h-22 rounded-b-2xl relative shadow-2xl overflow-hidden border-2 border-amber-955/70 bg-gradient-to-b from-[#5c1c02] via-[#2f0e01] to-[#1a0800] flex items-center justify-center">
            {/* Horizontal wood slats styling strips */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:16px_100%] opacity-30" />
            
            {/* Shimmer/Gloss swipe effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

            {/* Glowing neon-like red core crack at the top segment */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/70 to-transparent blur-[1px] animate-pulse" />

            {/* Heart ornaments on the wooden panels of the chest front */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute left-6 bottom-3.5 text-rose-500 pointer-events-none drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]"
            >
              <Heart className="w-4 h-4 fill-rose-500" />
            </motion.div>
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.35 }}
              className="absolute right-6 bottom-3.5 text-rose-500 pointer-events-none drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]"
            >
              <Heart className="w-4 h-4 fill-rose-500" />
            </motion.div>

            {/* Gold corner brackets with details */}
            <div className="absolute left-0 bottom-0 top-0 w-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 border-r border-[#1a0800]/40 flex flex-col justify-between items-center py-2">
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-4 bg-gradient-to-l from-yellow-500 via-amber-400 to-yellow-600 border-l border-[#1a0800]/40 flex flex-col justify-between items-center py-2">
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
              <div className="w-1 h-1 rounded-full bg-amber-900 shadow-inner" />
            </div>

            {/* Premium Gilded lock shield at the center with a beating heart core */}
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-11 h-12 rounded-b-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 border-2 border-amber-950 flex flex-col items-center justify-center shadow-lg pt-1">
              {/* Padlock nails */}
              <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-amber-950" />
              <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-amber-950" />
              
              {/* Beating lock core shaped like a heart */}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-5 h-5 text-red-650 fill-red-500 filter drop-shadow-[0_0_5px_rgba(239,68,68,0.95)]" />
              </motion.div>
              {/* Small lock hole */}
              <div className="w-2.5 h-3 rounded-t-full border border-amber-955 bg-transparent -mt-0.5" />
            </div>
          </div>

          {/* Treasure Chest Lid that physically lifts up in 3D-space on hover */}
          <div className="absolute bottom-18 w-40 h-14 rounded-t-3xl border-2 border-t-4 border-amber-950/70 bg-gradient-to-b from-[#853006] via-[#5c1c02] to-[#2f0e01] group-hover:bottom-[80px] transition-all duration-300 origin-bottom shadow-md">
            {/* Wooden trim pattern column bars */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_45%,rgba(0,0,0,0.1)_45%)] bg-[length:22px_100%] opacity-20" />

            {/* Lid gold bands decorative */}
            <div className="absolute left-4 top-0 bottom-0 w-3 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 flex flex-col justify-around py-1 items-center">
              <div className="w-1 h-1 rounded-full bg-amber-950/60" />
              <div className="w-1 h-1 rounded-full bg-amber-950/60" />
            </div>
            <div className="absolute right-4 top-0 bottom-0 w-3 bg-gradient-to-l from-yellow-500 via-amber-400 to-yellow-500 flex flex-col justify-around py-1 items-center">
              <div className="w-1 h-1 rounded-full bg-amber-950/60" />
              <div className="w-1 h-1 rounded-full bg-amber-950/60" />
            </div>
            
            {/* Elegant Hearts on the Lid */}
            <div className="absolute left-8 top-3 text-pink-400/80 group-hover:scale-110 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="absolute right-8 top-3 text-pink-400/80 group-hover:scale-110 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>

            {/* Sleek Golden Heart Ornament overlay center of the lid */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-4.5 bg-gradient-to-b from-yellow-300 via-rose-450 to-amber-450 border border-amber-900/40 rounded-full opacity-95 flex items-center justify-center shadow-xs">
              <Heart className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
            </div>
          </div>
        </motion.button>

        {/* Chest Call to Action Text */}
        <span className={`text-[11px] font-mono uppercase tracking-widest font-extrabold mt-4 flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105 ${
          isNatural ? 'text-[#8b6b5e] hover:text-[#d98c8c]' : 'text-rose-500 hover:text-rose-600'
        }`}>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />
          <span>Toque no Baú dos Nossos Sonhos</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />
        </span>
      </div>

      {/* Editing Settings panel directly underneath the chest when edit is active */}
      {isEditingMode && (
        <div className={`mt-8 w-full max-w-md p-6 rounded-3xl border text-left ${
          isNatural ? 'bg-white border-[#e8d5cc] shadow-md' : 'bg-rose-50/20 border-rose-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Edit3 className={`w-4 h-4 ${isNatural ? 'text-[#d98c8c]' : 'text-rose-500'}`} />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-750">Personalizar Nosso Baú do Tesouro ❤️</h4>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Título da Lembrança
              </label>
              <input 
                type="text"
                value={inputTitle}
                onChange={e => setInputTitle(e.target.value)}
                placeholder="Ex: Nosso Maior Tesouro"
                className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-1 focus:ring-rose-200 outline-none font-semibold text-gray-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Foto Principal do Baú (Família / Filha)
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-rose-200 rounded-2xl py-5 cursor-pointer text-xs bg-white text-rose-650 font-bold hover:bg-rose-50/50 transition-colors">
                  <div className="bg-rose-100 rounded-full p-2.5 text-rose-500 animate-bounce">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span>Escolher Foto da Minha Galeria 📸</span>
                  <span className="text-[10px] text-gray-400 font-normal">Selecione direto do celular</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-150"></div>
                  <span className="flex-shrink mx-3 text-[8px] text-gray-400 uppercase tracking-widest font-bold">Ou cole link</span>
                  <div className="flex-grow border-t border-gray-150"></div>
                </div>

                <input 
                  type="text"
                  value={inputPhoto}
                  onChange={e => setInputPhoto(e.target.value)}
                  placeholder="https://link-da-imagem.com/foto.jpg"
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-1 focus:ring-rose-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Texto / Mensagem Especial do Baú
              </label>
              <textarea 
                rows={4}
                value={inputDescription}
                onChange={e => setInputDescription(e.target.value)}
                placeholder="Inscreva sua mensagem romântica sobre ela e sua filha..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border bg-white focus:ring-1 focus:ring-rose-200 outline-none resize-none text-gray-700 leading-relaxed font-sans"
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isFormSaving 
                  ? 'bg-green-500 shadow-md shadow-green-150' 
                  : isNatural 
                    ? 'bg-[#d98c8c] hover:bg-[#c97c7c] shadow-md shadow-[#d98c8c]/35' 
                    : 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/35'
              }`}
            >
              {isFormSaving ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo com Sucesso!
                </>
              ) : (
                'Salvar Alterações do Baú'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Spectacular Opening Chest Overlay Modal with rain of hearts */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-55 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* MAGICAL FLOATING HEARTS RAIN OVERLAY */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 w-full h-full">
              {floatingShowHearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ y: '105vh', x: `${heart.x}vw`, opacity: 0, scale: 0.3 }}
                  animate={{ 
                    y: '-10vh', 
                    opacity: [0, 0.95, 0.95, 0],
                    scale: [0.3, 1.2, 0.6],
                    rotate: [0, Math.random() * 50 - 25, Math.random() * 100 - 50]
                  }}
                  transition={{ 
                    duration: heart.duration, 
                    delay: heart.delay,
                    ease: 'easeOut',
                    repeat: Infinity
                  }}
                  className="absolute text-red-500"
                  style={{ width: heart.size, height: heart.size }}
                >
                  <Heart className="w-full h-full fill-rose-500/25 text-rose-500/80 animate-pulse" />
                </motion.div>
              ))}
            </div>

            {/* Giant Glowing light bloom from behind the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse pointer-events-none z-10" />

            {/* Premium details papers panel card block representation */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              onClick={() => {
                // Play chord chime on inside container click to let user hear love notes
                musicEngine.playStarChime();
              }}
              className={`rounded-3xl max-w-md w-full relative p-5 md:p-8 shadow-2xl border-4 border-double z-20 flex flex-col cursor-pointer my-auto ${
                isNatural 
                  ? 'bg-[#fdfaf8] border-[#e8d5cc]' 
                  : 'bg-[#faf6f0] border-rose-200'
              }`}
            >
              {/* Close Button top-right corner with generous touch pad */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full text-gray-400 hover:text-gray-650 transition-colors z-30 cursor-pointer ${
                  isNatural ? 'hover:bg-[#fce7e4]/40 hover:text-[#d98c8c]' : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Heart Badge Indicator */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full w-max text-[10px] font-bold uppercase tracking-wider mb-4 bg-rose-55 text-rose-500 border border-rose-150 shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
                <span>Nosso Maior Tesouro</span>
              </div>

              {/* Beautiful Polaroids Frame for Family Photo with subtle skew */}
              <div className="relative group overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl max-h-[290px] mb-4 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                <img
                  src={photo}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-[282px] group-hover:scale-[1.03] transition-transform duration-750 select-none"
                />

                {/* Sparkling indicator overlay top corner */}
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md flex items-center gap-1 text-[8.5px] uppercase tracking-widest text-white/95 font-bold">
                  <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-spin" /> Nosso Tesouro
                </div>
              </div>

              {/* Title & custom layout message */}
              <h3 className={`text-2xl font-extrabold leading-tight text-center mb-1 select-none ${
                isNatural ? 'font-serif italic text-amber-955' : 'text-gray-800'
              }`}>
                {title}
              </h3>

              {/* Sweet separation banner */}
              <div className={`w-full h-[1px] my-3 ${isNatural ? 'bg-[#e8d5cc]/80' : 'bg-rose-200/60'}`} />

              {/* Scrolling loving text description */}
              <div className={`max-h-[25vh] overflow-y-auto leading-relaxed text-sm font-light text-center pr-1 select-none whitespace-pre-wrap ${
                isNatural ? 'text-[#7d6b64]' : 'text-gray-650'
              }`}>
                {description}
              </div>

              <div className={`w-full h-[1px] mt-4 mb-4 ${isNatural ? 'bg-[#e8d5cc]/80' : 'bg-rose-200/60'}`} />

              {/* Micro interactive clue instruction */}
              <div className="flex flex-col items-center select-none text-center">
                <span className={`text-[10px] tracking-widest font-mono uppercase opacity-75 flex items-center gap-1.5 ${isNatural ? 'text-[#8b6b5e]' : 'text-rose-450'}`}>
                  Toque na carta de amor para chover luz <Sparkle className="w-3 h-3 text-yellow-300 animate-bounce fill-current" />
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
