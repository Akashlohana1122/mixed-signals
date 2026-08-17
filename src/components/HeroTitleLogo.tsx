import React, { useEffect, useState } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';
import { VibeTheme, TrackInfo } from '../types';
import { MixedSignalsEmblem } from './MixedSignalsEmblem';

interface HeroTitleLogoProps {
  activeTheme: VibeTheme;
  track?: TrackInfo;
  volume?: number;
  isMuted?: boolean;
  onUnmute?: () => void;
}

export const HeroTitleLogo: React.FC<HeroTitleLogoProps> = ({ 
  activeTheme, 
  track, 
  volume = 100, 
  isMuted = false,
  onUnmute 
}) => {
  const [hasOrbitalRing, setHasOrbitalRing] = useState<boolean>(false);
  const [audioPulse, setAudioPulse] = useState<number>(0);
  const [magneticPosition, setMagneticPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isVolumeZero = volume === 0 || isMuted;
  const isPlaying = track?.isPlaying ?? false;
  const themeGlow = activeTheme.glowColor || 'rgba(6, 182, 212, 0.5)';
  const themeAccent = activeTheme.accentColor || '#06B6D4';

  // Smooth responsive audio pulse animation when music is playing
  useEffect(() => {
    if (!isPlaying) {
      setAudioPulse(0);
      return;
    }
    let animationFrameId: number;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      // Organic rhythmic wave matching typical lofi/chill 80 BPM pulse
      const pulse = (Math.sin(elapsed * 4.5) + 1) / 2;
      setAudioPulse(pulse);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // Interactive Magnetic Mouse Tracker for physical pull effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculate displacement (max 16px range)
    const deltaX = (e.clientX - centerX) * 0.14;
    const deltaY = (e.clientY - centerY) * 0.14;
    setMagneticPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMagneticPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none my-1 sm:my-2 w-full max-w-7xl mx-auto px-2 animate-radio-drift">

      {/* Main Lockup Container */}
      <div className="relative flex flex-col items-center justify-center w-full group">
        
        {/* ========================================================================================= */}
        {/* ROW 1: [ LEFT: MIXED ]  —  [ CENTER: EMBLEM ]  —  [ RIGHT: SIGNALS. ]                    */}
        {/* Seamless transparent backgrounds without any rectangular boxes, borders, or artifacts     */}
        {/* ========================================================================================= */}
        <div className="relative flex flex-row items-center justify-center gap-4 sm:gap-5 md:gap-6 w-full py-1">
          
          {/* Orbital Planetary Light Ring */}
          {hasOrbitalRing && (
            <svg 
              className="absolute -inset-x-8 sm:-inset-x-16 -inset-y-6 sm:-inset-y-8 w-[calc(100%+4rem)] sm:w-[calc(100%+8rem)] h-[calc(100%+3rem)] sm:h-[calc(100%+4rem)] pointer-events-none -z-10 animate-[pulse_4s_ease-in-out_infinite]" 
              viewBox="0 0 500 160" 
              fill="none"
            >
              <ellipse 
                cx="250" 
                cy="80" 
                rx="235" 
                ry="40" 
                transform="rotate(-3 250 80)"
                stroke="url(#ringGradient)" 
                strokeWidth="1.8" 
                strokeDasharray="420 14"
                className="opacity-80"
              />
              <ellipse 
                cx="250" 
                cy="80" 
                rx="231" 
                ry="37" 
                transform="rotate(-3 250 80)"
                stroke={themeAccent} 
                strokeWidth="0.9" 
                className="opacity-50 blur-[1px]"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0" y1="0" x2="500" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" stopOpacity="0.2" />
                  <stop offset="0.3" stopColor={themeAccent} stopOpacity="0.9" />
                  <stop offset="0.7" stopColor="white" stopOpacity="0.9" />
                  <stop offset="1" stopColor={themeAccent} stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* LEFT SIDE: "MIXED" (Exact Outlined Neon Typography - Clean, Seamless, Dynamic Chromatic Glitch on Logo Hover) */}
          <div className="relative flex items-center justify-end flex-1 shrink-0 animate-glitch-mixed overflow-visible">
            <div className={`relative inline-flex items-center ${isHovered ? 'glitch-hover-mixed' : ''}`}>
              {/* "MIXED" Outlined Text */}
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] 2xl:text-[6.5rem] font-display-custom font-black tracking-wider uppercase logo-mixed-neon transition-all duration-200 transform whitespace-nowrap leading-none text-right"
                style={{
                  textShadow: isHovered
                    ? `-4px 0 2px rgba(6, 182, 212, 0.95), 4px 0 2px rgba(236, 72, 153, 0.9), 0 0 25px ${themeAccent}E6, 0 0 45px ${themeGlow}`
                    : `0 0 20px ${themeAccent}B3, 0 0 40px ${themeGlow}`,
                }}
              >
                MIXED
              </h1>

              {/* Sparkling 4-Point Star Lens Flare over the letter 'I' */}
              <div 
                className={`absolute top-[6%] left-[34%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 ${
                  isHovered ? 'scale-125 brightness-150' : 'animate-sparkle'
                } transition-transform duration-200`}
              >
                <svg 
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-300 drop-shadow-[0_0_12px_#38bdf8]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* CENTER: SCALED MAGNETIC CENTER EMBLEM LOGO (Pure Circular/Organically Shaped, No Rectangles) */}
          <div 
            className="relative flex items-center justify-center shrink-0 z-30 animate-glitch-logo"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Magnetic Pull + Audio Reactive Physical Wrapper */}
            <div 
              className="relative transition-all duration-200 ease-out cursor-pointer"
              style={{
                transform: `translate3d(${magneticPosition.x}px, ${magneticPosition.y}px, 0) scale(${
                  isHovered ? 1.05 : isPlaying ? 1 + audioPulse * 0.04 : 1
                })`,
              }}
              title="Mixed Signals Official Emblem"
            >
              {/* Responsive Size: Scaled significantly to be the commanding centerpiece */}
              <div className="w-[140px] h-[140px] sm:w-[190px] sm:h-[190px] md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px] xl:w-[320px] xl:h-[320px] 2xl:w-[360px] 2xl:h-[360px] flex items-center justify-center">
                <MixedSignalsEmblem 
                  size="100%" 
                  themeAccent={themeAccent} 
                  glow={true}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: "SIGNALS." (Exact Champagne Gold Luxury Serif Typography with G-Swash - Seamless, Dynamic Chromatic Glitch on Logo Hover) */}
          <div className="relative flex items-center justify-start flex-1 shrink-0 animate-glitch-signals overflow-visible">
            {/* Masterpiece Typography Container */}
            <div 
              className={`relative flex items-center justify-start transition-all duration-200 transform select-none ${
                isHovered ? 'glitch-hover-signals' : ''
              }`}
              style={{
                filter: isHovered
                  ? `drop-shadow(4px 0 2px rgba(245, 234, 212, 0.95)) drop-shadow(-4px 0 2px rgba(6, 182, 212, 0.85)) drop-shadow(0 10px 28px rgba(0,0,0,0.95))`
                  : isPlaying 
                    ? `drop-shadow(0 10px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 ${12 + audioPulse * 14}px ${themeAccent}66)` 
                    : 'drop-shadow(0 8px 20px rgba(0,0,0,0.9))',
              }}
            >
              {/* Main Wordmark "SIGNALS." */}
              <div className="relative inline-flex items-baseline font-bodoni-custom font-black tracking-[-0.01em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] 2xl:text-[6.5rem] leading-none uppercase whitespace-nowrap">
                
                {/* S */}
                <span className="logo-gold-letter">S</span>
                
                {/* I */}
                <span className="logo-gold-letter ml-[0.02em]">I</span>
                
                {/* G with integrated luxury swash loop */}
                <span className="relative logo-gold-letter ml-[0.02em] inline-block">
                  G
                  {/* Flowing G-Swash tail sweeping snugly under N & A */}
                  <svg 
                    className="absolute left-[-15%] top-[72%] w-[320%] sm:w-[350%] md:w-[380%] h-[40%] pointer-events-none z-20 overflow-visible"
                    viewBox="0 0 320 48" 
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="swashGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFFDF7" />
                        <stop offset="25%" stopColor="#F7EEDC" />
                        <stop offset="60%" stopColor="#E6D3B0" />
                        <stop offset="90%" stopColor="#D4BC90" />
                        <stop offset="100%" stopColor="#C2A472" />
                      </linearGradient>
                      <filter id="swashBevelShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.9" />
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={themeAccent} floodOpacity={isPlaying ? "0.6" : "0.25"} />
                      </filter>
                    </defs>
                    
                    {/* Graceful G-Tail Swash Vector Curve hugging the baseline closely */}
                    <path 
                      d="M 22,2 C 12,12 8,24 14,32 C 22,42 45,44 72,42 C 120,38 180,28 240,18 C 265,14 285,10 295,6 C 297,5 295,4 292,4 C 245,10 190,19 140,24 C 98,28 55,29 38,22 C 28,17 28,9 38,3 Z" 
                      fill="url(#swashGoldGrad)"
                      filter="url(#swashBevelShadow)"
                      stroke="rgba(255,255,255,0.75)"
                      strokeWidth="0.7"
                    />
                  </svg>
                </span>
                
                {/* N */}
                <span className="logo-gold-letter ml-[0.02em]">N</span>
                
                {/* A & L (Ligature Baseline-Connected) */}
                <span className="logo-gold-letter ml-[0.01em] relative">
                  A
                  {/* Connecting underline bar between A and L */}
                  <span className="absolute bottom-[2px] right-[-0.15em] w-[0.3em] h-[0.08em] bg-gradient-to-r from-[#EAD8BA] to-[#DEC291] shadow-md pointer-events-none" />
                </span>
                
                {/* L */}
                <span className="logo-gold-letter ml-[-0.04em]">L</span>
                
                {/* S */}
                <span className="logo-gold-letter ml-[0.02em]">S</span>
                
                {/* Terminal Period '.' */}
                <span className="relative logo-gold-letter ml-[0.05em] inline-flex items-baseline">
                  <span className="inline-block w-[0.24em] h-[0.24em] rounded-full bg-gradient-to-b from-[#FFFDF7] via-[#EED9B3] to-[#BE9D64] border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.9),0_0_8px_rgba(255,240,210,0.5)] transform translate-y-[-0.05em]" />
                </span>

              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================================= */}
        {/* ROW 2: TAGLINE CENTERED DIRECTLY UNDER ALL THREE (MIXED — LOGO — SIGNALS)                */}
        {/* ========================================================================================= */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center w-full animate-glitch-tagline">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1 sm:py-1.5 rounded-full bg-[#0E0E16]/80 border border-[#262638]/90 text-[10px] sm:text-xs md:text-sm font-mono-custom font-semibold tracking-[0.25em] text-[#B0B0C4] uppercase shadow-lg backdrop-blur-md">
            <span>NO GENRE</span>
            <span className="text-cyan-400 font-bold">•</span>
            <span>NO EXPLANATION</span>
            <span className="text-cyan-400 font-bold">•</span>
            <span className="text-white font-bold tracking-[0.28em]">JUST VIBES.</span>
          </div>
        </div>

      </div>

      {/* Orbit Toggle & Audio Sync Live Status Badge Pill & Mute Warning Indicator */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 sm:mt-3">
        {/* Visual Mute Warning Indicator: Appears only when volume is 0 or muted */}
        {isVolumeZero && (
          <button
            onClick={onUnmute}
            className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/60 text-rose-200 text-[11px] font-mono-custom font-semibold shadow-[0_0_15px_rgba(244,63,94,0.35)] backdrop-blur-md animate-pulse hover:bg-rose-900/80 transition-all cursor-pointer"
            title="Click to unmute stream"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="tracking-wider uppercase">AUDIO MUTED (VOL: 0%) — CLICK TO RESTORE</span>
            <Volume2 className="w-3 h-3 text-rose-300 ml-0.5 shrink-0 opacity-80" />
          </button>
        )}

        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12121A]/80 border border-[#242436]/80 text-[10.5px] font-mono-custom text-[#A0A0B8] shadow-md backdrop-blur-md opacity-85 hover:opacity-100 transition-opacity">
          <span 
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              isPlaying && !isVolumeZero ? 'animate-ping' : ''
            }`}
            style={{ backgroundColor: isVolumeZero ? '#f43f5e' : themeAccent }}
          />
          <span className="tracking-wider uppercase">
            {isVolumeZero ? 'TRANSMISSION MUTED' : isPlaying ? 'AUDIO GLOW: ACTIVE' : 'AUDIO GLOW: STANDBY'}
          </span>
          <span className="text-white/20">|</span>
          <button 
            onClick={() => setHasOrbitalRing(prev => !prev)}
            className="hover:text-cyan-300 transition-colors cursor-pointer uppercase font-semibold"
          >
            {hasOrbitalRing ? 'LIGHT RING: ON' : 'LIGHT RING: OFF'}
          </button>
        </div>
      </div>

    </div>
  );
};
