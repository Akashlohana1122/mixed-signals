import React, { useState } from 'react';
import { VibeTheme, TrackInfo } from '../types';
import { Sparkles, Disc, Radio, Volume2, Waves, CloudRain, Disc3, Car } from 'lucide-react';
import { ambientAudio } from '../services/ambientAudio';

interface ThemeVibeDeckProps {
  themes: VibeTheme[];
  activeTheme: VibeTheme;
  onSelectTheme: (theme: VibeTheme) => void;
  track: TrackInfo;
}

const THEME_SOUND_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  'night-drive': { label: 'Pure Chill Broadcast', icon: <Volume2 className="w-2.5 h-2.5" /> },
  'rainy-tokyo': { label: 'Rain on Glass', icon: <CloudRain className="w-2.5 h-2.5" /> },
  'vintage-cassette': { label: 'Analog Tape Warmth', icon: <Disc3 className="w-2.5 h-2.5" /> },
  'sunset-coastal': { label: 'Ocean Waves & Breeze', icon: <Waves className="w-2.5 h-2.5" /> },
  'vinyl-bedroom': { label: 'Turntable & Crackle', icon: <Disc className="w-2.5 h-2.5" /> },
};

export const ThemeVibeDeck: React.FC<ThemeVibeDeckProps> = ({
  themes,
  activeTheme,
  onSelectTheme,
  track,
}) => {
  const [transitioningThemeId, setTransitioningThemeId] = useState<string | null>(null);

  const handleThemeClick = (theme: VibeTheme) => {
    if (theme.id === activeTheme.id) return;
    setTransitioningThemeId(theme.id);
    ambientAudio.resumeOnInteraction();
    ambientAudio.playThemeAcousticSignature(theme.id);
    onSelectTheme(theme);

    setTimeout(() => {
      setTransitioningThemeId(null);
    }, 1400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#22222E] pb-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-custom font-bold uppercase tracking-[0.25em]" style={{ color: activeTheme.accentColor }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.accentColor }} />
            ATMOSPHERIC THEME PRESETS // MIXED VIBES
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-custom text-[#EDE8DF] italic mt-0.5">
            Select Your Late-Night Aesthetic
          </h2>
        </div>
        
        <span className="text-xs font-mono-custom text-[#888899]">
          Current: <span className="font-bold" style={{ color: activeTheme.accentColor }}>{activeTheme.genreTag}</span>
        </span>
      </div>

      {/* Visual Themes Carousel Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {themes.map((theme, index) => {
          const isActive = theme.id === activeTheme.id;
          const isTransitioning = transitioningThemeId === theme.id;
          const channelNumber = `CH 0${index + 1}`;
          
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              className={`group relative flex flex-col rounded-xl overflow-hidden border text-left transition-all duration-500 cursor-pointer ${
                isActive
                  ? 'scale-[1.02] shadow-2xl border-opacity-100 bg-[#14141E]/95'
                  : 'border-[#22222E]/90 hover:border-[#3E3E52] bg-[#101017]/80 hover:bg-[#151520] opacity-80 hover:opacity-100 hover:scale-[1.01]'
              }`}
              style={{
                borderColor: isActive ? theme.accentColor : undefined,
                boxShadow: isActive 
                  ? `0 8px 30px ${theme.glowColor}, inset 0 0 20px ${theme.glowColor}` 
                  : '0 4px 15px rgba(0,0,0,0.5)',
              }}
            >
              {/* Active Selection Glow Ring & Pulse */}
              {isTransitioning && (
                <div 
                  className="absolute inset-0 z-30 pointer-events-none rounded-xl animate-ping opacity-75"
                  style={{ border: `2px solid ${theme.accentColor}` }}
                />
              )}

              {/* Background Cover Image with CRT Scanline & Grain Texture */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-[#0A0A0F]">
                <img
                  src={theme.image}
                  alt={theme.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-1000 filter brightness-90 contrast-105 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                
                {/* Subtle CRT scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity" />

                {/* Dark atmospheric vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-[#101016]/45 to-black/25" />
                
                {/* Analog Channel Pill Header */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[8.5px] font-mono-custom px-1.5 py-0.5 rounded bg-black/75 border border-white/10 text-white/80 uppercase tracking-wider backdrop-blur-xs">
                    {channelNumber}
                  </span>

                  {/* Active Live Indicator */}
                  {isActive && (
                    <div 
                      className="px-2 py-0.5 rounded-full text-black text-[8.5px] font-mono-custom font-black tracking-wider uppercase shadow-md flex items-center gap-1"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      <span className="w-1 h-1 rounded-full bg-black animate-ping" />
                      TUNED
                    </div>
                  )}
                </div>

                {/* Analog Frequency / Genre Pill */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[8.5px] font-mono-custom uppercase tracking-wider text-white/90 truncate bg-black/75 border border-white/10 backdrop-blur-xs px-1.5 py-0.5 rounded">
                    {theme.genreTag.split('/')[0]}
                  </span>
                  <span className="text-[7.5px] font-mono-custom text-white/50 tracking-widest">
                    98.6 FM
                  </span>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3 bg-[#121218]/90 backdrop-blur-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-white font-mono-custom tracking-tight transition-colors truncate" style={{ color: isActive ? theme.accentColor : undefined }}>
                      {theme.name}
                    </h3>
                  </div>

                  <p className="text-[10px] text-[#888899] font-sans mt-0.5 line-clamp-2 leading-tight">
                    {theme.subtitle}
                  </p>

                  {/* Soundscape Atmosphere Indicator Tag */}
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[9px] font-mono-custom text-white/70">
                    <span style={{ color: theme.accentColor }}>
                      {THEME_SOUND_LABELS[theme.id]?.icon || <Volume2 className="w-2.5 h-2.5" />}
                    </span>
                    <span className="truncate">{THEME_SOUND_LABELS[theme.id]?.label || 'Ambient Tone'}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#22222e]/60 flex items-center justify-between text-[9px] font-mono-custom">
                  <span className="text-[#666] tracking-wider">PRESET</span>
                  <span style={{ color: theme.accentColor }} className="font-bold tracking-wider">
                    {isActive ? '● ACTIVE' : 'SELECT →'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
