import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  Radio, 
  Clock, 
  Disc3, 
  Sparkles, 
  BarChart2, 
  Share2, 
  Check, 
  Music, 
  Moon, 
  CloudRain, 
  Activity,
  Award,
  ListMusic
} from 'lucide-react';
import { JournalEntry, VibeTheme, SessionGenreStat } from '../types';
import { ambientAudio } from '../services/ambientAudio';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  signalsCaughtCount: number;
  sessionFormattedTime: string;
  totalSessionSeconds: number;
  journal: JournalEntry[];
  activeTheme: VibeTheme;
  rainAmbienceActive?: boolean;
  tapeHissActive?: boolean;
  nightDriveActive?: boolean;
  onSelectTrackIndex?: (index: number) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  signalsCaughtCount,
  sessionFormattedTime,
  totalSessionSeconds,
  journal,
  activeTheme,
  rainAmbienceActive = false,
  tapeHissActive = false,
  nightDriveActive = false,
  onSelectTrackIndex,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        ambientAudio.playTunerClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate average listen time per track/signal
  const avgDurationPerSignal = useMemo(() => {
    if (signalsCaughtCount <= 0 || totalSessionSeconds <= 0) return '0m 00s';
    const avgSec = Math.round(totalSessionSeconds / Math.max(1, signalsCaughtCount));
    const mins = Math.floor(avgSec / 60);
    const secs = avgSec % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }, [signalsCaughtCount, totalSessionSeconds]);

  // Aggregate top-played genres dynamically from current session journal & active theme
  const topGenreStats: SessionGenreStat[] = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    
    // Seed with current theme if journal is short
    if (activeTheme.genreTag) {
      genreCounts[activeTheme.genreTag] = (genreCounts[activeTheme.genreTag] || 0) + 1;
    }

    journal.forEach((entry) => {
      const tag = entry.genreTag || activeTheme.genreTag || 'Lo-Fi Chill';
      genreCounts[tag] = (genreCounts[tag] || 0) + 1;
    });

    const totalCount = Object.values(genreCounts).reduce((a, b) => a + b, 0);

    const genreColorMap: Record<string, string> = {
      'Lo-Fi': '#06B6D4',
      'Lo-Fi Chill': '#06B6D4',
      'Synthwave': '#F43F5E',
      'Night Drive': '#8B5CF6',
      'Cyberpunk': '#EC4899',
      'Ambient': '#38BDF8',
      'Rain': '#0284C7',
      'Jazz Hop': '#F59E0B',
      'Chillhop': '#10B981',
      'Tokyo Drift': '#E11D48',
      'Coffee Break': '#D97706',
    };

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / Math.max(1, totalCount)) * 100),
        accentColor: genreColorMap[genre] || activeTheme.accentColor,
      }))
      .sort((a, b) => b.count - a.count);
  }, [journal, activeTheme.genreTag, activeTheme.accentColor]);

  const handleShareSummary = async () => {
    ambientAudio.playSignalLockedChime();
    const topGenre = topGenreStats[0]?.genre || activeTheme.genreTag || 'Lo-Fi Beats';
    const shareText = `📻 MIXED SIGNALS — 98.6 FM SESSION TELEMETRY\n⏱️ Tuned In: ${sessionFormattedTime}\n🛰️ Signals Caught: ${signalsCaughtCount}\n📊 Avg Track Session: ${avgDurationPerSignal}\n🎧 Top Vibe: ${topGenre} (${topGenreStats[0]?.percentage || 100}%)\n🌌 Atmosphere: ${rainAmbienceActive ? 'Rain Ambient' : 'Clear Sky'} • ${nightDriveActive ? 'Night Drive' : 'Standard Broadcast'}\n\nListen along at 98.6 FM!`;

    if (navigator.share && navigator.canShare && navigator.canShare({ title: '98.6 FM Session Summary', text: shareText })) {
      try {
        await navigator.share({
          title: '98.6 FM Session Summary',
          text: shareText,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // Dismissed share sheet
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click backdrop to close */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => {
          ambientAudio.playTunerClick();
          onClose();
        }} 
      />

      {/* Main Retro Chassis Modal Box */}
      <div 
        className="relative w-full max-w-xl bg-[#0C0C12] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        style={{
          boxShadow: `0 20px 60px rgba(0,0,0,0.85), 0 0 30px ${activeTheme.glowColor}`,
        }}
      >
        {/* Chassis Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#13131D] border-b border-[#242436]">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: activeTheme.accentColor }} 
            />
            <span className="text-xs font-mono-custom uppercase tracking-[0.2em] font-bold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
              TRANSMISSION SESSION TELEMETRY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span 
              className="text-[9px] font-mono-custom uppercase px-2 py-0.5 rounded border border-white/10 text-[#888899] hidden xs:inline"
            >
              CH-98.6 FM
            </span>
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onClose();
              }}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Telemetry HUD (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar text-left">
          
          {/* Top Metric Cards: 3-column telemetry grid */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5">
            {/* Card 1: Signals Caught */}
            <div className="bg-[#14141E] border border-[#262638] rounded-xl p-3 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono-custom text-[#777] uppercase tracking-wider">
                <span>SIGNALS CAUGHT</span>
                <Sparkles className="w-3 h-3" style={{ color: activeTheme.accentColor }} />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span 
                  className="font-digital-custom text-2xl sm:text-3xl font-bold tracking-tight tabular-nums"
                  style={{ color: activeTheme.accentColor }}
                >
                  {String(signalsCaughtCount).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono-custom text-[#888] uppercase">
                  {signalsCaughtCount === 1 ? 'TRACK' : 'TRACKS'}
                </span>
              </div>
              <span className="text-[8px] font-mono-custom text-[#555] uppercase">
                TUNED THIS SESSION
              </span>
            </div>

            {/* Card 2: Session Duration */}
            <div className="bg-[#14141E] border border-[#262638] rounded-xl p-3 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono-custom text-[#777] uppercase tracking-wider">
                <span>TOTAL LISTEN TIME</span>
                <Clock className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-digital-custom text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-white">
                  {sessionFormattedTime}
                </span>
              </div>
              <span className="text-[8px] font-mono-custom text-emerald-400/80 uppercase font-semibold">
                ● BROADCAST ONLINE
              </span>
            </div>

            {/* Card 3: Avg Duration Per Signal */}
            <div className="bg-[#14141E] border border-[#262638] rounded-xl p-3 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono-custom text-[#777] uppercase tracking-wider">
                <span>AVG. PER SIGNAL</span>
                <Activity className="w-3 h-3 text-amber-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-digital-custom text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-amber-300">
                  {avgDurationPerSignal}
                </span>
              </div>
              <span className="text-[8px] font-mono-custom text-[#555] uppercase">
                RETENTION RATE
              </span>
            </div>
          </div>

          {/* Section 2: Top-Played Genres & Frequency Breakdown */}
          <div className="bg-[#11111A] border border-[#202030] rounded-xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-[#1E1E2C] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono-custom font-bold uppercase tracking-wider text-white">
                <BarChart2 className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
                <span>TOP-PLAYED GENRES & FREQUENCIES</span>
              </div>
              <span className="text-[8.5px] font-mono-custom text-[#666] uppercase">
                SESSION BREAKDOWN
              </span>
            </div>

            <div className="space-y-2.5">
              {topGenreStats.map((item, idx) => (
                <div key={`${item.genre}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono-custom">
                    <span className="font-semibold text-white/90 flex items-center gap-1.5">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: item.accentColor }} 
                      />
                      {item.genre}
                    </span>
                    <span className="text-white/60 tabular-nums text-xs">
                      {item.count} {item.count === 1 ? 'play' : 'plays'} ({item.percentage}%)
                    </span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="h-1.5 w-full bg-[#1C1C28] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.accentColor,
                        boxShadow: `0 0 8px ${item.accentColor}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Recent Signals Caught (Session Journal History) */}
          <div className="bg-[#11111A] border border-[#202030] rounded-xl p-3.5 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-[#1E1E2C] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono-custom font-bold uppercase tracking-wider text-white">
                <ListMusic className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
                <span>TRANSMISSION TIMELINE ({journal.length} SIGNALS LOGGED)</span>
              </div>
              <span className="text-[8.5px] font-mono-custom text-[#666] uppercase">
                RECENT CATCHES
              </span>
            </div>

            {journal && journal.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {journal.map((entry, idx) => (
                  <div 
                    key={`${entry.id}-${entry.timestamp}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#161622] hover:bg-[#1C1C2C] border border-[#222234] transition-colors group text-xs font-mono-custom"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span 
                        className="text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded bg-black/40 shrink-0"
                        style={{ color: activeTheme.accentColor }}
                      >
                        {entry.time}
                      </span>
                      <span className="truncate text-white/90 font-medium">
                        {entry.title}
                      </span>
                    </div>

                    <span 
                      className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-white/10 text-white/60 shrink-0"
                    >
                      {entry.genreTag || activeTheme.genreTag}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs font-mono-custom text-[#666] italic">
                No signals logged yet in this session. Tune in to catch broadcasts!
              </div>
            )}
          </div>

          {/* Section 4: Atmosphere Environment Telemetry */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono-custom">
            <div className="p-2 rounded-xl bg-[#14141E] border border-[#222234] flex flex-col items-center gap-1">
              <CloudRain className={`w-3.5 h-3.5 ${rainAmbienceActive ? 'text-sky-400' : 'text-white/30'}`} />
              <span className="text-white/50 text-[8px] uppercase">RAIN ENGINE</span>
              <span className={`font-bold ${rainAmbienceActive ? 'text-sky-300' : 'text-white/40'}`}>
                {rainAmbienceActive ? 'ACTIVE' : 'MUTED'}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#14141E] border border-[#222234] flex flex-col items-center gap-1">
              <Disc3 className={`w-3.5 h-3.5 ${tapeHissActive ? 'text-emerald-400' : 'text-white/30'}`} />
              <span className="text-white/50 text-[8px] uppercase">TAPE WARMTH</span>
              <span className={`font-bold ${tapeHissActive ? 'text-emerald-300' : 'text-white/40'}`}>
                {tapeHissActive ? 'ENGAGED' : 'OFF'}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#14141E] border border-[#222234] flex flex-col items-center gap-1">
              <Moon className={`w-3.5 h-3.5 ${nightDriveActive ? 'text-violet-400' : 'text-white/30'}`} />
              <span className="text-white/50 text-[8px] uppercase">NIGHT DRIVE</span>
              <span className={`font-bold ${nightDriveActive ? 'text-violet-300' : 'text-white/40'}`}>
                {nightDriveActive ? 'CRUISING' : 'STANDBY'}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 bg-[#11111A] border-t border-[#222232] flex items-center justify-between gap-2">
          <button
            onClick={handleShareSummary}
            className={`px-4 py-2 rounded-xl text-xs font-mono-custom font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              copied
                ? 'bg-white text-black border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20 active:scale-95'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'SUMMARY COPIED!' : 'COPY SESSION RECAP'}</span>
          </button>

          <button
            onClick={() => {
              ambientAudio.playTunerClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-mono-custom font-bold bg-[#1C1C2A] hover:bg-[#252538] text-white/80 hover:text-white border border-[#303046] transition-all cursor-pointer"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
