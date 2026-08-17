import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Radio as RadioIcon, Volume2, Disc3 } from 'lucide-react';
import { TrackInfo, VibeTheme, UpNextTrack, JournalEntry } from '../types';
import { ambientAudio } from '../services/ambientAudio';
import { CentralTransmissionDeck } from './CentralTransmissionDeck';

interface AnalogBoomboxProps {
  track: TrackInfo;
  activeTheme: VibeTheme;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle?: () => void;
  isShuffle?: boolean;
  onSeek: (seconds: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  tapeHissEnabled: boolean;
  onToggleTapeHiss: () => void;
  upNextTracks?: UpNextTrack[];
  journal?: JournalEntry[];
  sessionFormattedTime?: string;
  signalsCaughtCount?: number;
  onSelectTrackIndex?: (index: number) => void;
  onResetSession?: () => void;
  onOpenSessionSummary?: () => void;
}

export const AnalogBoombox: React.FC<AnalogBoomboxProps> = ({
  track,
  activeTheme,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  isShuffle = false,
  volume,
  onVolumeChange,
  tapeHissEnabled,
  onToggleTapeHiss,
  upNextTracks = [],
  journal = [],
  sessionFormattedTime = '00:00:00',
  signalsCaughtCount = 0,
  onSelectTrackIndex,
  onResetSession,
  onOpenSessionSummary,
}) => {
  const [isTuningScratched, setIsTuningScratched] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualTune = () => {
    setIsTuningScratched(true);
    ambientAudio.playTunerClick();
    setTimeout(() => setIsTuningScratched(false), 300);
    onNext();
  };

  // Frequency position calculation for the analog dial (88.0 to 108.0 FM)
  const currentProgressPct = track.duration > 0 ? (track.currentTime / track.duration) * 100 : 35;
  const dialFreq = (98.6 + (track.index % 10) * 0.8 + (currentProgressPct * 0.02)).toFixed(1);

  return (
    <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-[680px] mx-auto my-1.5 sm:my-2.5 transition-all duration-300">
      {/* Outer ambient glow matched with active theme */}
      <div 
        className={`absolute -inset-2.5 rounded-2xl blur-xl transition-opacity duration-700 pointer-events-none ${
          track.isPlaying ? 'opacity-35' : 'opacity-10'
        }`}
        style={{
          background: `radial-gradient(ellipse at center, ${activeTheme.glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Main Boombox Enclosure */}
      <div className="relative bg-[#131318]/90 backdrop-blur-md border border-[#262633] rounded-xl shadow-2xl p-2.5 sm:p-4 overflow-hidden">
        {/* Top Chassis Header */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-3 bg-[#1a1a24] rounded-t-lg border-x border-t border-[#333344] flex items-center justify-between px-2.5">
          <div className="w-1 h-1 rounded-full bg-[#444]" />
          <span className="text-[7px] uppercase tracking-[0.2em] text-[#888899] font-mono-custom">
            MODEL: MX-2000 // {activeTheme.name.toUpperCase()}
          </span>
          <div className="w-1 h-1 rounded-full bg-[#444]" />
        </div>

        {/* Top Section: Analog Tuning Glass Dial */}
        <div className="relative mb-2.5 mt-0.5 bg-[#08080C] border border-[#222230] rounded-lg p-2 shadow-inner overflow-hidden">
          {/* Dial Header labels */}
          <div className="flex justify-between items-center text-[9px] text-[#888899] font-mono-custom px-1.5 mb-1">
            <span className="flex items-center gap-1.5 font-semibold tracking-wider" style={{ color: activeTheme.accentColor }}>
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ 
                  backgroundColor: track.isPlaying ? activeTheme.accentColor : '#444',
                  boxShadow: track.isPlaying ? `0 0 8px ${activeTheme.accentColor}` : 'none',
                }} 
              />
              FM STEREO RECEIVER
            </span>
            <span className="tracking-[0.2em] text-[#666677] text-[8px] uppercase hidden sm:inline">
              HIGH FIDELITY BROADCAST
            </span>
            <span className="font-mono-custom font-bold text-xs" style={{ color: activeTheme.accentColor }}>
              {dialFreq} MHz
            </span>
          </div>

          {/* Scale Markings (88 ... 98.6 ... 108 FM) */}
          <div className="relative h-6.5 bg-[#040406] border border-[#20202c] rounded flex items-center px-3 overflow-hidden">
            {/* Frequency tick marks */}
            <div className="w-full flex justify-between items-end h-3.5 text-[7.5px] text-[#666] font-mono-custom pb-0.5 select-none">
              <div className="flex flex-col items-center"><span className="h-1.5 w-px bg-[#333]" /><span>88</span></div>
              <div className="flex flex-col items-center"><span className="h-1 w-px bg-[#262626]" /></div>
              <div className="flex flex-col items-center"><span className="h-1.5 w-px bg-[#333]" /><span>92</span></div>
              <div className="flex flex-col items-center"><span className="h-1 w-px bg-[#262626]" /></div>
              <div className="flex flex-col items-center font-bold" style={{ color: activeTheme.accentColor }}>
                <span className="h-2 w-px" style={{ backgroundColor: activeTheme.accentColor }} />
                <span>98.6</span>
              </div>
              <div className="flex flex-col items-center"><span className="h-1 w-px bg-[#262626]" /></div>
              <div className="flex flex-col items-center"><span className="h-1.5 w-px bg-[#333]" /><span>104</span></div>
              <div className="flex flex-col items-center"><span className="h-1 w-px bg-[#262626]" /></div>
              <div className="flex flex-col items-center"><span className="h-1.5 w-px bg-[#333]" /><span>108</span></div>
            </div>

            {/* Glowing Theme Needle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 transition-all duration-300 pointer-events-none"
              style={{ 
                left: `${Math.max(4, Math.min(96, currentProgressPct))}%`,
                backgroundColor: activeTheme.accentColor,
                boxShadow: `0 0 8px ${activeTheme.accentColor}`,
              }}
            >
              <div 
                className="w-1.5 h-1.5 -ml-[2px] rounded-full" 
                style={{ 
                  backgroundColor: activeTheme.accentColor,
                  boxShadow: `0 0 6px ${activeTheme.accentColor}`,
                }} 
              />
            </div>
          </div>
        </div>

        {/* Middle Section: Left Speaker — Cassette Center — Right Speaker */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1.5">
          
          {/* Left Speaker Grille */}
          <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center">
            <div 
              className={`relative w-24 h-24 rounded-full bg-[#0E0E12] border-3 border-[#1E1E28] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all ${
                track.isPlaying ? 'speaker-active' : ''
              }`}
              style={{
                boxShadow: track.isPlaying ? `0 0 12px ${activeTheme.glowColor}` : 'none',
              }}
            >
              <div className="w-18 h-18 rounded-full border border-[#181822] bg-[#0A0A0E] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-[#222230] bg-gradient-to-br from-[#14141c] to-[#08080c] flex items-center justify-center shadow-inner">
                  <div className="w-6.5 h-6.5 rounded-full bg-[#111118] border border-[#2a2a3a] shadow-md flex items-center justify-center">
                    <span className="text-[6px] text-[#777] font-mono-custom tracking-tighter">BASS</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="mt-1 text-[7.5px] uppercase tracking-[0.2em] text-[#666677] font-mono-custom">LEFT CH</span>
          </div>

          {/* Center Cassette Deck & LCD Phosphor Panel */}
          <div className="col-span-1 md:col-span-6 flex flex-col gap-2">
            
            {/* Retro Editorial LCD Display */}
            <div 
              className="relative bg-[#050508] border border-[#282838] rounded-md p-2.5 sm:p-3 shadow-xl overflow-hidden"
              style={{
                boxShadow: `0 0 16px ${activeTheme.glowColor}`,
              }}
            >
              {/* LCD Top Status Bar */}
              <div className="flex justify-between items-center text-[9px] font-mono-custom border-b border-[#20202c] pb-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span 
                    className={`w-1.5 h-1.5 rounded-full ${track.isPlaying ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: track.isPlaying ? activeTheme.accentColor : '#555',
                      boxShadow: track.isPlaying ? `0 0 6px ${activeTheme.accentColor}` : 'none',
                    }}
                  />
                  <span className="font-bold tracking-widest text-[8.5px] uppercase" style={{ color: activeTheme.accentColor }}>
                    {track.isPlaying ? '● SIGNAL LOCKED' : track.isBuffering ? '◌ RETUNING...' : '◌ SIGNAL STANDBY'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[8px] px-1 py-0.5 rounded font-mono-custom uppercase tracking-wider"
                    style={{ backgroundColor: `${activeTheme.accentColor}20`, color: activeTheme.accentColor }}
                  >
                    98.6 FM
                  </span>
                  <span className="font-lcd-custom text-sm" style={{ color: activeTheme.accentColor }}>
                    {formatTime(track.currentTime)} / {formatTime(track.duration)}
                  </span>
                </div>
              </div>

              {/* Dynamic Track Title Marquee */}
              <div className="py-0.5 overflow-hidden whitespace-nowrap">
                <div className="text-xs sm:text-sm text-[#EDE8DF] font-mono-custom font-medium tracking-tight truncate">
                  {track.title ? (
                    <span className="inline-block">{track.title}</span>
                  ) : (
                    <span className="text-[#888] italic">No Genre. No Explanation. Just Vibes.</span>
                  )}
                </div>
              </div>

              {/* LCD Bottom Audio VU Equalizer Bars */}
              <div className="mt-1.5 pt-1 border-t border-[#20202c] flex items-center justify-between">
                <div className="flex items-end gap-1 h-3.5">
                  {[45, 80, 60, 95, 70, 90, 50, 85, 65, 100, 75, 55, 90].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-xs transition-all duration-150"
                      style={{
                        backgroundColor: activeTheme.accentColor,
                        height: track.isPlaying ? `${Math.max(18, (h * (0.4 + (i % 3) * 0.25)))}%` : '18%',
                        opacity: track.isPlaying ? 0.95 : 0.25,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[8px] uppercase tracking-[0.2em] text-[#888899] font-mono-custom">
                  {activeTheme.genreTag}
                </span>
              </div>
            </div>

            {/* Vintage Cassette Window with Rotating Dual Spools */}
            <div className="relative bg-[#08080C] border border-[#20202c] rounded-md p-2 sm:p-2.5 flex items-center justify-around shadow-inner overflow-hidden">
              <div className="absolute inset-1 border border-[#161620] rounded pointer-events-none" />

              {/* Left Tape Reel */}
              <div className="flex flex-col items-center">
                <div className={`relative w-11 h-11 rounded-full bg-[#111116] border-2 border-[#262632] flex items-center justify-center ${track.isPlaying ? 'spin-reel-playing' : 'spin-reel-paused'}`}>
                  <div className="w-4.5 h-4.5 rounded-full bg-[#1c1c24] border border-[#333344] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#08080c]" />
                  </div>
                  <div className="absolute w-8 h-0.5 bg-[#333]" />
                  <div className="absolute w-8 h-0.5 bg-[#333] rotate-60" />
                  <div className="absolute w-8 h-0.5 bg-[#333] -rotate-60" />
                </div>
                <span className="text-[7.5px] text-[#666] font-mono-custom mt-0.5 uppercase tracking-wider">SUPPLY</span>
              </div>

              {/* Cassette Center Vintage Handwritten Sticker Label */}
              <div className="relative text-center px-2.5 py-1 bg-[#E8E4D9] text-[#121218] border border-[#B8B2A4] rounded shadow-md max-w-[135px] transform -rotate-1 transition-transform hover:rotate-0 select-none overflow-hidden">
                {/* Vintage tape sticker texture & lines */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#D3CEBF]/60 border-b border-[#BCB6A5]/50" />
                <div className="flex items-center justify-between text-[6.5px] font-mono-custom text-[#555] border-b border-[#C8C2B2] pb-0.5 mb-0.5">
                  <span className="font-bold tracking-wider">SIDE A</span>
                  <span className="tracking-widest">98.6 FM</span>
                </div>

                {/* Dynamic Handwritten Vibe Theme Title */}
                <div 
                  key={activeTheme.id}
                  className="font-handwriting-custom text-sm sm:text-base font-bold leading-none py-0.5 tracking-wide text-[#1A1A24] animate-fade-in drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] truncate"
                  style={{
                    color: '#16161F',
                  }}
                  title={`Current Mood: ${activeTheme.name}`}
                >
                  {activeTheme.name}
                </div>

                <div className="flex items-center justify-between text-[5.5px] font-mono-custom text-[#666] uppercase tracking-tighter pt-0.5">
                  <span>TYPE II • CHROME</span>
                  <span style={{ color: activeTheme.accentColor }} className="font-bold">● {activeTheme.genreTag}</span>
                </div>

                {/* Tape Window Reel Progress Bar */}
                <div className="mt-0.5 w-full bg-[#302D26]/20 h-0.5 rounded-full overflow-hidden border border-[#202020]/20">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${currentProgressPct}%`,
                      backgroundColor: activeTheme.accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Right Tape Reel */}
              <div className="flex flex-col items-center">
                <div className={`relative w-11 h-11 rounded-full bg-[#111116] border-2 border-[#262632] flex items-center justify-center ${track.isPlaying ? 'spin-reel-playing' : 'spin-reel-paused'}`}>
                  <div className="w-4.5 h-4.5 rounded-full bg-[#1c1c24] border border-[#333344] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#08080c]" />
                  </div>
                  <div className="absolute w-8 h-0.5 bg-[#333]" />
                  <div className="absolute w-8 h-0.5 bg-[#333] rotate-60" />
                  <div className="absolute w-8 h-0.5 bg-[#333] -rotate-60" />
                </div>
                <span className="text-[7.5px] text-[#666] font-mono-custom mt-0.5 uppercase tracking-wider">TAKE-UP</span>
              </div>
            </div>

          </div>

          {/* Right Speaker Grille */}
          <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center">
            <div 
              className={`relative w-24 h-24 rounded-full bg-[#0E0E12] border-3 border-[#1E1E28] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all ${
                track.isPlaying ? 'speaker-active' : ''
              }`}
              style={{
                boxShadow: track.isPlaying ? `0 0 12px ${activeTheme.glowColor}` : 'none',
              }}
            >
              <div className="w-18 h-18 rounded-full border border-[#181822] bg-[#0A0A0E] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-[#222230] bg-gradient-to-br from-[#14141c] to-[#08080c] flex items-center justify-center shadow-inner">
                  <div className="w-6.5 h-6.5 rounded-full bg-[#111118] border border-[#2a2a3a] shadow-md flex items-center justify-center">
                    <span className="text-[6px] text-[#777] font-mono-custom tracking-tighter">BASS</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="mt-1 text-[7.5px] uppercase tracking-[0.2em] text-[#666677] font-mono-custom">RIGHT CH</span>
          </div>

        </div>

        {/* Bottom Section: Tactile Mechanical Buttons & Knobs - Symmetrically Balanced & Fully Contained */}
        <div className="mt-3 pt-2.5 border-t border-[#222230] flex flex-wrap items-center justify-between gap-2">
          
          {/* Main Mechanical Playback Transport Cluster */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
            {/* Previous Track */}
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onPrevious();
              }}
              title="Previous Track (Left Arrow)"
              className="px-2.5 sm:px-3 py-2 bg-[#14141c] hover:bg-[#20202c] active:translate-y-0.5 text-[#E4E3E0] border border-[#2c2c3c] rounded-md shadow-md flex items-center justify-center gap-1.5 text-xs font-mono-custom transition-all cursor-pointer shrink-0"
            >
              <SkipBack className="w-4 h-4 text-[#888]" />
              <span className="hidden xs:inline">REW</span>
            </button>

            {/* Main Play / Pause Button with dynamic theme color */}
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onPlayPause();
              }}
              title={track.isPlaying ? 'Pause Signal (Spacebar)' : 'Engage Signal (Spacebar)'}
              className={`px-4 sm:px-5 py-2 rounded-md font-mono-custom text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:translate-y-0.5 text-black shrink-0 ${
                track.isPlaying ? '' : 'animate-pulse'
              }`}
              style={{
                backgroundColor: activeTheme.accentColor,
                boxShadow: `0 0 20px ${activeTheme.glowColor}`,
              }}
            >
              {track.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>PRESS PLAY</span>
                </>
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onNext();
              }}
              title="Next Track (Right Arrow)"
              className="px-2.5 sm:px-3 py-2 bg-[#14141c] hover:bg-[#20202c] active:translate-y-0.5 text-[#E4E3E0] border border-[#2c2c3c] rounded-md shadow-md flex items-center justify-center gap-1.5 text-xs font-mono-custom transition-all cursor-pointer shrink-0"
            >
              <span className="hidden xs:inline">FWD</span>
              <SkipForward className="w-4 h-4 text-[#888]" />
            </button>

            {/* Shuffle Button */}
            {onToggleShuffle && (
              <button
                onClick={() => {
                  ambientAudio.playTunerClick();
                  onToggleShuffle();
                }}
                title="Shuffle Playlist Tracks"
                className="px-2.5 sm:px-3 py-2 rounded-md border text-xs font-mono-custom flex items-center justify-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5 shrink-0"
                style={{
                  backgroundColor: isShuffle ? `${activeTheme.accentColor}20` : '#14141c',
                  borderColor: isShuffle ? activeTheme.accentColor : '#2c2c3c',
                  color: isShuffle ? activeTheme.accentColor : '#888',
                }}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SHUFFLE</span>
              </button>
            )}
          </div>

          {/* Tactile Atmosphere Toggles & Rotary Volume Level */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2">
            
            {/* Tape Lo-fi Hiss FX Switch */}
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onToggleTapeHiss();
              }}
              title="Toggle Analog Tape Hiss"
              className="px-2.5 py-1.5 sm:py-2 rounded-md text-[11px] font-mono-custom border flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              style={{
                backgroundColor: tapeHissEnabled ? `${activeTheme.accentColor}20` : '#14141c',
                borderColor: tapeHissEnabled ? activeTheme.accentColor : '#2c2c3c',
                color: tapeHissEnabled ? activeTheme.accentColor : '#888',
              }}
            >
              <Disc3 className={`w-3.5 h-3.5 ${tapeHissEnabled ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">TAPE</span>
            </button>

            {/* Manual Tune Scratch Trigger */}
            <button
              onClick={handleManualTune}
              title="Manual Frequency Scan"
              className="px-2.5 py-1.5 sm:py-2 bg-[#14141c] hover:bg-[#20202c] border border-[#2c2c3c] rounded-md text-[11px] font-mono-custom text-[#888] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
            >
              <RadioIcon className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
              <span className="hidden xs:inline">SCAN</span>
            </button>

            {/* Rotary Volume Dial / Slider - Contained & Protected */}
            <div className="flex items-center gap-1.5 bg-[#0c0c12] border border-[#222230] px-2.5 py-1.5 rounded-md shrink-0">
              <Volume2 className="w-3.5 h-3.5 text-[#888] shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-14 xs:w-16 sm:w-20 h-1.5 bg-[#262636] rounded-lg cursor-pointer"
                style={{ accentColor: activeTheme.accentColor }}
                title={`Volume: ${volume}%`}
              />
              <span className="text-[10px] text-[#888] font-mono-custom w-5 text-right tabular-nums">{volume}%</span>
            </div>

          </div>

        </div>

        {/* Central Transmission Telemetry Deck: UP NEXT, NOW PLAYING NOTE, SIGNAL JOURNAL, LISTENING SESSION */}
        <CentralTransmissionDeck
          upNextTracks={upNextTracks}
          journal={journal}
          sessionFormattedTime={sessionFormattedTime}
          signalsCaughtCount={signalsCaughtCount}
          activeTheme={activeTheme}
          currentTrack={track}
          onSelectTrackIndex={onSelectTrackIndex}
          onResetSession={onResetSession}
          onOpenSessionSummary={onOpenSessionSummary}
        />

      </div>
    </div>
  );
};
