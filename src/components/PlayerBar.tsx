import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  Shuffle, 
  Repeat, 
  MoreVertical,
} from 'lucide-react';
import { TrackInfo, VibeTheme } from '../types';

interface PlayerBarProps {
  track: TrackInfo;
  activeTheme: VibeTheme;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  isSpotifySaved?: boolean;
  onToggleSpotifySave?: () => void;
  onOpenSpotifyModal?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  track,
  activeTheme,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  isSpotifySaved = false,
  onToggleSpotifySave,
  onOpenSpotifyModal,
}) => {
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverPositionPct, setHoverPositionPct] = useState<number>(0);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    onSeek(newTime);
  };

  // Hover seekbar to calculate preview timestamp
  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !track.duration || track.duration <= 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = pct * track.duration;
    setHoverPositionPct(pct * 100);
    setHoverSeekTime(targetSeconds);
  };

  const handleSeekMouseLeave = () => {
    setHoverSeekTime(null);
  };

  // Progress percentage (0 to 100)
  const currentProgressPct = track.duration > 0 ? (track.currentTime / track.duration) * 100 : 0;
  
  // Track is nearing its end if remaining time is <= 25 seconds (or progress > 88% on tracks > 30s)
  const isNearingEnd = track.duration > 30 && (track.duration - track.currentTime <= 25 || currentProgressPct >= 88);

  // Generate 20 spectrum waveform bars with organic harmonic heights
  const waveformHeights = [
    20, 32, 48, 68, 88, 96, 80, 64, 90, 100, 75, 56, 84, 92, 70, 50, 78, 60, 40, 24
  ];

  return (
    <footer className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-40 max-w-7xl mx-auto select-none pointer-events-auto transition-all duration-500">
      
      {/* Outer ambient theme glow aura - powered by dynamic CSS variable */}
      <div 
        className="absolute -inset-1 rounded-2xl md:rounded-full blur-xl opacity-40 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: 'var(--theme-glow, rgba(6, 182, 212, 0.4))',
        }}
      />

      {/* ========================================================================= */}
      {/* 1. MOBILE-DEDICATED COMPACT VERTICAL-STACK PLAYER (Viewports < 768px)    */}
      {/* ========================================================================= */}
      <div 
        className="block md:hidden relative bg-[#0A0B12]/95 backdrop-blur-2xl border rounded-2xl p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.92)] transition-all duration-300"
        style={{
          borderColor: 'var(--theme-border-glow, rgba(6, 182, 212, 0.35))',
          boxShadow: `0 12px 35px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.12), 0 0 16px var(--theme-glow, ${activeTheme.glowColor})`,
        }}
      >
        {/* Top Row: Artwork Thumbnail + Track Title & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg overflow-hidden border shadow-md bg-[#14141E] shrink-0"
            style={{
              borderColor: 'var(--theme-accent, #06B6D4)',
              boxShadow: '0 0 10px var(--theme-glow, rgba(6, 182, 212, 0.3))',
            }}
          >
            <img 
              src={track.id ? `https://img.youtube.com/vi/${track.id}/hqdefault.jpg` : activeTheme.image} 
              alt={track.title || 'Track Artwork'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = activeTheme.image;
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ 
                  backgroundColor: 'var(--theme-accent, #06B6D4)',
                  boxShadow: '0 0 6px var(--theme-accent, #06B6D4)',
                }}
              />
              <span 
                className="text-[9px] font-digital-custom font-bold tracking-wider uppercase truncate"
                style={{ color: 'var(--theme-accent, #06B6D4)' }}
              >
                {track.isPlaying ? 'SIGNAL LOCKED' : 'SIGNAL STANDBY'}
              </span>
            </div>
            <h4 
              className="text-[12px] font-semibold text-white truncate font-sans drop-shadow-sm mt-0.5 leading-tight"
              title={track.title}
            >
              {track.title || 'SIGNAL_SEARCHING_ATMOSPHERE'}
            </h4>
            <p className="text-[9px] font-mono-custom text-[#A0A0B2] uppercase tracking-wider truncate">
              {activeTheme.name.toUpperCase()} <span className="text-white/30">/</span> {activeTheme.genreTag.split('/')[0] || 'DRIVE'}
            </p>
          </div>

          {/* Quick Spotify / Options buttons on top-right */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSpotifySave && (
              <button
                onClick={onToggleSpotifySave}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-full text-white/60 hover:text-white cursor-pointer active:scale-95"
                title="Save track to Spotify"
              >
                <Heart 
                  className={`w-4 h-4 transition-all ${
                    isSpotifySaved 
                      ? 'fill-[#1DB954] text-[#1DB954] drop-shadow-[0_0_8px_rgba(29,185,84,0.7)]' 
                      : ''
                  }`} 
                />
              </button>
            )}
            {onOpenSpotifyModal && (
              <button
                onClick={onOpenSpotifyModal}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 text-white/50 hover:text-white cursor-pointer"
                title="Station Broadcast / Spotify Deck"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Middle Row: Roomy, Comfortable Interactive Controls (Minimum 44x44px touch targets) */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 px-1">
          {/* Left: Shuffle & Mute */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleShuffle}
              title="Shuffle Playlist"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                isShuffle ? 'text-white' : 'text-white/50'
              }`}
              style={{ color: isShuffle ? 'var(--theme-accent, #06B6D4)' : undefined }}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-white/60 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center: Primary Playback Group (REW, PLAY/PAUSE, FWD) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              title="Previous Signal"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer bg-white/5"
            >
              <SkipBack className="w-4.5 h-4.5 fill-current" />
            </button>

            <button
              onClick={onPlayPause}
              title={track.isPlaying ? 'Pause' : 'Play'}
              className="min-h-[46px] min-w-[46px] rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 border"
              style={{
                borderColor: 'var(--theme-accent, #06B6D4)',
                backgroundColor: 'var(--theme-accent-soft, rgba(6, 182, 212, 0.25))',
                boxShadow: '0 0 16px var(--theme-glow, rgba(6, 182, 212, 0.45)), inset 0 0 8px var(--theme-glow, rgba(6, 182, 212, 0.4))',
              }}
            >
              {track.isPlaying ? (
                <Pause className="w-4.5 h-4.5" style={{ color: 'var(--theme-accent, #06B6D4)', fill: 'var(--theme-accent, #06B6D4)' }} />
              ) : (
                <Play className="w-4.5 h-4.5 ml-0.5" style={{ color: 'var(--theme-accent, #06B6D4)', fill: 'var(--theme-accent, #06B6D4)' }} />
              )}
            </button>

            <button
              onClick={onNext}
              title="Next Signal"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer bg-white/5"
            >
              <SkipForward className="w-4.5 h-4.5 fill-current" />
            </button>
          </div>

          {/* Right: Repeat & Volume Level Badge */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleRepeat}
              title="Repeat Track"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                isRepeat ? 'text-white' : 'text-white/50'
              }`}
              style={{ color: isRepeat ? 'var(--theme-accent, #06B6D4)' : undefined }}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-digital-custom text-white/70 tabular-nums w-8 text-center">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* Bottom Row: Smooth Interactive Seek Track with Timestamps */}
        <div className="mt-1 px-1">
          <div className="flex items-center justify-between text-[9px] font-digital-custom text-white/70 mb-1">
            <span className="text-white/90">{formatTime(track.currentTime)}</span>
            <span>{track.duration > 0 ? formatTime(track.duration) : '--:--'}</span>
          </div>
          <div className="relative flex items-center h-4 group cursor-pointer">
            <div className="absolute inset-x-0 h-1.5 bg-white/15 rounded-full overflow-hidden pointer-events-none">
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${currentProgressPct}%`,
                  backgroundColor: 'var(--theme-accent, #06B6D4)',
                  boxShadow: '0 0 8px var(--theme-accent, #06B6D4)',
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={track.duration || 100}
              value={track.currentTime}
              onChange={handleSliderChange}
              className="w-full h-4 opacity-0 cursor-pointer appearance-none block absolute inset-0 z-20"
              aria-label="Seek track position"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP CAPSULE MEDIA PLAYER (Preserved exactly at >= 768px)          */}
      {/* ========================================================================= */}
      <div 
        className="hidden md:flex relative bg-[#0A0B12]/94 backdrop-blur-2xl border rounded-full px-4 md:px-5 lg:px-6 py-2.5 items-center justify-between gap-3 lg:gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.88)] transition-all duration-500 min-h-[62px]"
        style={{
          borderColor: 'var(--theme-border-glow, rgba(6, 182, 212, 0.35))',
          boxShadow: `0 15px 40px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 20px var(--theme-glow, ${activeTheme.glowColor})`,
        }}
      >

        {/* ================= LEFT SECTION: Vinyl Record + Artwork + Title Meta (Strictly clamped width for theme stability) ================= */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 md:max-w-[210px] lg:max-w-[290px] xl:max-w-[360px] shrink flex-1">
          
          {/* Vinyl Record slipping out behind cover sleeve */}
          <div className="relative shrink-0 flex items-center">
            {/* Spinning Vinyl Record Disc */}
            <div 
              className={`absolute -left-2 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#08080C] border border-[#22222E] shadow-md flex items-center justify-center transition-transform duration-700 ${
                track.isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'opacity-90'
              }`}
              style={{
                background: 'radial-gradient(circle, #2a2a35 0%, #121218 35%, #08080C 70%, #15151f 100%)',
                boxShadow: 'inset 0 0 4px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {/* Vinyl Grooves & Center Label */}
              <div 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/20 flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-accent, #06B6D4)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#08080C]" />
              </div>
            </div>

            {/* Square Album Cover Artwork */}
            <div 
              className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg overflow-hidden border shadow-lg bg-[#14141E] shrink-0"
              style={{
                borderColor: 'var(--theme-accent, #06B6D4)',
                boxShadow: '0 0 12px var(--theme-glow, rgba(6, 182, 212, 0.4))',
              }}
            >
              <img 
                src={track.id ? `https://img.youtube.com/vi/${track.id}/hqdefault.jpg` : activeTheme.image} 
                alt={track.title || 'Track Artwork'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = activeTheme.image;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Track Meta & Live Status with Fluid Typography */}
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            {/* Status Line: "● SIGNAL LOCKED" */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ 
                  backgroundColor: 'var(--theme-accent, #06B6D4)',
                  boxShadow: '0 0 8px var(--theme-accent, #06B6D4)',
                }}
              />
              <span 
                className="text-[clamp(8.5px,0.8vw,9.5px)] font-digital-custom font-bold tracking-wider uppercase truncate"
                style={{ color: 'var(--theme-accent, #06B6D4)' }}
              >
                {track.isPlaying ? 'SIGNAL LOCKED' : 'SIGNAL STANDBY'}
              </span>
              
              {/* Mini Audio Equalizer Icon */}
              <div className="flex items-center gap-0.5 h-2 ml-0.5 shrink-0">
                {[50, 90, 70].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{
                      height: track.isPlaying ? `${h}%` : '20%',
                      backgroundColor: 'var(--theme-accent, #06B6D4)',
                      animation: track.isPlaying ? `pulse ${0.35 + i * 0.15}s ease-in-out infinite alternate` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Song Title with Fluid Typography */}
            <h4 
              className="text-[clamp(11px,1.1vw,13.5px)] font-semibold tracking-tight text-white truncate font-sans drop-shadow-sm mt-0.5"
              title={track.title}
            >
              {track.title || 'SIGNAL_SEARCHING_ATMOSPHERE'}
            </h4>

            {/* Subtitle / Genre Tag with Fluid Typography & Safe Truncation */}
            <p className="text-[clamp(8.5px,0.8vw,9.5px)] font-mono-custom text-[#A0A0B2] uppercase tracking-wider truncate">
              {activeTheme.name.toUpperCase()} <span className="text-white/30">/</span> {activeTheme.genreTag.split('/')[0] || 'DRIVE'}
            </p>
          </div>
        </div>

        {/* ================= CENTER SECTION: Transport Controls (Always Compact & Centered) ================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          
          {/* Left Vertical Divider (Desktop) */}
          <div className="hidden md:block w-[1px] h-6 bg-white/10 shrink-0" />

          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle Active (Randomized Transmission)' : 'Enable Shuffle'}
            className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
              isShuffle 
                ? 'text-white scale-105' 
                : 'text-white/50 hover:text-white hover:scale-105'
            }`}
            style={{ 
              color: isShuffle ? 'var(--theme-accent, #06B6D4)' : undefined,
              filter: isShuffle ? 'drop-shadow(0 0 6px var(--theme-accent, #06B6D4))' : undefined,
            }}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Previous Track Button */}
          <button
            onClick={onPrevious}
            title="Previous Signal (Left Arrow)"
            className="text-white/70 hover:text-white transition-all p-1.5 cursor-pointer active:scale-90 shrink-0"
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          </button>

          {/* Center Elevated Illuminated Play/Pause Button */}
          <button
            onClick={onPlayPause}
            title={track.isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-10.5 md:h-10.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 border"
            style={{
              borderColor: 'var(--theme-accent, #06B6D4)',
              backgroundColor: 'var(--theme-accent-soft, rgba(6, 182, 212, 0.2))',
              boxShadow: '0 0 18px var(--theme-glow, rgba(6, 182, 212, 0.4)), inset 0 0 8px var(--theme-glow, rgba(6, 182, 212, 0.4))',
            }}
          >
            {track.isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--theme-accent, #06B6D4)', fill: 'var(--theme-accent, #06B6D4)' }} />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" style={{ color: 'var(--theme-accent, #06B6D4)', fill: 'var(--theme-accent, #06B6D4)' }} />
            )}
          </button>

          {/* Next Track Button */}
          <button
            onClick={onNext}
            title="Next Signal (Right Arrow)"
            className="text-white/70 hover:text-white transition-all p-1.5 cursor-pointer active:scale-90 shrink-0"
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={onToggleRepeat}
            title={isRepeat ? 'Repeat Active (Loop Stream)' : 'Enable Repeat'}
            className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
              isRepeat 
                ? 'text-white scale-105' 
                : 'text-white/50 hover:text-white hover:scale-105'
            }`}
            style={{ 
              color: isRepeat ? 'var(--theme-accent, #06B6D4)' : undefined,
              filter: isRepeat ? 'drop-shadow(0 0 6px var(--theme-accent, #06B6D4))' : undefined,
            }}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= CENTER-RIGHT: Spectrum Waveform + Progress Scrub + Fluid LCD Time ================= */}
        <div className="hidden lg:flex flex-col flex-1 max-w-xs xl:max-w-sm gap-1 shrink">
          
          {/* Dynamic Spectrum Waveform Audio Bars */}
          <div className="flex items-end justify-between gap-[2px] h-4 px-1 overflow-hidden">
            {waveformHeights.map((h, index) => {
              const activeHeight = track.isPlaying 
                ? `${Math.max(15, (h * ((index % 3) + 1) * 0.35 + (track.currentTime * 5) % 40) % 100)}%`
                : '12%';
              return (
                <span
                  key={index}
                  className="w-1 rounded-t-xs transition-all duration-150"
                  style={{
                    height: activeHeight,
                    backgroundColor: 'var(--theme-accent, #06B6D4)',
                    opacity: track.isPlaying ? 0.9 : 0.3,
                    boxShadow: track.isPlaying ? '0 0 5px var(--theme-accent, #06B6D4)' : undefined,
                  }}
                />
              );
            })}
          </div>

          {/* Precision Scrub Bar with Glowing Thumb, Hover Timestamp Preview & Nearing-End Pulse */}
          <div className="flex items-center gap-2.5">
            <div 
              ref={seekBarRef}
              onMouseMove={handleSeekMouseMove}
              onMouseLeave={handleSeekMouseLeave}
              className="relative flex-1 flex items-center h-4 group cursor-pointer"
            >
              {/* Floating Preview Timestamp Tooltip on Hover */}
              {hoverSeekTime !== null && track.duration > 0 && (
                <div 
                  className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded bg-[#101018]/95 border text-[10px] font-digital-custom font-bold text-white shadow-xl pointer-events-none z-30 transition-opacity duration-150 animate-fadeIn flex items-center gap-1"
                  style={{
                    left: `${hoverPositionPct}%`,
                    borderColor: 'var(--theme-accent, #06B6D4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 10px var(--theme-glow, rgba(6, 182, 212, 0.4))',
                  }}
                >
                  <span className="text-[9px] text-white/50 font-mono-custom">SEEK:</span>
                  <span style={{ color: 'var(--theme-accent, #06B6D4)' }}>
                    {formatTime(hoverSeekTime)}
                  </span>
                </div>
              )}

              {/* Underlying Base Track */}
              <div className="absolute inset-x-0 h-1 group-hover:h-1.5 bg-white/15 rounded-full overflow-hidden transition-all duration-200 pointer-events-none">
                {/* Active Progress Fill */}
                <div 
                  className="h-full rounded-full transition-all duration-100"
                  style={{ 
                    width: `${currentProgressPct}%`,
                    backgroundColor: 'var(--theme-accent, #06B6D4)',
                    boxShadow: '0 0 8px var(--theme-accent, #06B6D4)',
                  }}
                />
              </div>

              {/* Pulsing Progress Handle Indicator (Nearing End or Active) */}
              <div 
                className={`absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 pointer-events-none transition-transform duration-100 z-10 flex items-center justify-center ${
                  isNearingEnd ? 'animate-ping' : ''
                }`}
                style={{
                  left: `${currentProgressPct}%`,
                  backgroundColor: 'var(--theme-accent, #06B6D4)',
                  boxShadow: `0 0 10px var(--theme-accent, #06B6D4), 0 0 16px var(--theme-glow, ${activeTheme.glowColor})`,
                }}
              />
              {/* Solid center dot for handle */}
              <div 
                className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 pointer-events-none z-20 border border-white/80"
                style={{
                  left: `${currentProgressPct}%`,
                  backgroundColor: isNearingEnd ? '#F43F5E' : 'var(--theme-accent, #06B6D4)',
                  boxShadow: isNearingEnd ? '0 0 12px #F43F5E' : '0 0 8px var(--theme-accent, #06B6D4)',
                }}
              />

              {/* Native transparent range input for precision scrubbing and keyboard accessibility */}
              <input
                type="range"
                min="0"
                max={track.duration || 100}
                value={track.currentTime}
                onChange={handleSliderChange}
                className="w-full h-4 opacity-0 cursor-pointer appearance-none block absolute inset-0 z-20"
                aria-label="Seek track position"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-[clamp(9.5px,0.9vw,11px)] font-digital-custom font-medium text-white/90 tabular-nums shrink-0 tracking-wider">
              {formatTime(track.currentTime)} <span className="text-white/40">/</span> {track.duration > 0 ? formatTime(track.duration) : '--:--'}
            </span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: Volume + Spotify Save + Options ================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          
          {/* Right Vertical Divider (Desktop) */}
          <div className="hidden md:block w-[1px] h-6 bg-white/10 shrink-0" />

          {/* Volume Control with Fluid Slider Width */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleMute}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 shrink-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-12 sm:w-16 md:w-20 h-1 bg-white/20 rounded cursor-pointer transition-all shrink-0"
              style={{ accentColor: 'var(--theme-accent, #06B6D4)' }}
            />

            <span className="text-[clamp(9px,0.85vw,10.5px)] font-digital-custom text-white/80 tabular-nums w-6 sm:w-7 text-right shrink-0">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>

          {/* Spotify Save Heart Button */}
          {onToggleSpotifySave && (
            <button
              onClick={onToggleSpotifySave}
              className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                isSpotifySaved
                  ? 'text-[#1DB954] hover:scale-110'
                  : 'text-white/50 hover:text-white hover:scale-110'
              }`}
              title={
                isSpotifySaved
                  ? "Saved to 'Mixed Signals' Spotify playlist"
                  : "Save current track to Spotify ('Mixed Signals' playlist)"
              }
              aria-label="Save current track to Spotify"
            >
              <Heart 
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                  isSpotifySaved 
                    ? 'fill-[#1DB954] drop-shadow-[0_0_8px_rgba(29,185,84,0.7)]' 
                    : 'group-hover:text-[#1DB954]'
                }`} 
              />
            </button>
          )}

          {/* Quick Options / Station Trigger */}
          {onOpenSpotifyModal && (
            <button
              onClick={onOpenSpotifyModal}
              className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Station Broadcast / Spotify Deck"
            >
              <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

      </div>

    </footer>
  );
};
