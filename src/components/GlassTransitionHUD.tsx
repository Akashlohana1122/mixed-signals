import React, { useEffect, useState } from 'react';
import { FastForward, Rewind, Sparkles, Disc, X } from 'lucide-react';
import { VibeTheme } from '../types';

interface GlassTransitionHUDProps {
  isVisible: boolean;
  actionType: 'next' | 'prev' | 'tune' | 'play' | null;
  activeTheme: VibeTheme;
  onDismiss?: () => void;
}

export const GlassTransitionHUD: React.FC<GlassTransitionHUDProps> = ({
  isVisible,
  actionType,
  activeTheme,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const startTime = Date.now();
      const duration = 1000; // 1.0 second auto-dismiss

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remainingPct);
        if (remainingPct <= 0) {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isVisible, actionType, activeTheme.id]);

  if (!isVisible) return null;

  const actionTitle = 
    actionType === 'next'
      ? 'TUNING NEXT TRACK'
      : actionType === 'prev'
      ? 'PREVIOUS FREQUENCY'
      : actionType === 'play'
      ? 'SIGNAL BROADCAST LIVE'
      : `VIBE SWITCHED // ${activeTheme.name.toUpperCase()}`;

  const actionSubtitle =
    actionType === 'tune'
      ? `Atmosphere calibrated to ${activeTheme.genreTag}`
      : `FM 98.6 • ${activeTheme.name} Mode`;

  return (
    <div 
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-500 animate-spring-hud-pop max-w-[92vw] w-[460px]"
      role="status"
      aria-live="polite"
    >
      {/* Ambient Theme Prism Aura Behind HUD */}
      <div 
        className="absolute -inset-2 rounded-2xl blur-xl opacity-50 pointer-events-none transition-all duration-700"
        style={{
          background: 'radial-gradient(circle at center, var(--theme-glow, rgba(6, 182, 212, 0.4)), transparent 70%)',
        }}
      />

      {/* Main Frosted Glass Floating Card */}
      <div 
        className="relative px-5 py-4 rounded-2xl bg-[#0c0c14]/90 backdrop-blur-2xl border flex items-center justify-between gap-4 text-white shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          borderColor: 'var(--theme-border-glow, rgba(6, 182, 212, 0.45))',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 30px -5px var(--theme-glow, rgba(6, 182, 212, 0.4)), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Specular Prism Light Sweep on Glass Surface */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />

        {/* Dynamic Glass Icon with theme glow */}
        <div 
          className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-inner border border-white/20 shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--theme-accent-soft, rgba(6, 182, 212, 0.3)) 0%, rgba(255,255,255,0.08) 100%)',
            boxShadow: '0 0 16px var(--theme-glow, rgba(6, 182, 212, 0.4))',
          }}
        >
          {actionType === 'next' ? (
            <FastForward className="w-5 h-5 text-white animate-pulse" />
          ) : actionType === 'prev' ? (
            <Rewind className="w-5 h-5 text-white animate-pulse" />
          ) : actionType === 'play' ? (
            <Disc className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-white animate-bounce" />
          )}
        </div>

        {/* Content Info & Frequency details */}
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full animate-ping shrink-0" 
              style={{ backgroundColor: 'var(--theme-accent, #06B6D4)' }}
            />
            <span 
              className="text-[9.5px] font-mono-custom font-bold uppercase tracking-[0.2em]" 
              style={{ color: 'var(--theme-accent, #06B6D4)' }}
            >
              SIGNAL BROADCAST (1s)
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold font-mono-custom tracking-wide text-white mt-0.5 truncate">
            {actionTitle}
          </h4>

          <p className="text-[11px] font-mono-custom text-white/80 truncate mt-0.5">
            {actionSubtitle}
          </p>
        </div>

        {/* Live Audio Equalizer Spring Bars */}
        <div className="hidden sm:flex items-end gap-1 h-6 pl-2 border-l border-white/15 shrink-0">
          {[40, 90, 60, 100, 75, 45].map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full animate-pulse"
              style={{
                height: `${height}%`,
                backgroundColor: i % 2 === 0 ? 'var(--theme-accent, #06B6D4)' : '#ffffff',
                opacity: 0.9,
                animationDelay: `${i * 90}ms`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Close notification"
            className="p-1 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Bottom smooth 1.0s countdown progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full transition-all duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--theme-accent, #06B6D4)',
              boxShadow: '0 0 8px var(--theme-accent, #06B6D4)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
