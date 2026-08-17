import React, { useState, useEffect, useRef } from 'react';
import { Radio, Headphones, Compass, Terminal, Clock, ChevronLeft, ChevronRight, Users, Quote, Car, Moon, Volume2, Check, ChevronDown } from 'lucide-react';
import { TrackInfo, VibeTheme, ListeningModeType } from '../types';
import { RADIO_QUOTES } from '../data/radioQuotes';
import { LISTENING_MODES, getListeningModeById } from '../data/listeningModes';

export { LISTENING_MODES, getListeningModeById };
export type { ListeningModeType };

interface VibeNotesProps {
  track: TrackInfo;
  activeTheme: VibeTheme;
  liveTime: {
    time12: string;
    timeFull: string;
    timeTag: string;
  };
  onlineListeners: number;
  onSpaceHintClick: () => void;
  selectedModeId?: ListeningModeType;
  onSelectListeningMode?: (mode: ListeningModeType) => void;
}

export const VibeNotes: React.FC<VibeNotesProps> = ({
  track,
  activeTheme,
  liveTime,
  onlineListeners,
  onSpaceHintClick,
  selectedModeId: externalModeId,
  onSelectListeningMode,
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Interactive Listening Mode State with LocalStorage Persistence
  const [internalModeId, setInternalModeId] = useState<ListeningModeType>(() => {
    try {
      const saved = localStorage.getItem('mixed_signals_listening_mode');
      if (saved && ['headphones', 'drive', 'background', 'speaker'].includes(saved)) {
        return saved as ListeningModeType;
      }
    } catch {
      // Graceful fallback if localStorage is disabled
    }
    return 'headphones';
  });

  const selectedModeId = externalModeId !== undefined ? externalModeId : internalModeId;

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);

  const selectedMode = getListeningModeById(selectedModeId);
  const ModeIcon = selectedMode.icon;

  const handleSelectMode = (modeId: ListeningModeType) => {
    if (onSelectListeningMode) {
      onSelectListeningMode(modeId);
    } else {
      setInternalModeId(modeId);
    }
    setIsModeMenuOpen(false);
    try {
      localStorage.setItem('mixed_signals_listening_mode', modeId);
    } catch {
      // Ignore storage errors
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modeMenuRef.current &&
        !modeMenuRef.current.contains(e.target as Node) &&
        modeButtonRef.current &&
        !modeButtonRef.current.contains(e.target as Node)
      ) {
        setIsModeMenuOpen(false);
      }
    };

    if (isModeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModeMenuOpen]);

  // Keyboard navigation & Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModeMenuOpen) return;

      if (e.key === 'Escape') {
        setIsModeMenuOpen(false);
        modeButtonRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIdx = LISTENING_MODES.findIndex((m) => m.id === selectedModeId);
        const nextIdx = (currentIdx + 1) % LISTENING_MODES.length;
        handleSelectMode(LISTENING_MODES[nextIdx].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIdx = LISTENING_MODES.findIndex((m) => m.id === selectedModeId);
        const prevIdx = (currentIdx - 1 + LISTENING_MODES.length) % LISTENING_MODES.length;
        handleSelectMode(LISTENING_MODES[prevIdx].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModeMenuOpen, selectedModeId]);

  // Normal, calm rotation: Change quote every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES.length);
        setIsFading(false);
      }, 500);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const handleNextQuote = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % RADIO_QUOTES.length);
      setIsFading(false);
    }, 300);
  };

  const handlePrevQuote = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev - 1 + RADIO_QUOTES.length) % RADIO_QUOTES.length);
      setIsFading(false);
    }, 300);
  };

  const currentQuote = RADIO_QUOTES[currentQuoteIndex];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-3 sm:px-4">
      {/* 4 System Telemetry Cards: 2x2 grid on mobile (<768px), 4-column row on md+ (>=768px) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
        
        {/* ================= 1. INTERACTIVE LISTENING MODE CARD ================= */}
        <div className="relative">
          <button
            ref={modeButtonRef}
            onClick={() => setIsModeMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isModeMenuOpen}
            aria-label={`Listening Mode: ${selectedMode.title}. Press to change mode.`}
            className="w-full h-full min-h-[86px] sm:min-h-[82px] bg-[#141414]/90 hover:bg-[#1A1A22] active:translate-y-0.5 backdrop-blur-xs border border-[#222] hover:border-[#38384C] rounded-xl sm:rounded-lg p-3 sm:p-3.5 text-center transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none flex flex-col justify-between select-none"
            style={{
              borderColor: isModeMenuOpen ? activeTheme.accentColor : undefined,
              boxShadow: isModeMenuOpen ? `0 0 12px ${activeTheme.glowColor}30` : undefined,
            }}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono-custom text-[#888] uppercase tracking-wider mb-0.5 sm:mb-1">
              <ModeIcon className="w-3.5 h-3.5 shrink-0 transition-colors" style={{ color: activeTheme.accentColor }} />
              <span className="group-hover:text-[#CCC] transition-colors font-medium truncate">MODE</span>
              <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isModeMenuOpen ? 'rotate-180 text-white' : 'text-[#777]'}`} />
            </div>
            
            <p className="text-xs sm:text-sm font-bold font-mono-custom text-[#E4E3E0] tracking-tight truncate flex items-center justify-center gap-1">
              <span>{selectedMode.title}</span>
            </p>

            {/* Subtle Mode Indicator Accent Underline */}
            <div className="mt-0.5 sm:mt-1 flex items-center justify-center gap-1 sm:gap-1.5">
              <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: activeTheme.accentColor }}
              />
              <span className="text-[8.5px] sm:text-[9px] font-mono-custom text-[#888] tracking-widest uppercase truncate">
                {selectedMode.indicator}
              </span>
            </div>
          </button>

          {/* Compact Elegant Popover Selector Menu */}
          {isModeMenuOpen && (
            <div
              ref={modeMenuRef}
              role="menu"
              aria-label="Select Listening Mode"
              className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-2.5rem)] bg-[#0C0C14]/95 backdrop-blur-xl border border-[#2B2B3E] shadow-2xl rounded-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                borderColor: `${activeTheme.accentColor}50`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 15px ${activeTheme.glowColor}25`,
              }}
            >
              <div className="px-2.5 py-1.5 border-b border-[#202030] mb-1 flex items-center justify-between">
                <span className="text-[9px] font-mono-custom uppercase tracking-widest text-[#888]">
                  SELECT LISTENING MODE
                </span>
                <span className="text-[8px] font-mono-custom text-[#666]">ESC TO CLOSE</span>
              </div>

              <div className="space-y-0.5">
                {LISTENING_MODES.map((mode) => {
                  const ItemIcon = mode.icon;
                  const isCurrent = mode.id === selectedModeId;
                  return (
                    <button
                      key={mode.id}
                      role="menuitem"
                      onClick={() => handleSelectMode(mode.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer font-mono-custom text-xs group ${
                        isCurrent
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-[#BBB] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon
                          className="w-4 h-4 shrink-0"
                          style={{ color: isCurrent ? activeTheme.accentColor : '#888' }}
                        />
                        <div className="truncate">
                          <div className="text-xs leading-tight flex items-center gap-1">
                            <span>{mode.title}</span>
                          </div>
                          <div className="text-[9px] text-[#777] leading-tight mt-0.5">
                            {mode.sublabel}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <Check className="w-4 h-4 shrink-0" style={{ color: activeTheme.accentColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. FREQUENCY CARD ================= */}
        <div className="bg-[#141414]/90 backdrop-blur-xs border border-[#222] rounded-xl sm:rounded-lg p-3 sm:p-3.5 text-center min-h-[86px] sm:min-h-[82px] flex flex-col justify-between select-none">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono-custom text-[#888] uppercase tracking-wider mb-0.5 sm:mb-1">
            <Radio className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.accentColor }} />
            <span className="truncate">FREQUENCY</span>
          </div>
          <p className="font-bold font-mono-custom font-lcd-custom text-base sm:text-lg tracking-wider" style={{ color: activeTheme.accentColor }}>
            98.6 MHz FM
          </p>
          <div className="text-[8.5px] sm:text-[9px] font-mono-custom text-[#666] tracking-widest uppercase">
            STEREO ANALOG
          </div>
        </div>

        {/* ================= 3. ONLINE LISTENERS / LIVE TRANSMISSION CARD ================= */}
        <div className="bg-[#141414]/90 backdrop-blur-xs border border-[#222] rounded-xl sm:rounded-lg p-3 sm:p-3.5 text-center min-h-[86px] sm:min-h-[82px] flex flex-col justify-between select-none">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono-custom text-[#888] uppercase tracking-wider mb-0.5 sm:mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">LISTENERS</span>
          </div>
          <p className="font-bold font-mono-custom text-emerald-400 font-lcd-custom text-base sm:text-lg tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{onlineListeners.toLocaleString()} LIVE</span>
          </p>
          <div className="text-[8.5px] sm:text-[9px] font-mono-custom text-[#666] tracking-widest uppercase">
            TRANSMISSION 24/7
          </div>
        </div>

        {/* ================= 4. BROADCAST TIME CARD (REAL LIVE CLOCK) ================= */}
        <div className="bg-[#141414]/90 backdrop-blur-xs border border-[#222] rounded-xl sm:rounded-lg p-3 sm:p-3.5 text-center min-h-[86px] sm:min-h-[82px] flex flex-col justify-between select-none">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono-custom text-[#888] uppercase tracking-wider mb-0.5 sm:mb-1">
            <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.accentColor }} />
            <span className="truncate">BROADCAST TIME</span>
          </div>
          <p className="font-bold font-mono-custom font-lcd-custom text-base sm:text-lg tracking-wider" style={{ color: activeTheme.accentColor }}>
            {liveTime.time12 || 'LIVE'}
          </p>
          <div className="text-[8.5px] sm:text-[9px] font-mono-custom text-[#666] tracking-widest uppercase">
            LOCAL SYSTEM TIME
          </div>
        </div>
      </div>

      {/* Two-Column Aesthetic Section: Polaroid Memory Card + Hotkeys Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* Left: Handwritten / Faded Late-Night Memory Log with Slow Crossfade */}
        <div className="md:col-span-7 bg-[#141414]/90 backdrop-blur-xs border border-[#222] rounded-lg p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group">
          
          {/* Subtle Ambient watermark */}
          <Quote className="absolute -bottom-4 -right-4 w-28 h-28 text-white/[0.02] pointer-events-none" />

          <div>
            {/* Top Log Bar */}
            <div className="flex justify-between items-center text-xs font-mono-custom text-[#777] border-b border-[#222] pb-2.5 mb-3.5">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: activeTheme.accentColor }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.accentColor }} />
                {currentQuote.noteNumber}
              </span>
              
              {/* Quote navigation controls */}
              <div className="flex items-center gap-2.5">
                <span className="text-[#666] font-mono-custom text-[11px]">
                  {currentQuoteIndex + 1} / {RADIO_QUOTES.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevQuote}
                    title="Previous Quote"
                    className="p-1.5 rounded bg-[#1C1C24] hover:bg-[#282834] text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextQuote}
                    title="Next Quote"
                    className="p-1.5 rounded bg-[#1C1C24] hover:bg-[#282834] text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Smooth Quote Text */}
            <div className={`transition-opacity duration-300 min-h-[105px] flex flex-col justify-center ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-base sm:text-lg font-serif-custom text-[#EDE8DF] leading-relaxed italic mb-2.5">
                “{currentQuote.quote}”
              </p>
              <p className="text-xs font-sans text-[#888] italic">
                — {currentQuote.context}
              </p>
            </div>
          </div>

          {/* Footer Note Meta */}
          <div className="flex items-center justify-between text-xs font-mono-custom text-[#777] pt-2.5 mt-4 border-t border-[#222]">
            <span>FREQUENCY: 98.6 FM</span>
            <span className="uppercase font-semibold tracking-wider" style={{ color: activeTheme.accentColor }}>
              {currentQuote.moodTag}
            </span>
          </div>
        </div>

        {/* Right: Retro Cyber Terminal Hotkeys Card */}
        <div className="md:col-span-5 bg-[#0D0D0D]/90 backdrop-blur-xs border border-[#222] rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-custom text-[#777] border-b border-[#222] pb-2.5 mb-3">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: activeTheme.accentColor }}>
                <Terminal className="w-3.5 h-3.5" />
                KEYBOARD SHORTCUTS
              </span>
              <span className="text-[#555] text-[10px]">ANALOG V2.6</span>
            </div>

            <div className="space-y-2 text-xs font-mono-custom">
              {/* Play / Pause */}
              <div 
                onClick={onSpaceHintClick}
                className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#262626] cursor-pointer hover:border-[#444] transition-colors group"
              >
                <span className="text-[#CCC] group-hover:text-white transition-colors">PLAY / PAUSE</span>
                <kbd className="px-2 py-0.5 bg-[#1F1F1F] text-[#AAA] rounded text-[10px] border border-[#333] group-hover:border-[#555]">
                  SPACEBAR
                </kbd>
              </div>

              {/* Prev / Next Track */}
              <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#262626]">
                <span className="text-[#CCC]">REWIND / FORWARD</span>
                <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] text-[#999] rounded text-[10px] border border-[#333]">←</kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] text-[#999] rounded text-[10px] border border-[#333]">→</kbd>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#262626]">
                <span className="text-[#CCC]">VOLUME UP / DOWN</span>
                <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] text-[#999] rounded text-[10px] border border-[#333]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] text-[#999] rounded text-[10px] border border-[#333]">↓</kbd>
                </div>
              </div>

              {/* Mute */}
              <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#262626]">
                <span className="text-[#CCC]">MUTE / UNMUTE</span>
                <kbd className="px-2 py-0.5 bg-[#1F1F1F] text-[#999] rounded text-[10px] border border-[#333]">M</kbd>
              </div>

              {/* Secret Admin Modal */}
              <div className="flex items-center justify-between p-1.5 rounded bg-[#111116] border border-[#22222E] text-[10.5px]">
                <span className="text-[#888]">PLAYLIST MANAGER</span>
                <kbd className="px-1.5 py-0.5 bg-[#1A1A22] text-[#777] rounded text-[9.5px] border border-[#2E2E3E]">
                  ALT + A
                </kbd>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono-custom text-[#555] pt-3 text-right">
            LIVE TRANSMISSION • NO ADS
          </div>
        </div>

      </div>
    </div>
  );
};
