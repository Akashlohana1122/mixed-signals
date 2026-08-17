import React, { useState, useEffect } from 'react';
import { ListMusic, MessageSquareHeart, BookOpen, Clock3, Play, Sparkles, RotateCcw, BarChart2 } from 'lucide-react';
import { UpNextTrack, JournalEntry, VibeTheme, TrackInfo } from '../types';
import { ambientAudio } from '../services/ambientAudio';

interface CentralTransmissionDeckProps {
  upNextTracks: UpNextTrack[];
  journal: JournalEntry[];
  sessionFormattedTime: string;
  signalsCaughtCount: number;
  activeTheme: VibeTheme;
  currentTrack: TrackInfo;
  onSelectTrackIndex?: (index: number) => void;
  onResetSession?: () => void;
  onOpenSessionSummary?: () => void;
}

const NOSTALGIC_NOTES = [
  "Maybe this one found you.",
  "Don't skip this one.",
  "Some songs arrive right when you need them.",
  "You weren't looking for this song, but here it is.",
  "Let this one play all the way through.",
  "For some reason, this feels like an old memory.",
  "A little late. Still worth hearing.",
  "Late night thoughts hit differently with this playing.",
  "Window down, midnight breeze, volume turned up.",
  "Some frequencies linger long after the sound fades.",
  "The kind of song you want to hear alone in the dark.",
  "Soft neon reflections on a quiet rain-soaked street.",
  "Turn the world down, let the soundscape take over.",
  "Lost in tape warmth and distant memories.",
  "A soundtrack for thoughts you can't put into words.",
  "A temporary pause from the noise of the world.",
  "This frequency was broadcasted just for tonight.",
  "Somewhere out there, someone is listening to the same signal.",
  "Headphones on. Reality on standby.",
  "Warm analog crackle, cold midnight air.",
  "You're right where you're supposed to be.",
  "Echoes from a time you still remember fondly.",
  "Every late night has its own quiet frequency.",
  "Let the static wash away the day.",
  "Static in the wires, clarity in the sound.",
  "Frequencies drifting across the late night air.",
  "A quiet broadcast for an empty room.",
  "Turn the dial gently. Every frequency has a story.",
];

export const CentralTransmissionDeck: React.FC<CentralTransmissionDeckProps> = ({
  upNextTracks,
  journal,
  sessionFormattedTime,
  signalsCaughtCount,
  activeTheme,
  currentTrack,
  onSelectTrackIndex,
  onResetSession,
  onOpenSessionSummary,
}) => {
  const [noteIndex, setNoteIndex] = useState(0);
  const [isNoteFading, setIsNoteFading] = useState(false);

  // Slow relaxed rotation: changes smoothly every 65 seconds (max ~2 notes per song duration)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNoteFading(true);
      setTimeout(() => {
        setNoteIndex((prev) => (prev + 1) % NOSTALGIC_NOTES.length);
        setIsNoteFading(false);
      }, 500);
    }, 65000);

    return () => clearInterval(interval);
  }, []);

  // When track title/id changes, select a new evocative thought for this song
  useEffect(() => {
    if (currentTrack.id) {
      setIsNoteFading(true);
      const timer = setTimeout(() => {
        const pseudoRandom = Math.abs(
          currentTrack.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + (currentTrack.index || 0)
        );
        setNoteIndex(pseudoRandom % NOSTALGIC_NOTES.length);
        setIsNoteFading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentTrack.id, currentTrack.index]);

  return (
    <div className="mt-3 pt-2.5 border-t border-[#222230] select-none">
      {/* Mini Technical Telemetry Subheader */}
      <div className="flex items-center justify-between px-1 mb-2 text-[8px] font-mono-custom uppercase tracking-[0.2em] text-[#666677]">
        <span className="flex items-center gap-1.5">
          <span 
            className="w-1 h-1 rounded-full animate-ping"
            style={{ backgroundColor: activeTheme.accentColor }} 
          />
          TRANSMISSION TELEMETRY & QUEUE
        </span>
        <span className="hidden sm:inline text-[#555]">
          CH-98.6 // LOW-LATENCY CACHE
        </span>
      </div>

      {/* 4-Column Responsive Information Grid - Balanced & Symmetrical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 text-left items-stretch">
        
        {/* ================= 1. UP NEXT ================= */}
        <div 
          className="bg-[#09090E]/85 backdrop-blur-md border border-[#20202C] hover:border-[#2E2E40] rounded-lg p-2.5 flex flex-col justify-between transition-all group shadow-inner h-full min-h-[108px]"
          style={{
            borderColor: currentTrack.isPlaying ? `${activeTheme.accentColor}25` : undefined,
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A26] pb-1 mb-1.5">
              <div className="flex items-center gap-1 text-[8.5px] font-mono-custom font-bold uppercase tracking-widest text-[#888899]">
                <ListMusic className="w-3 h-3" style={{ color: activeTheme.accentColor }} />
                <span>UP NEXT</span>
              </div>
              <span className="text-[7.5px] font-mono-custom text-[#555] uppercase">
                QUEUE
              </span>
            </div>

            {upNextTracks && upNextTracks.length > 0 ? (
              <div className="space-y-1">
                {upNextTracks.slice(0, 3).map((item, i) => (
                  <div
                    key={`${item.id}-${item.index}-${i}`}
                    onClick={() => onSelectTrackIndex?.(item.index)}
                    title={onSelectTrackIndex ? `Jump to track: ${item.title}` : item.title}
                    className={`flex items-center gap-1.5 text-[10px] font-mono-custom transition-all rounded px-1 py-0.5 ${
                      onSelectTrackIndex 
                        ? 'cursor-pointer hover:bg-white/5 hover:text-white text-[#CCC]' 
                        : 'text-[#BBB]'
                    }`}
                  >
                    <span 
                      className="text-[8.5px] font-bold tabular-nums shrink-0" 
                      style={{ color: activeTheme.accentColor }}
                    >
                      {String(item.index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate flex-1 font-medium leading-tight">
                      {item.title}
                    </span>
                    {onSelectTrackIndex && (
                      <Play className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 text-white shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-2 text-[9.5px] font-mono-custom text-[#777] italic">
                <span>Loop active at end of playlist</span>
              </div>
            )}
          </div>

          <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between text-[7.5px] font-mono-custom text-[#666]">
            <span>TOTAL: {currentTrack.totalTracks || 10} SIGNALS</span>
            <span style={{ color: activeTheme.accentColor }}>AUTO-ADVANCE</span>
          </div>
        </div>

        {/* ================= 2. NOW PLAYING NOTE ================= */}
        <div 
          className="bg-[#09090E]/85 backdrop-blur-md border border-[#20202C] hover:border-[#2E2E40] rounded-lg p-2.5 flex flex-col justify-between transition-all shadow-inner h-full min-h-[108px]"
          style={{
            borderColor: currentTrack.isPlaying ? `${activeTheme.accentColor}25` : undefined,
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A26] pb-1 mb-1.5">
              <div className="flex items-center gap-1 text-[8.5px] font-mono-custom font-bold uppercase tracking-widest text-[#888899]">
                <MessageSquareHeart className="w-3 h-3" style={{ color: activeTheme.accentColor }} />
                <span>NOW PLAYING NOTE</span>
              </div>
              <Sparkles className="w-2.5 h-2.5 text-white/30" />
            </div>

            <div className="py-1">
              <p 
                className={`text-[11px] font-serif italic text-[#E2DFD8] leading-snug transition-opacity duration-500 min-h-[38px] flex items-center ${
                  isNoteFading ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  textShadow: '0 0 10px rgba(0,0,0,0.8)',
                }}
              >
                “{NOSTALGIC_NOTES[noteIndex]}”
              </p>
            </div>
          </div>

          <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between text-[7.5px] font-mono-custom text-[#666]">
            <span className="uppercase">FREQUENCY MOOD</span>
            <span style={{ color: activeTheme.accentColor }} className="font-semibold uppercase">
              {activeTheme.genreTag}
            </span>
          </div>
        </div>

        {/* ================= 3. SIGNAL JOURNAL ================= */}
        <div 
          className="bg-[#09090E]/85 backdrop-blur-md border border-[#20202C] hover:border-[#2E2E40] rounded-lg p-2.5 flex flex-col justify-between transition-all shadow-inner h-full min-h-[108px]"
          style={{
            borderColor: currentTrack.isPlaying ? `${activeTheme.accentColor}25` : undefined,
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A26] pb-1 mb-1.5">
              <div className="flex items-center gap-1 text-[8.5px] font-mono-custom font-bold uppercase tracking-widest text-[#888899]">
                <BookOpen className="w-3 h-3" style={{ color: activeTheme.accentColor }} />
                <span>SIGNAL JOURNAL</span>
              </div>
              <span className="text-[7.5px] font-mono-custom text-[#555] uppercase">
                SESSION LOG
              </span>
            </div>

            {journal && journal.length > 0 ? (
              <div className="space-y-1 max-h-[58px] overflow-y-auto pr-0.5 custom-scrollbar">
                {journal.slice(0, 3).map((entry, idx) => (
                  <div 
                    key={`${entry.id}-${entry.timestamp}-${idx}`} 
                    className="flex flex-col text-[9.5px] font-mono-custom leading-tight border-l-2 pl-1.5 py-0.5 transition-colors"
                    style={{
                      borderLeftColor: idx === 0 ? activeTheme.accentColor : '#2A2A38',
                    }}
                  >
                    <span className="text-[8px] text-[#777] font-semibold tabular-nums">
                      {entry.time}
                    </span>
                    <span className={`truncate ${idx === 0 ? 'text-white font-medium' : 'text-[#999]'}`}>
                      {entry.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-2 text-[9.5px] font-mono-custom text-[#777] italic">
                <span>Awaiting first transmission...</span>
              </div>
            )}
          </div>

          <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between text-[7.5px] font-mono-custom text-[#666]">
            <span>CURRENT VISIT</span>
            <span style={{ color: activeTheme.accentColor }}>{journal.length} LOGGED</span>
          </div>
        </div>

        {/* ================= 4. LISTENING SESSION ================= */}
        <div 
          className="bg-[#09090E]/85 backdrop-blur-md border border-[#20202C] hover:border-[#2E2E40] rounded-lg p-2.5 flex flex-col justify-between transition-all shadow-inner h-full min-h-[108px]"
          style={{
            borderColor: currentTrack.isPlaying ? `${activeTheme.accentColor}25` : undefined,
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A26] pb-1 mb-1.5">
              <div className="flex items-center gap-1 text-[8.5px] font-mono-custom font-bold uppercase tracking-widest text-[#888899]">
                <Clock3 className="w-3 h-3" style={{ color: activeTheme.accentColor }} />
                <span>LISTENING SESSION</span>
              </div>
              <div className="flex items-center gap-1.5">
                {onResetSession && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetSession();
                    }}
                    title="Reset Session Timer (00:00:00)"
                    className="px-1 py-0.5 rounded bg-[#181824] hover:bg-[#252538] text-[#888] hover:text-white border border-[#303044] transition-all cursor-pointer text-[7.5px] font-mono-custom flex items-center gap-0.5 active:scale-95"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                )}
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: currentTrack.isPlaying ? activeTheme.accentColor : '#555',
                    boxShadow: currentTrack.isPlaying ? `0 0 6px ${activeTheme.accentColor}` : 'none',
                  }}
                />
              </div>
            </div>

            <div className="py-1">
              <div className="flex items-baseline gap-1">
                <span 
                  className="font-digital-custom text-lg sm:text-xl font-bold tracking-wider tabular-nums text-white"
                  style={{
                    textShadow: currentTrack.isPlaying ? `0 0 10px ${activeTheme.glowColor}` : undefined,
                  }}
                >
                  {sessionFormattedTime}
                </span>
                <span className="text-[8px] font-mono-custom text-[#777] uppercase">
                  ACTIVE
                </span>
              </div>

              {/* Secondary Stat: SIGNALS CAUGHT (Clickable for Session Summary Modal) */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ambientAudio.playTunerClick();
                    onOpenSessionSummary?.();
                  }}
                  title="Click to view full Session Telemetry, Top Genres & History"
                  className="flex items-center gap-1 text-[9.5px] font-mono-custom font-bold uppercase tracking-wider transition-all cursor-pointer group/signal hover:opacity-90 active:scale-95 text-left"
                  style={{ color: activeTheme.accentColor }}
                >
                  <span className="underline decoration-dotted underline-offset-2 group-hover/signal:decoration-solid">
                    {signalsCaughtCount} {signalsCaughtCount === 1 ? 'SIGNAL' : 'SIGNALS'} CAUGHT
                  </span>
                  <BarChart2 className="w-2.5 h-2.5 opacity-75 group-hover/signal:opacity-100 group-hover/signal:scale-110 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between text-[7.5px] font-mono-custom text-[#666]">
            <span>BROADCAST TIME</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
        </div>

      </div>
    </div>
  );
};
