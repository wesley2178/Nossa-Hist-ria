import { useState, FormEvent, ChangeEvent } from 'react';
import { Milestone } from '../types';
import { 
  PlusCircle, Heart, Star, Plane, Camera, Coffee, Gift, Music, Home, 
  Image as ImageIcon, Save, X, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddMilestoneFormProps {
  onAdd: (milestone: Omit<Milestone, 'id'>) => void;
}

const ICON_OPTIONS = {
  heart: Heart,
  star: Star,
  plane: Plane,
  camera: Camera,
  coffee: Coffee,
  cookie: Gift,
  gift: Gift,
  music: Music,
  home: Home,
};

export function AddMilestoneForm({ onAdd }: AddMilestoneFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [description, setDescription] = useState('');
  const [iconType, setIconType] = useState<Milestone['iconType']>('heart');
  const [image, setImage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAdd({
      title,
      date,
      description,
      iconType,
      image: image || undefined,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setImage('');
    setIconType('heart');
    setIsOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-6 px-4">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex justify-center"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 font-semibold px-6 py-3 rounded-full text-white shadow-md shadow-rose-200 hover:shadow-lg transition-all text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar Novo Marco ao Site
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-rose-100 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center border-b border-rose-100 pb-3 mb-2">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-rose-500 fill-rose-100" />
                  Eternizar um Novo Momento
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-rose-50 rounded-full text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Título do Acontecimento
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O dia que começamos a namorar..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-150 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Data do Momento
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-150 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all text-gray-700"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Conte um pouco sobre esse dia (Sua História)
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descreva o que houve, o que sentiu, quais foram os risos ou as surpresas..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-150 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all whitespace-pre-wrap font-sans"
                />
              </div>

              {/* Icon selectors */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Escolha um Ícone Representativo
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ICON_OPTIONS) as Array<keyof typeof ICON_OPTIONS>).map((type) => {
                    const CurrentIcon = ICON_OPTIONS[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setIconType(type as any)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          iconType === type
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                            : 'bg-rose-50/30 border-rose-100 text-rose-500 hover:bg-rose-100/50'
                        }`}
                      >
                        <CurrentIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attachment / Image Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Adicionar Foto do Momento
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={image.startsWith('data:') ? '' : image}
                    disabled={image.startsWith('data:')}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder={image.startsWith('data:') ? 'Foto selecionada do dispositivo' : 'Cole um link de foto (ou carregue abaixo)...'}
                    className="w-full px-3 py-2 rounded-xl border border-rose-150 outline-none text-xs focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-rose-150 flex items-center gap-1.5 shadow-xs">
                      <ImageIcon className="w-3.5 h-3.5" /> Carregar Foto do Celular/PC
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-rose-100/55">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-50 border border-gray-150 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold shadow-md shadow-green-100 flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Esse Marco
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
