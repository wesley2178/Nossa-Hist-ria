import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface TimerProps {
  startDateStr: string;
  partner1: string;
  partner2: string;
  theme?: string;
  timerPrefix?: string;
  timerSuffix?: string;
}

export function Timer({ startDateStr, partner1, partner2, theme, timerPrefix, timerSuffix }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr + 'T00:00:00');
      const now = new Date();
      
      // Calculate total days
      const diffMs = now.getTime() - start.getTime();
      const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        setTimeLeft({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
        return;
      }

      // Calculate detailed breakdown
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        // Get number of days in the previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      setTimeLeft({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  const isNatural = theme === 'natural';

  return (
    <div className="text-center z-10 relative">
      {/* Couple Name Display */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <h2 className={`text-3xl md:text-4xl font-bold select-none ${
          isNatural ? 'font-serif font-light italic text-[#4a3a35]' : 'font-title text-rose-600/90 dark:text-rose-400'
        }`}>
          {partner1}
        </h2>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Heart className={`w-8 h-8 ${isNatural ? 'text-[#d98c8c] fill-[#d98c8c]' : 'text-rose-500 fill-rose-500'}`} />
        </motion.div>
        <h2 className={`text-3xl md:text-4xl font-bold select-none ${
          isNatural ? 'font-serif font-light italic text-[#4a3a35]' : 'font-title text-rose-600/90 dark:text-rose-400'
        }`}>
          {partner2}
        </h2>
      </div>

      {/* Main Bold Counter */}
      <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-3 ${
        isNatural ? 'text-[#8b6b5e]' : 'text-gray-500'
      }`}>
        {timerPrefix || 'Estamos Juntos Há'}
      </h3>

      <div className={`inline-block px-8 py-4 rounded-full shadow-xs border mb-8 ${
        isNatural 
          ? 'bg-white/60 backdrop-blur-sm border-[#e8d5cc]' 
          : 'bg-white/70 backdrop-blur-md border-rose-100/50'
      }`}>
        <span className={`text-5xl md:text-6xl font-extrabold tracking-tight ${
          isNatural ? 'text-[#b55d5d]' : 'text-rose-600'
        }`} id="days-count">
          {timeLeft.totalDays}
        </span>
        <span className={`font-semibold text-lg ml-2 ${
          isNatural ? 'text-[#5c4a44]' : 'text-gray-600'
        }`}>{timerSuffix || 'dias'}</span>
      </div>

      {/* Breakdown counters */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-2xl mx-auto px-4">
        {[
          { label: 'Anos', value: timeLeft.years },
          { label: 'Meses', value: timeLeft.months },
          { label: 'Dias', value: timeLeft.days },
          { label: 'Horas', value: timeLeft.hours },
          { label: 'Minutos', value: timeLeft.minutes },
          { label: 'Segundos', value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`backdrop-blur-md p-3 rounded-2xl border shadow-xs flex flex-col justify-center min-w-[70px] ${
              isNatural 
                ? 'bg-white/50 border-[#e8d5cc]/60' 
                : 'bg-white/60 border-rose-100/20'
            }`}
          >
            <span className={`text-2xl font-bold font-mono ${
              isNatural ? 'text-[#d98c8c]' : 'text-rose-500'
            }`}>
              {String(item.value).padStart(2, '0')}
            </span>
            <span className={`text-xs font-semibold mt-1 ${
              isNatural ? 'text-[#8b6b5e]' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
