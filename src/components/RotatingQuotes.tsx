import React, { useState, useEffect } from 'react';
import { VibeTheme } from '../types';

const NOSTALGIC_MESSAGES = [
  "Some songs don't match. Somehow, they match you.",
  "No genre. No explanation. Just vibes.",
  "For the drive home when you don't want to go home yet.",
  "A little happy. A little hurt. Mostly just vibes.",
  "If the shuffle makes sense, you're doing it wrong.",
  "Some memories sound better with headphones on.",
  "POV: It's late night and this song suddenly makes sense.",
  "Analog souls drifting through digital frequencies.",
  "Headphones on. World off. Let the signal find you.",
  "Songs that feel like looking out of a rain-streaked window.",
];

interface RotatingQuotesProps {
  isPlaying: boolean;
  activeTheme?: VibeTheme;
}

export const RotatingQuotes: React.FC<RotatingQuotesProps> = ({ isPlaying, activeTheme }) => {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % NOSTALGIC_MESSAGES.length);
        setIsFading(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const accentColor = activeTheme?.accentColor || '#06B6D4';

  return (
    <div className="w-full max-w-2xl mx-auto my-4 sm:my-5 px-4 text-center select-none">
      <div className="relative min-h-[72px] flex flex-col items-center justify-center p-3 rounded-2xl bg-[#08080C]/60 backdrop-blur-md border border-white/10 shadow-lg">
        {/* Subtle status tracker */}
        <span 
          className="text-[10px] font-mono-custom font-bold uppercase tracking-[0.25em] mb-1.5 transition-all"
          style={{ 
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}80`
          }}
        >
          {isPlaying ? '● TRANSMITTING BROADCAST // 98.6 FM' : '○ SIGNAL STANDBY'}
        </span>
        
        <p
          className={`text-lg sm:text-xl md:text-2xl font-serif-custom italic text-white font-normal tracking-wide transition-all duration-500 max-w-xl mx-auto leading-relaxed drop-shadow-md ${
            isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          style={{
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          "{NOSTALGIC_MESSAGES[index]}"
        </p>
      </div>

      {/* Editorial aesthetic divider line with subtitle */}
      <div className="mt-2.5 flex items-center justify-center gap-3">
        <span className="h-[1px] w-8 sm:w-12 bg-white/20" />
        <span className="text-[10.5px] font-mono-custom uppercase tracking-[0.25em] text-white/70 font-medium">
          Press Spacebar to Play / Pause
        </span>
        <span className="h-[1px] w-8 sm:w-12 bg-white/20" />
      </div>

      {/* Message Index Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {NOSTALGIC_MESSAGES.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? '18px' : '5px',
              backgroundColor: i === index ? accentColor : 'rgba(255, 255, 255, 0.25)',
              boxShadow: i === index ? `0 0 8px ${accentColor}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
};
