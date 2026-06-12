import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Moon, Info, Eye, Send, Heart, Trash2, Star } from 'lucide-react';
import { musicEngine } from '../lib/AudioEngine';

interface ConstellationMapProps {
  startDateStr: string;
  theme?: string;
}

interface StarItem {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulseSpeed: number;
  color: string;
}

interface Constellation {
  id: string;
  name: string;
  meaning: string;
  points: { x: number; y: number }[];
  starNames: string[];
}

interface CosmicWish {
  id: string;
  text: string;
  createdAt: number;
}

type Star = StarItem;

export function ConstellationMap({ startDateStr, theme }: ConstellationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [hoveredConstellation, setHoveredConstellation] = useState<Constellation | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(true);

  // Sparkles Particle collection
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; age: number; maxAge: number; size: number; color: string }[]>([]);
  const triggerShootingStarRef = useRef<(() => void) | null>(null);

  // Persistent Cosmic Wishes Box
  const [wishes, setWishes] = useState<CosmicWish[]>(() => {
    try {
      const saved = localStorage.getItem('nossa_historia_wishes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'w1', text: 'Envelhecer segurando a sua mão ❤️', createdAt: Date.now() },
      { id: 'w2', text: 'Viajar pelo mundo e colecionar fotos juntos ✈️', createdAt: Date.now() - 10000 },
      { id: 'w3', text: 'Amar você em todas as vidas possíveis ✨', createdAt: Date.now() - 20000 },
    ];
  });
  const [wishInput, setWishInput] = useState('');
  
  // References to keep high-frequency values from triggering state updates
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const hoveredRef = useRef<Constellation | null>(null);
  const showCoordinatesRef = useRef(true);

  const isNatural = theme === 'natural';

  // Keep references updated when state changes
  useEffect(() => {
    showCoordinatesRef.current = showCoordinates;
  }, [showCoordinates]);

  // Seeded Random Number Generator to make the star map perfectly deterministic based on meeting day
  const getSeededRandom = (seedStr: string) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    let localSeed = Math.abs(hash);
    return () => {
      // Simple LCG random generator
      localSeed = (localSeed * 1664525 + 1013904223) % 4294967296;
      return localSeed / 4294967296;
    };
  };

  // Human-readable date formatter
  const formatDatePortuguese = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return dateStr;
    }
  };

  // Estimate the moon phase (0-100%) deterministically from the date
  const computeDeterministicMoonPhase = (dateStr: string) => {
    let sum = 0;
    for (let i = 0; i < dateStr.length; i++) {
      if (dateStr[i] !== '-') sum += parseInt(dateStr[i]) || 3;
    }
    const phaseValue = (sum % 30) / 30; // 0.0 to 1.0
    
    let description = 'Lua Crescente';
    if (phaseValue < 0.06 || phaseValue > 0.94) description = 'Lua Nova';
    else if (phaseValue >= 0.06 && phaseValue < 0.2) description = 'Lua Côncava Crescente';
    else if (phaseValue >= 0.2 && phaseValue < 0.3) description = 'Quarto Crescente';
    else if (phaseValue >= 0.3 && phaseValue < 0.44) description = 'Lua Convexa Crescente';
    else if (phaseValue >= 0.44 && phaseValue < 0.56) description = 'Lua Cheia';
    else if (phaseValue >= 0.56 && phaseValue < 0.7) description = 'Lua Convexa Minguante';
    else if (phaseValue >= 0.7 && phaseValue < 0.8) description = 'Quarto Minguante';
    else if (phaseValue >= 0.8 && phaseValue <= 0.94) description = 'Lua Côncava Minguante';

    return { percentage: phaseValue, label: description };
  };

  const moonInfo = computeDeterministicMoonPhase(startDateStr);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rand = getSeededRandom(startDateStr);

    // Dynamic sizing helper
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(380, rect.width * 0.55);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Seed background stars
    const starsCount = 120;
    const backgroundStars: Star[] = Array.from({ length: starsCount }).map(() => {
      const colorRand = rand();
      let color = 'rgba(255, 255, 255, 0.85)';
      if (colorRand < 0.15) color = 'rgba(165, 243, 252, 0.9)'; // sky-200 cyan star
      else if (colorRand > 0.85) color = 'rgba(254, 205, 211, 0.9)'; // rose-200 pink star
      else if (colorRand > 0.7) color = 'rgba(253, 244, 215, 0.9)'; // amber-100 warm star

      return {
        x: rand(),
        y: rand(),
        size: rand() * 1.5 + 0.5,
        opacity: rand() * 0.6 + 0.4,
        pulseSpeed: rand() * 0.02 + 0.005,
        color
      };
    });

    // Seed Constellations dynamically based on anniversary date
    const constellationTemplates = [
      {
        id: 'c1',
        name: 'Ursa do Primeiro Olhar',
        meaning: 'Representa a força silenciosa e segura do primeiro instante em que o mundo desacelerou ao redor.',
        starNames: ['Alnilam', 'Sirius Amoroso', 'Vega d’Amizade', 'Mira Caelum'],
        points: [
          { x: 0.18, y: 0.25 },
          { x: 0.28, y: 0.22 },
          { x: 0.35, y: 0.35 },
          { x: 0.25, y: 0.42 },
          { x: 0.18, y: 0.25 }, // Loop
        ]
      },
      {
        id: 'c2',
        name: 'Crux da Sincronicidade',
        meaning: 'Símbolo dos planos perfeitos traçados pelo destino, apontando sempre para um caminho mútuo.',
        starNames: ['Alfa Cruz', 'Acrux do Abraço', 'Mimosa', 'Gacrux'],
        points: [
          { x: 0.75, y: 0.25 },
          { x: 0.85, y: 0.45 },
          { x: 0.70, y: 0.35 },
          { x: 0.90, y: 0.35 },
        ]
      },
      {
        id: 'c3',
        name: 'Laço do Cuidado Mútuo',
        meaning: 'As linhas conectam a empatia, o amparo nos dias difíceis e a leveza de sorrir juntos sem motivo.',
        starNames: ['Procyon Dulcis', 'Castor Harmonia', 'Pollux Afeto'],
        points: [
          { x: 0.45, y: 0.65 },
          { x: 0.52, y: 0.48 },
          { x: 0.62, y: 0.60 },
          { x: 0.55, y: 0.72 },
          { x: 0.45, y: 0.65 }, // Close
        ]
      },
      {
        id: 'c4',
        name: 'Céu do Amanhã',
        meaning: 'O desenho estelar que projeta nossos grandes sonhos secretos, viagens planejadas e a calmaria do futuro.',
        starNames: ['Capella Futura', 'Aldebaran Sonhos', 'Betelgeuse Abraço'],
        points: [
          { x: 0.12, y: 0.62 },
          { x: 0.22, y: 0.78 },
          { x: 0.34, y: 0.68 },
        ]
      }
    ];

    // Seed-based custom shifting
    const finalConstellations = constellationTemplates.map((c) => {
      const dx = (rand() * 0.12 - 0.06); 
      const dy = (rand() * 0.12 - 0.06);
      return {
        ...c,
        points: c.points.map(p => ({
          x: Math.max(0.05, Math.min(0.95, p.x + dx)),
          y: Math.max(0.08, Math.min(0.92, p.y + dy))
        }))
      };
    });

    let animationFrameId: number;
    let pulseT = 0;

    // Direct local state for running animation to prevent React overhead
    let activeShootingStar: { x: number; y: number; dx: number; dy: number; len: number; opacity: number } | null = null;

    // Shooting stars random trigger
    const triggerShootingStar = () => {
      const x = Math.random() * canvas.width * 0.6;
      const y = Math.random() * canvas.height * 0.4;
      activeShootingStar = {
        x,
        y,
        dx: Math.random() * 4 + 4,
        dy: Math.random() * 2 + 2,
        len: Math.random() * 60 + 40,
        opacity: 1.0
      };
    };

    triggerShootingStarRef.current = triggerShootingStar;

    const drawFrame = () => {
      if (!ctx || !canvas) return;
      pulseT += 0.015;

      // Clear Canvas: theme adaptation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;

      // Draw subtle astronomical base backdrop
      if (isNatural) {
        ctx.fillStyle = '#fdfaf8';
        ctx.fillRect(0, 0, width, height);

        // Grid Lines
        if (showCoordinatesRef.current) {
          ctx.strokeStyle = 'rgba(232, 213, 204, 0.45)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 4]);

          const cx = width / 2;
          const cy = height / 2;
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.4, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.25, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.12, 0, Math.PI * 2); ctx.stroke();

          ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) * 0.8);
        grad.addColorStop(0, '#110b29');
        grad.addColorStop(0.5, '#070417');
        grad.addColorStop(1, '#020108');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        if (showCoordinatesRef.current) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.13)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([3, 5]);
          const cx = width / 2;
          const cy = height / 2;
          
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.38, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.23, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(width, height) * 0.1, 0, Math.PI * 2); ctx.stroke();

          ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw background stars
      backgroundStars.forEach((star) => {
        const starOpacity = star.opacity * (0.6 + Math.abs(Math.sin(pulseT * star.pulseSpeed * 10)) * 0.4);
        
        ctx.save();
        ctx.fillStyle = isNatural ? `rgba(139, 107, 94, ${starOpacity * 0.35})` : star.color;
        ctx.globalAlpha = isNatural ? 0.6 : starOpacity;
        
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Constellations
      let matchHover: Constellation | null = null;
      const hoverRadius = 40;

      finalConstellations.forEach((c) => {
        const scaledPoints = c.points.map(p => ({
          x: p.x * width,
          y: p.y * height
        }));

        // Determine if mouse is close to any point using the Ref (no re-renders of the effect)
        let isClose = false;
        scaledPoints.forEach(p => {
          const dist = Math.hypot(p.x - mousePosRef.current.x, p.y - mousePosRef.current.y);
          if (dist < hoverRadius) {
            isClose = true;
          }
        });

        if (isClose) {
          matchHover = c;
        }

        // Draw connective layout lines
        ctx.save();
        if (isNatural) {
          ctx.strokeStyle = isClose ? 'rgba(217, 140, 140, 0.7)' : 'rgba(217, 140, 140, 0.25)';
          ctx.lineWidth = isClose ? 1.8 : 1.0;
        } else {
          ctx.strokeStyle = isClose ? 'rgba(244, 63, 94, 0.65)' : 'rgba(244, 114, 182, 0.18)';
          ctx.lineWidth = isClose ? 2.0 : 1.2;
        }

        ctx.beginPath();
        scaledPoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        
        if (c.id === 'c1' || c.id === 'c3') {
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();

        // Draw node stars on vertices
        scaledPoints.forEach((p, idx) => {
          const starName = c.starNames[idx % c.starNames.length];
          const shimmer = 1 + Math.sin(pulseT * 3 + idx) * 0.3;

          ctx.save();
          if (isNatural) {
            ctx.fillStyle = isClose ? '#b55d5d' : '#8b6b5e';
            ctx.shadowBlur = isClose ? 6 : 0;
            ctx.shadowColor = '#d98c8c';
          } else {
            ctx.fillStyle = isClose ? '#ffe4e6' : '#fda4af';
            ctx.shadowBlur = isClose ? 10 : 3;
            ctx.shadowColor = '#f43f5e';
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, (isClose ? 4.5 : 3) * shimmer, 0, Math.PI * 2);
          ctx.fill();

          if (isClose) {
            ctx.font = '9px monospace';
            ctx.fillStyle = isNatural ? '#4a3a35' : '#fda4af';
            ctx.fillText(`★ ${starName}`, p.x + 8, p.y - 4);
          }
          ctx.restore();
        });
      });

      // Update hovered constellation state safely (checking if the value has actual change)
      if (matchHover?.id !== hoveredRef.current?.id) {
        hoveredRef.current = matchHover;
        setHoveredConstellation(matchHover);
      }

      // Draw Shooting Star effect smoothly in standard JS/canvas mode
      if (activeShootingStar) {
        const star = activeShootingStar;
        ctx.save();
        const drawOpacity = star.opacity;
        
        const grad = ctx.createLinearGradient(star.x - star.dx, star.y - star.dy, star.x, star.y);
        if (isNatural) {
          grad.addColorStop(0, `rgba(217, 140, 140, 0)`);
          grad.addColorStop(1, `rgba(181, 93, 93, ${drawOpacity * 0.7})`);
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(1, `rgba(253, 244, 215, ${drawOpacity})`);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(star.x - star.dx * 15, star.y - star.dy * 15);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();
        ctx.restore();

        // Advance shooting star coordinates
        star.x += star.dx;
        star.y += star.dy;
        star.opacity -= 0.02;

        if (star.opacity <= 0 || star.x > width || star.y > height) {
          activeShootingStar = null;
        }
      } else {
        if (Math.random() < 0.004) {
          triggerShootingStar();
        }
      }

      // Dynamic interactive particles render tick
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.age++;
        if (p.age >= p.maxAge) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.fillStyle = p.color;
        
        // Beautiful soft celestial glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.age / p.maxAge), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Celestial North indicator arrow
      ctx.save();
      ctx.strokeStyle = isNatural ? 'rgba(139, 107, 94, 0.25)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillStyle = isNatural ? '#8b6b5e' : '#fda4af';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Norte Celeste ✦', width / 2, 22);
      ctx.restore();

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [startDateStr, theme, isNatural]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000 };
    hoveredRef.current = null;
    setHoveredConstellation(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Play celestial chime through our custom synthesized engine!
    musicEngine.playStarChime();

    // Spawn 15 sparkling color-matching particles that float away
    const colors = isNatural 
      ? ['#d98c8c', '#e8d5cc', '#ffffff', '#e28888', '#fff8f5'] 
      : ['#fda4af', '#fef08a', '#c084fc', '#818cf8', '#ffffff'];

    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.6;
      particlesRef.current.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        maxAge: Math.random() * 25 + 15,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishInput.trim()) return;

    const newWish: CosmicWish = {
      id: Math.random().toString(36).substring(2, 9),
      text: wishInput.trim(),
      createdAt: Date.now()
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    localStorage.setItem('nossa_historia_wishes', JSON.stringify(updated));
    setWishInput('');

    // Trigger double shooting star notes and dual chime sweeps!
    triggerShootingStarRef.current?.();
    setTimeout(() => {
      triggerShootingStarRef.current?.();
    }, 400);

    musicEngine.playStarChime(587.33); // high D note
    musicEngine.playStarChime(783.99); // high G note

    // Burst massive sparkles at the center of the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const colors = isNatural ? ['#d98c8c', '#e8d5cc', '#fff'] : ['#fda4af', '#c084fc', '#fff'];
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        particlesRef.current.push({
          x: cx + (Math.random() * 60 - 30),
          y: cy + (Math.random() * 60 - 30),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          maxAge: Math.random() * 35 + 20,
          size: Math.random() * 3.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
  };

  const handleDeleteWish = (id: string) => {
    const updated = wishes.filter(w => w.id !== id);
    setWishes(updated);
    localStorage.setItem('nossa_historia_wishes', JSON.stringify(updated));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 border mb-16 shadow-xs ${
        isNatural 
          ? 'bg-[#fdfaf8] border-[#e8d5cc] rounded-[36px]' 
          : 'bg-[#09051c] border-purple-950/40 rounded-3xl'
      }`}
    >
      {/* Decorative top title rail */}
      <div className={`px-6 py-4 flex flex-wrap justify-between items-center gap-2 border-b leading-none ${
        isNatural ? 'border-[#e8d5cc]/60 bg-[#fce7e4]/20' : 'border-purple-950/20 bg-black/10'
      }`}>
        <div className="flex items-center gap-2">
          <Compass className={`w-4 h-4 animate-spin-slow ${isNatural ? 'text-[#8b6b5e]' : 'text-purple-400'}`} />
          <span className={`text-[11px] uppercase tracking-widest font-bold ${
            isNatural ? 'text-[#5c4a44]' : 'text-white'
          }`}>
            Alinhamento das Estrelas
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCoordinates(prev => !prev)}
            className={`text-[10px] tracking-wider font-semibold uppercase px-2 py-1 rounded-sm border transition-colors flex items-center gap-1 ${
              isNatural 
                ? 'border-[#e8d5cc] hover:bg-[#fce7e4]/30 text-[#8b6b5e]' 
                : 'border-purple-950 text-purple-300 hover:bg-purple-950/30'
            }`}
          >
            <Eye className="w-3 h-3" />
            {showCoordinates ? 'Ocultar Coordenadas' : 'Ver Coordenadas'}
          </button>
          <span className={`text-[10.5px] font-mono shrink-0 select-none ${
            isNatural ? 'text-[#b55d5d]' : 'text-rose-400'
          }`}>
            {formatDatePortuguese(startDateStr)}
          </span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="block w-full cursor-pointer hover:brightness-[1.02] active:brightness-95 transition-all"
          title="Clique em qualquer lugar da constelação para ouvir estrelas e criar poeira estelar! Arraste para ver correspondências de amor."
        />

        {/* Floating Moon Phase node */}
        <div className={`absolute top-4 left-4 p-3 rounded-2xl flex items-center gap-3 select-none ${
          isNatural 
            ? 'bg-white/70 backdrop-blur-sm border border-[#e8d5cc]/70 text-[#5c4a44]' 
            : 'bg-black/45 backdrop-blur-md border border-purple-900/30 text-rose-100'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isNatural ? 'bg-[#fce7e4] text-[#d98c8c]' : 'bg-purple-950/60 text-yellow-300'
          }`}>
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest font-semibold opacity-60">Fase da Lua Lunar</div>
            <div className="text-xs font-bold leading-tight mt-0.5">{moonInfo.label}</div>
          </div>
        </div>

        {/* Hover Information Box */}
        <div className={`absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs transition-all duration-300 p-4 border rounded-2xl ${
          hoveredConstellation 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        } ${
          isNatural 
            ? 'bg-white/95 border-[#e8d5cc] text-[#5c4a44] shadow-md' 
            : 'bg-[#0f0a2e]/95 border-purple-900/60 text-white shadow-2xl shadow-black/80'
        }`}>
          {hoveredConstellation && (
            <>
              <div className="flex items-center gap-1.5 font-bold mb-1.5">
                <Sparkles className={`w-4 h-4 shrink-0 ${isNatural ? 'text-[#d98c8c]' : 'text-rose-400'}`} />
                <h4 className={`text-sm ${isNatural ? 'text-[#4a3a35]' : 'text-rose-300'}`}>
                  {hoveredConstellation.name}
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed mb-3 ${isNatural ? 'text-[#7d6b64]' : 'text-gray-300'}`}>
                {hoveredConstellation.meaning}
              </p>
              <div className="border-t pt-2 border-dashed border-zinc-200/20">
                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest block mb-1">Algumas estrelas principais</span>
                <span className="text-[10px] font-mono text-zinc-500 flex flex-wrap gap-1.5">
                  {hoveredConstellation.starNames.map((s, idx) => (
                    <span key={idx} className={`px-1.5 py-0.5 rounded-sm ${
                      isNatural ? 'bg-zinc-100 text-[#8b6b5e]' : 'bg-purple-950/50 text-indigo-300'
                    }`}>{s}</span>
                  ))}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Helper instruction tooltip if nothing is hovered */}
        {!hoveredConstellation && (
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-opacity duration-300 pointer-events-none select-none border ${
            isNatural 
              ? 'bg-[#fdfaf8]/80 border-[#e8d5cc] text-[#5c4a44]' 
              : 'bg-black/50 border-purple-950 text-purple-200'
          }`}>
            <Info className="w-3.5 h-3.5" />
            <span>Passe o mouse por cima das estrelas para explorar os sentimentos</span>
          </div>
        )}
      </div>

      {/* Spectacular Cosmic Wish Wall panel at the bottom of the star alignment container card */}
      <div className={`p-6 border-t ${
        isNatural ? 'border-[#e8d5cc]/60 bg-[#fffdfc]' : 'border-purple-950/40 bg-black/20'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="col-span-1 md:col-span-12 lg:col-span-5 text-left">
            <div className={`flex items-center gap-1.5 mb-1 px-2.5 py-1 rounded-lg w-max shrink-0 border ${
              isNatural ? 'bg-[#fce7e4]/40 border-[#e8d5cc]/60' : 'bg-purple-950/45 border-purple-900/30'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isNatural ? 'text-[#d98c8c]' : 'text-yellow-300'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isNatural ? 'text-[#8b6b5e]' : 'text-yellow-200'}`}>
                Mural de Desejos Cósmicos
              </span>
            </div>
            <h4 className={`text-md font-bold mt-1.5 ${isNatural ? 'text-[#4a3a35]' : 'text-purple-250'}`}>
              Escreva aos Céus ✨
            </h4>
            <p className={`text-[11px] leading-relaxed mt-1 font-light ${isNatural ? 'text-[#8b7972]' : 'text-purple-300/80'}`}>
              Escreva um desejo secreto sobre o seu futuro e envie-o. Cada desejo lança uma estrela cadente que cruza o nosso céu!
            </p>

            <form onSubmit={handleAddWish} className="mt-3 flex gap-1.5">
              <input
                type="text"
                value={wishInput}
                onChange={e => setWishInput(e.target.value)}
                maxLength={60}
                placeholder="Ex: Viajar para Paris juntos..."
                className={`w-full px-3 py-1.5 text-xs rounded-xl outline-none border transition-all ${
                  isNatural 
                    ? 'bg-white border-[#e8d5cc] focus:border-[#d98c8c] text-[#4a3a35]' 
                    : 'bg-black/35 border-purple-950/80 focus:border-purple-500 text-white placeholder-purple-400/40'
                }`}
              />
              <button 
                type="submit"
                className={`rounded-xl px-3 flex items-center justify-center transition-all cursor-pointer ${
                  isNatural 
                    ? 'bg-[#d98c8c] hover:bg-[#c97c7c] text-white' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="col-span-1 md:col-span-12 lg:col-span-7 text-left">
            <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 opacity-60 ${isNatural ? 'text-[#7d6b64]' : 'text-purple-300'}`}>
              Nossos Sonhos Escritos nas Estrelas:
            </span>
            <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              <AnimatePresence initial={false}>
                {wishes.map((w) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                      isNatural 
                        ? 'bg-[#fdfaf8]/80 hover:bg-[#fce7e4]/30 border border-[#e8d5cc]/40 text-[#4a3a35]' 
                        : 'bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/10 text-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className={`w-3 h-3 fill-current ${isNatural ? 'text-[#d98c8c]' : 'text-yellow-300 animate-pulse'}`} />
                      <span className="font-light">{w.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWish(w.id)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all cursor-pointer ${
                        isNatural ? 'hover:bg-red-50 text-red-400' : 'hover:bg-purple-900/50 text-purple-400 hover:text-red-300'
                      }`}
                      title="Excluir Desejo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {wishes.length === 0 && (
                <div className={`text-center py-6 text-xs font-light italic opacity-50 ${isNatural ? 'text-gray-500' : 'text-purple-300'}`}>
                  Nenhum desejo no céu ainda. Escreva o primeiro! 🌟
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
