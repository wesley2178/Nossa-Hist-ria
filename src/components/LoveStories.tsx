import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Camera, Plus, Trash2, X, ChevronLeft, ChevronRight, 
  Sparkles, Eye, Image as ImageIcon 
} from 'lucide-react';
import { musicEngine } from '../lib/AudioEngine';

interface Story {
  id: string;
  image: string; // base64 or URL
  createdAt: number;
}

interface LoveStoriesProps {
  isEditingMode: boolean;
  theme?: string;
}

const DEFAULT_STORIES: Story[] = [
  {
    id: 's1',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800',
    createdAt: Date.now() - 300000,
  },
  {
    id: 's2',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800',
    createdAt: Date.now() - 200000,
  },
  {
    id: 's3',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800',
    createdAt: Date.now() - 100000,
  },
];

export function LoveStories({ isEditingMode, theme }: LoveStoriesProps) {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('nossa_historia_stories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STORIES;
  });

  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [newImageInput, setNewImageInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; size: number }[]>([]);

  const progressIntervalRef = useRef<any>(null);
  const isNatural = theme === 'natural';

  // Save stories to localstorage
  const saveStories = (newStories: Story[]) => {
    setStories(newStories);
    localStorage.setItem('nossa_historia_stories', JSON.stringify(newStories));
  };

  // Add a story photo
  const handleAddStory = (imageSrc: string) => {
    if (!imageSrc.trim()) return;
    const newStory: Story = {
      id: Math.random().toString(36).substring(2, 9),
      image: imageSrc.trim(),
      createdAt: Date.now()
    };
    const updated = [...stories, newStory];
    saveStories(updated);
    setNewImageInput('');
    musicEngine.playStarChime(783.99); // chime feedback
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleAddStory(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteStory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening
    const filtered = stories.filter(st => st.id !== id);
    saveStories(filtered);
    if (activeStoryIdx !== null && activeStoryIdx >= filtered.length) {
      setActiveStoryIdx(filtered.length > 0 ? filtered.length - 1 : null);
    }
  };

  // Story playback timer
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = 5000; // 5 seconds per story
    const step = 50; // update scale rate
    const increment = (step / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (activeStoryIdx < stories.length - 1) {
            setProgress(0);
            setActiveStoryIdx(activeStoryIdx + 1);
            musicEngine.playStarChime(523.25 + (activeStoryIdx * 40)); 
          } else {
            // End of stories
            setActiveStoryIdx(null);
            setProgress(0);
          }
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeStoryIdx, isPaused, stories.length]);

  // Handle tap side to cycle
  const handleStoryTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Spawn tiny heart at tap
    const clickY = e.clientY - rect.top;
    setFloatingHearts((prev) => [
      ...prev,
      {
        id: Math.random(),
        x: (clickX / width) * 100,
        size: Math.random() * 14 + 12,
      },
    ]);
    musicEngine.playStarChime();

    // Advancing logic
    if (clickX > width * 0.4) {
      // Right side tap -> Next
      if (activeStoryIdx !== null) {
        if (activeStoryIdx < stories.length - 1) {
          setProgress(0);
          setActiveStoryIdx(activeStoryIdx + 1);
        } else {
          setActiveStoryIdx(null);
          setProgress(0);
        }
      }
    } else {
      // Left side tap -> Previous
      if (activeStoryIdx !== null) {
        if (activeStoryIdx > 0) {
          setProgress(0);
          setActiveStoryIdx(activeStoryIdx - 1);
        } else {
          setProgress(0);
        }
      }
    }
  };

  return (
    <div className="my-16 text-center">
      {/* Title separator */}
      <h3 className={`text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-6 ${
        isNatural ? 'text-[#8b6b5e]' : 'text-rose-450'
      }`}>
        <Camera className="w-3.5 h-3.5" />
        <span>Stories de Nós Dois</span>
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] text-white select-none shrink-0 ${
          isNatural ? 'bg-[#d98c8c]' : 'bg-rose-500'
        }`}>
          Story Mode
        </span>
      </h3>

      {/* Row of story circles */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-2 select-none">
        {stories.map((story, index) => (
          <div key={story.id} className="relative flex flex-col items-center">
            
            {/* Story avatar bubble with glowing borders */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setActiveStoryIdx(index);
                setProgress(0);
                setIsPaused(false);
                musicEngine.playStarChime(440.00);
              }}
              className={`w-18 h-18 p-[3px] rounded-full transition-all duration-300 relative border cursor-pointer hover:shadow-md ${
                isNatural 
                  ? 'border-[#e8d5cc] bg-gradient-to-tr from-[#e8d5cc] via-[#fce7e4] to-[#d98c8c]' 
                  : 'border-rose-200 bg-gradient-to-tr from-[#fda4af] via-pink-400 to-[#c084fc]'
              }`}
            >
              <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                <img 
                  src={story.image} 
                  alt="Momento Story" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full select-none"
                />
              </div>

              {/* Heart emblem overlay badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs border">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
            </motion.button>

            {/* Quick delete cross when editing mode is active */}
            {isEditingMode && (
              <button
                type="button"
                onClick={(e) => handleDeleteStory(story.id, e)}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform cursor-pointer hover:scale-110"
                title="Excluir Story"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Plus block inside bubble list to guide users directly */}
        {isEditingMode && (
          <label className={`w-18 h-18 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#fff9f8] ${
            isNatural ? 'border-[#e8d5cc] text-[#8b6b5e]' : 'border-rose-200 text-rose-500 hover:border-rose-400'
          }`}>
            <Plus className="w-6 h-6 animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Novo</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        )}
      </div>

      {stories.length === 0 && (
        <p className="text-xs text-gray-400 italic mt-4 font-light">
          Nenhuma foto story carregada. Mude para o modo de edição para adicionar! 📸
        </p>
      )}

      {/* Upload directly from phone box (highly visible on mobile) */}
      {isEditingMode && (
        <div className={`mt-6 max-w-sm mx-auto p-5 rounded-3xl border-2 text-center ${
          isNatural ? 'bg-white border-[#e8d5cc]' : 'bg-rose-50/30 border-rose-100'
        } shadow-sm`}>
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full ${isNatural ? 'bg-[#fce7e4] text-[#d98c8c]' : 'bg-rose-100 text-rose-500'} animate-bounce`}>
              <Camera className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Adicionar Foto da Minha Galeria 📱</h4>
              <p className="text-[11px] text-gray-400 font-light mt-1 max-w-[260px]">
                Toque no botão brilhante abaixo para escolher qualquer foto direto da galeria do seu celular!
              </p>
            </div>

            <label className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md ${
              isNatural ? 'bg-[#d98c8c] hover:bg-[#c97c7c] shadow-[#d98c8c]/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
            }`}>
              <Plus className="w-4 h-4 animate-spin [animation-duration:3s]" />
              <span>Escolher Foto da Galeria</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[9px] text-gray-400 uppercase tracking-widest font-bold">Ou por link</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="text-left">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Endereço de Imagem (URL)
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newImageInput}
                onChange={(e) => setNewImageInput(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full px-3 py-2 text-xs bg-white rounded-xl outline-none border focus:border-rose-300"
              />
              <button
                onClick={() => handleAddStory(newImageInput)}
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 rounded-xl transition-all font-semibold shrink-0 cursor-pointer"
              >
                Incluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story View Screen Overlay Modal */}
      <AnimatePresence>
        {activeStoryIdx !== null && (
          <div className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center overflow-hidden w-full h-full">
            
            {/* Tap/Click background container */}
            <div 
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              onClick={handleStoryTap}
              className="relative w-full max-w-lg h-full max-h-[100vh] flex flex-col items-center justify-between p-4 relative cursor-pointer"
            >
              
              {/* Floating Tap Hearts Drawer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-30">
                {floatingHearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ y: '80vh', x: `${heart.x}%`, opacity: 1, scale: 0.5 }}
                    animate={{ y: '20vh', opacity: 0, scale: 1.5, rotate: [-10, 20, -30] }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute text-rose-500"
                    style={{ width: heart.size, height: heart.size }}
                  >
                    <Heart className="w-full h-full fill-current" />
                  </motion.div>
                ))}
              </div>

              {/* Top controls: Progress indicators & profile description line */}
              <div className="w-full z-40" onClick={e => e.stopPropagation()}>
                
                {/* Horizontal Progress Bars */}
                <div className="flex gap-1.5 w-full mb-3 select-none">
                  {stories.map((s, sIdx) => {
                    let fill = '0%';
                    if (sIdx < activeStoryIdx) fill = '100%';
                    if (sIdx === activeStoryIdx) fill = `${progress}%`;
                    return (
                      <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-75"
                          style={{ width: fill }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Profile bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full border border-white/60 p-0.5 overflow-hidden">
                      <img 
                        src={stories[activeStoryIdx].image} 
                        alt="Story Thumbnail" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-white text-xs font-bold leading-none flex items-center gap-1">
                        Nosso Momento Secreto <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      </div>
                      <span className="text-[9.5px] text-white/60">Sem palavras, apenas amor</span>
                    </div>
                  </div>

                  {/* Close cross */}
                  <button
                    onClick={() => {
                      setActiveStoryIdx(null);
                      setProgress(0);
                    }}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Story visual body center: gorgeous full vertical portrait memory layout */}
              <div className="flex-1 w-full flex items-center justify-center p-2 relative pointer-events-none select-none my-2 z-20">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={stories[activeStoryIdx].id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative max-h-[80vh] flex items-center justify-center"
                  >
                    <img
                      src={stories[activeStoryIdx].image}
                      alt="Nossa Foto"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl my-auto select-none"
                    />
                    
                    {/* Dark gradient base inside poster */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom indicators: helper instructions */}
              <div className="w-full text-center z-30 opacity-60 text-[10px] text-white/50 select-none tracking-widest font-mono uppercase pb-2">
                {isPaused ? '⏸️ Pausado' : '⚡ Toque nas bordas para passar • Segure para ver'}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
