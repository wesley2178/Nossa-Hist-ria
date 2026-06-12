import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Mail, MailOpen, X } from 'lucide-react';

interface LoveLetterProps {
  title: string;
  content: string;
  theme?: string;
}

interface FloatingHeart {
  id: number;
  x: number; // percentage
  size: number;
  delay: number;
  duration: number;
}

export function LoveLetter({ title, content, theme }: LoveLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  // Generate floating hearts when opened
  useEffect(() => {
    if (isOpen) {
      const generated: FloatingHeart[] = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // 0% to 100% width
        size: Math.random() * 16 + 12, // 12px to 28px
        delay: Math.random() * 2, // 0s to 2s delay
        duration: Math.random() * 4 + 3, // 3s to 7s duration
      }));
      setHearts(generated);
    } else {
      setHearts([]);
    }
  }, [isOpen]);

  const isNatural = theme === 'natural';

  return (
    <div className="flex flex-col items-center">
      {/* Visual Envelope Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`relative group p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 max-w-sm w-full cursor-pointer overflow-hidden flex flex-col items-center text-center gap-2 ${
          isNatural 
            ? 'bg-white/80 hover:bg-white border border-[#f0e4e1]' 
            : 'bg-white/80 hover:bg-white border border-rose-100/50'
        }`}
      >
        {/* Soft glowing heartbeat in background */}
        <div className={`absolute inset-0 rounded-3xl group-hover:scale-105 transition-transform ${
          isNatural ? 'bg-[#fce7e4]/20' : 'bg-rose-500/5'
        }`} />
        
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          isNatural ? 'bg-[#fce7e4] text-[#d98c8c]' : 'bg-rose-50 text-rose-500'
        }`}>
          <Mail className="w-6 h-6 animate-pulse" />
        </div>
        
        <h4 className={`font-bold text-lg ${isNatural ? 'text-[#4a3a35]' : 'text-gray-800'}`}>
          Abra Sua Surpresa ❤️
        </h4>
        <p className={`text-xs max-w-[240px] ${isNatural ? 'text-[#7d6b64]' : 'text-gray-500'}`}>
          Preparamos uma cartinha de amor virtual especial para iluminar o seu dia.
        </p>
      </motion.button>

      {/* Love Letter Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
            
            {/* Absolute container of floating hearts */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
              {hearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ y: '100vh', x: `${heart.x}vw`, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: '-10vh', 
                    opacity: [0, 0.8, 0.8, 0],
                    rotate: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                  }}
                  transition={{ 
                    duration: heart.duration, 
                    delay: heart.delay,
                    ease: 'easeOut',
                    repeat: Infinity
                  }}
                  className={`absolute ${isNatural ? 'text-[#d98c8c]/50' : 'text-rose-400/60'}`}
                  style={{ width: heart.size, height: heart.size }}
                >
                  <Heart className={`w-full h-full ${isNatural ? 'fill-[#d98c8c]/10' : 'fill-rose-400/20'}`} />
                </motion.div>
              ))}
            </div>

            {/* Letter Envelope Box Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className={`rounded-3xl max-w-md w-full relative p-8 shadow-2xl border-4 border-double z-20 flex flex-col items-center ${
                isNatural 
                  ? 'bg-[#fdfaf8] border-[#e8d5cc]' 
                  : 'bg-[#faf6f0] border-rose-200'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full text-gray-400 transition-colors ${
                  isNatural ? 'hover:bg-[#fce7e4]/40 hover:text-[#d98c8c]' : 'hover:bg-rose-100/50 hover:text-rose-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Envelope Graphics Node */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                isNatural 
                  ? 'bg-[#fce7e4] text-[#d98c8c] border-[#e8d5cc]/60' 
                  : 'bg-rose-50 text-rose-500 border-rose-100'
              }`}>
                <MailOpen className="w-8 h-8" />
              </div>

              {/* Card Contents */}
              <h3 className={`mb-4 text-center ${
                isNatural 
                  ? 'font-serif text-3xl font-light italic text-[#4a3a35]' 
                  : 'font-title text-3xl text-rose-600 font-bold'
              }`}>
                {title || 'Para Você'}
              </h3>

              <div className={`w-full h-[1px] mb-6 ${
                isNatural ? 'bg-[#e8d5cc]/60' : 'bg-rose-200/50'
              }`} />

              {/* Scrollable Letter Writing Paper */}
              <div className={`w-full max-h-[40vh] overflow-y-auto leading-relaxed font-light text-sm md:text-base pr-2 scrollbar-rose whitespace-pre-wrap font-sans text-center ${
                isNatural ? 'text-[#7d6b64]' : 'text-gray-700'
              }`}>
                {content || 'Escreva algo romântico especial para o seu amor...'}
              </div>

              <div className={`w-full h-[1px] mt-6 mb-4 ${
                isNatural ? 'bg-[#e8d5cc]/60' : 'bg-rose-200/50'
              }`} />

              {/* Final floating decorative signature node */}
              <div className="flex flex-col items-center gap-1">
                <Heart className={`w-5 h-5 animate-bounce ${
                  isNatural ? 'text-[#d98c8c] fill-[#d98c8c]' : 'text-rose-500 fill-rose-500'
                }`} />
                <span className={`text-[11px] uppercase tracking-wider font-semibold font-mono ${
                  isNatural ? 'text-[#8b6b5e]' : 'text-rose-400'
                }`}>
                  Com Todo O Meu Amor
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
