import { useState, ChangeEvent, useEffect } from 'react';
import { 
  Heart, Star, Plane, Camera, Coffee, Gift, Music, Home, 
  Trash2, Edit3, Calendar, Image as ImageIcon, Save, X 
} from 'lucide-react';
import { Milestone } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { musicEngine } from '../lib/AudioEngine';

interface MilestoneCardProps {
  key?: string;
  milestone: Milestone;
  isEditingMode: boolean;
  onUpdate: (updated: Milestone) => void;
  onDelete: (id: string) => void;
  theme?: string;
}

const ICON_MAP = {
  heart: Heart,
  star: Star,
  plane: Plane,
  camera: Camera,
  coffee: Coffee,
  cookie: Gift, // cookie uses Gift as backup or we can map to other
  gift: Gift,
  music: Music,
  home: Home,
};

export function MilestoneCard({ milestone, isEditingMode, onUpdate, onDelete, theme }: MilestoneCardProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(milestone.title);
  const [editedDate, setEditedDate] = useState(milestone.date);
  const [editedDescription, setEditedDescription] = useState(milestone.description);
  const [editedIcon, setEditedIcon] = useState(milestone.iconType);
  const [editedImage, setEditedImage] = useState(milestone.image || '');

  const [isOpenedDetail, setIsOpenedDetail] = useState(false);
  const [detailHearts, setDetailHearts] = useState<{ id: number; x: number; size: number; delay: number; duration: number }[]>([]);

  // Dynamically generate floaty hearts when memory is clicked open
  useEffect(() => {
    if (isOpenedDetail) {
      const generated = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage x-axis (0% to 100%)
        size: Math.random() * 16 + 10, // 10px to 26px
        delay: Math.random() * 2.0,
        duration: Math.random() * 3.5 + 2.2, // 2.2s to 5.7s duration
      }));
      setDetailHearts(generated);
    } else {
      setDetailHearts([]);
    }
  }, [isOpenedDetail]);

  const IconComponent = ICON_MAP[milestone.iconType] || Heart;

  const handleSave = () => {
    if (!editedTitle.trim()) return;
    onUpdate({
      ...milestone,
      title: editedTitle,
      date: editedDate,
      description: editedDescription,
      iconType: editedIcon,
      image: editedImage,
    });
    setLocalIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(milestone.title);
    setEditedDate(milestone.date);
    setEditedDescription(milestone.description);
    setEditedIcon(milestone.iconType);
    setEditedImage(milestone.image || '');
    setLocalIsEditing(false);
  };

  // Convert Date string "YYYY-MM-DD" to human beautiful Portuguese date
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return dateStr;
      const [_, year, month, day] = match;
      const monthsPt = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIndex = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} de ${monthsPt[monthIndex]} de ${year}`;
    } catch {
      return dateStr;
    }
  };

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isNatural = theme === 'natural';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id={`milestone-${milestone.id}`}
      className={`relative pl-8 md:pl-12 border-l-2 last:border-transparent pb-10 ${
        isNatural ? 'border-[#e8d5cc]/80' : 'border-rose-200/80'
      }`}
    >
      {/* Icon timeline node */}
      <div className={`absolute -left-4 top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-xs ${
        isNatural 
          ? 'bg-[#fce7e4] border-[#d98c8c] text-[#d98c8c]' 
          : 'bg-rose-100 dark:bg-rose-950 border-2 border-rose-400 text-rose-500'
      }`}>
        <IconComponent className="w-4 h-4 fill-current/10" />
      </div>

      <AnimatePresence mode="wait">
        {!localIsEditing ? (
          <motion.div 
            key="display"
            onClick={() => {
              if (!isEditingMode) {
                setIsOpenedDetail(true);
                musicEngine.playStarChime(440.00); // A4 welcoming bell
              }
            }}
            whileHover={{ scale: isEditingMode ? 1.01 : 1.018 }}
            whileTap={{ scale: isEditingMode ? 1.0 : 0.985 }}
            className={`timeline-card backdrop-blur-md p-6 md:p-8 transition-all duration-300 hover:shadow-lg group relative overflow-hidden ${
              isEditingMode ? '' : 'cursor-pointer hover:border-rose-450'
            } ${
              isNatural 
                ? 'bg-white/80 hover:bg-white border border-[#f0e4e1] rounded-[32px]' 
                : 'bg-white/80 hover:bg-white border border-rose-100/50 rounded-3xl shadow-xs'
            }`}
          >
            {/* Heartbeat hover glow overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500 bg-radial ${
              isNatural ? 'from-[#fce7e4]/25 to-transparent' : 'from-rose-500/5 to-transparent'
            }`} />

            <div className="flex justify-between items-start gap-2 relative z-10">
              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2 ${
                  isNatural ? 'text-[#d98c8c]' : 'text-rose-500'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {formatFriendlyDate(milestone.date)}
                </span>
                <h3 className={`text-xl font-bold leading-tight ${
                  isNatural ? 'text-[#4a3a35]' : 'text-gray-800 dark:text-gray-900'
                }`}>
                  {milestone.title}
                </h3>
              </div>

              {isEditingMode && (
                <div className="flex gap-2 relative z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalIsEditing(true);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isNatural 
                        ? 'text-gray-400 hover:text-[#d98c8c] hover:bg-[#fce7e4]/30' 
                        : 'p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-55 rounded-lg'
                    }`}
                    title="Editar Marco"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(milestone.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isNatural 
                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50/50' 
                        : 'p-1.5 text-gray-400 hover:text-rose-650 hover:bg-rose-55 rounded-lg'
                    }`}
                    title="Excluir Marco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className={`mt-3 leading-relaxed font-light text-sm md:text-base whitespace-pre-wrap relative z-10 ${
              isNatural ? 'text-[#7d6b64]' : 'text-gray-600 dark:text-gray-700'
            }`}>
              {milestone.description}
            </p>

            {milestone.image && (
              <div className={`mt-4 overflow-hidden rounded-2xl border bg-gray-50 max-h-[300px] relative z-10 ${
                isNatural ? 'border-[#e8d5cc]' : 'border-rose-50/50'
              }`}>
                <img
                  src={milestone.image}
                  alt={milestone.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-[300px] group-hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
            )}

            {/* Click to open micro badge */}
            {!isEditingMode && (
              <div className="mt-4 flex justify-end">
                <span className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-transform duration-300 ${
                  isNatural 
                    ? 'bg-[#fce7e4] text-[#d98c8c] hover:bg-[#fbcbc3]' 
                    : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                }`}>
                  Reviver Lembrança <Heart className="w-3 h-3 fill-current animate-pulse text-rose-500" />
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="edit"
            className="bg-white/95 p-6 rounded-3xl shadow-md border-2 border-rose-300"
          >
            <div className="space-y-4">
              <h4 className="font-semibold text-rose-600 text-sm uppercase tracking-wider">
                Editar Marco da Jornada
              </h4>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-sm transition-all"
                  placeholder="Ex: Nosso Primeiro Beijo"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data</label>
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-sm transition-all text-gray-700"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">História / Lembrança</label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-rose-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-sm transition-all whitespace-pre-wrap"
                  placeholder="Escreva como foi aquele dia inesquecível..."
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ícone Temático</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ICON_MAP) as Array<keyof typeof ICON_MAP>).map((type) => {
                    const CurrentIcon = ICON_MAP[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditedIcon(type)}
                        className={`p-2 rounded-xl border transition-all ${
                          editedIcon === type
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-rose-50'
                        }`}
                      >
                        <CurrentIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Input (Link or Upload) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Foto / Imagem do Momento
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedImage.startsWith('data:') ? '' : editedImage}
                    disabled={editedImage.startsWith('data:')}
                    onChange={(e) => setEditedImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-xs transition-all placeholder:text-gray-400"
                    placeholder={editedImage.startsWith('data:') ? 'Foto carregada do dispositivo' : 'Cole um link de foto (Unsplash, Imgur, etc...)'}
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-rose-100 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Enviar do meu Computador/Celular
                      <input
                        type="file"
                        accept="image/*"
                        onChange={selectFile}
                        className="hidden"
                      />
                    </label>
                    {editedImage && (
                      <button
                        type="button"
                        onClick={() => setEditedImage('')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-rose-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Alterações
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpenedDetail && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
            
            {/* FLOATING HEARTS OVERLAY (Slow, beautiful, multi-layered) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 w-full h-full">
              {detailHearts.map((hHeart) => (
                <motion.div
                  key={hHeart.id}
                  initial={{ y: '105vh', x: `${hHeart.x}vw`, opacity: 0, scale: 0.3 }}
                  animate={{ 
                    y: '-10vh', 
                    opacity: [0, 0.9, 0.9, 0],
                    scale: [0.3, 1.1, 0.7],
                    rotate: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                  }}
                  transition={{ 
                    duration: hHeart.duration, 
                    delay: hHeart.delay,
                    ease: 'easeOut',
                    repeat: Infinity
                  }}
                  className={`absolute ${isNatural ? 'text-[#d98c8c]/50' : 'text-rose-450/70'}`}
                  style={{ width: hHeart.size, height: hHeart.size }}
                >
                  <Heart className={`w-full h-full ${isNatural ? 'fill-[#d98c8c]/15' : 'fill-rose-500/20'}`} />
                </motion.div>
              ))}
            </div>

            {/* Premium details paper card block */}
            <motion.div
              initial={{ scale: 0.91, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.91, opacity: 0, y: 35 }}
              transition={{ type: 'spring', damping: 25, stiffness: 140 }}
              onClick={(e) => {
                e.stopPropagation();
                // Play a sweet chime when they click/tap inside!
                musicEngine.playStarChime();
              }}
              className={`rounded-3xl max-w-lg w-full relative p-6 md:p-8 shadow-2xl border-4 border-double z-20 flex flex-col cursor-pointer ${
                isNatural 
                  ? 'bg-[#fdfaf8] border-[#e8d5cc]' 
                  : 'bg-[#faf6f0] border-rose-200'
              }`}
            >
              {/* Close Cross icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpenedDetail(false);
                }}
                className={`absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-650 transition-colors z-30 cursor-pointer ${
                  isNatural ? 'hover:bg-[#fce7e4]/40 hover:text-[#d98c8c]' : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Heart Badge Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full w-max text-[10px] font-bold uppercase tracking-wider mb-4 bg-rose-50 text-rose-500 border border-rose-100">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
                <span>Nossos Momentos</span>
              </div>

              {/* Date & Title */}
              <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${isNatural ? 'text-[#d98c8c]' : 'text-rose-500'}`}>
                {formatFriendlyDate(milestone.date)}
              </span>
              <h3 className={`text-2xl font-extrabold leading-tight mb-2 text-left ${
                isNatural ? 'font-serif italic text-[#4a3a35]' : 'text-gray-800'
              }`}>
                {milestone.title}
              </h3>

              <div className={`w-full h-[1px] my-3 ${isNatural ? 'bg-[#e8d5cc]/60' : 'bg-rose-200/50'}`} />

              {/* Scrollable text details */}
              <div className={`max-h-[30vh] overflow-y-auto leading-relaxed text-sm md:text-base font-light pr-2 text-left whitespace-pre-wrap ${
                isNatural ? 'text-[#7d6b64]' : 'text-gray-600'
              }`}>
                {milestone.description}
              </div>

              {/* Optional image inside modal detail card */}
              {milestone.image && (
                <div className={`mt-5 overflow-hidden rounded-2xl border bg-gray-50 max-h-[220px] shadow-xs relative ${
                  isNatural ? 'border-[#e8d5cc]' : 'border-rose-100/50'
                }`}>
                  <img
                    src={milestone.image}
                    alt={milestone.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-[220px]"
                  />
                </div>
              )}

              <div className={`w-full h-[1px] mt-5 mb-4 ${isNatural ? 'bg-[#e8d5cc]/60' : 'bg-rose-200/50'}`} />

              <div className="flex flex-col items-center select-none gap-0.5">
                <span className={`text-[10px] tracking-widest font-mono uppercase opacity-70 ${isNatural ? 'text-[#8b6b5e]' : 'text-rose-450'}`}>
                  Toque na carta para fazer chover amor ✨
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
