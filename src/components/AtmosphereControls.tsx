import React, { useState } from 'react';
import { 
  CloudRain, 
  Disc3, 
  Tv, 
  Moon, 
  Share2, 
  Check, 
  Image as ImageIcon, 
  CloudSun, 
  Music2, 
  Activity, 
  Volume2, 
  VolumeX, 
  Zap, 
  Sliders, 
  Droplets,
  CloudDrizzle,
  CloudLightning
} from 'lucide-react';
import { AtmosphereSettings, TrackInfo, VibeTheme, RainIntensityType } from '../types';
import { ambientAudio } from '../services/ambientAudio';
import { WeatherToneData } from '../services/weatherService';

interface AtmosphereControlsProps {
  settings: AtmosphereSettings;
  activeTheme: VibeTheme;
  onToggleScanlines: () => void;
  onToggleTapeHiss: () => void;
  onToggleRain: () => void;
  onToggleNightDrive: () => void;
  onChangeRainVolume?: (volume: number) => void;
  onChangeRainIntensity?: (level: RainIntensityType) => void;
  onShuffleWallpaper?: () => void;
  onOpenWeatherModal?: () => void;
  onOpenSpotifyModal?: () => void;
  weatherTone?: WeatherToneData | null;
  currentTrack: TrackInfo;
  isVisualizerMode?: boolean;
  onToggleVisualizerMode?: () => void;
}

export const AtmosphereControls: React.FC<AtmosphereControlsProps> = ({
  settings,
  activeTheme,
  onToggleScanlines,
  onToggleTapeHiss,
  onToggleRain,
  onToggleNightDrive,
  onChangeRainVolume,
  onChangeRainIntensity,
  onShuffleWallpaper,
  onOpenWeatherModal,
  onOpenSpotifyModal,
  weatherTone,
  currentTrack,
  isVisualizerMode,
  onToggleVisualizerMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRainMixer, setShowRainMixer] = useState(false);

  const handleShare = async () => {
    ambientAudio.playSignalLockedChime();
    const shareTitle = 'MIXED SIGNALS — 98.6 FM';
    const shareText = `MIXED SIGNALS — 98.6 FM 📻\n"No genre. No explanation. Just vibes."\nNow Playing: ${currentTrack.title || 'Curated Stream'}`;
    const shareUrl = window.location.href;

    if (navigator.share && navigator.canShare && navigator.canShare({ title: shareTitle, text: shareText, url: shareUrl })) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // Fallback to clipboard if user dismissed or cancelled share sheet
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Ignore
      }
    }
  };

  const handleRainIntensityChange = (level: RainIntensityType) => {
    ambientAudio.resumeOnInteraction();
    ambientAudio.playTunerClick();
    if (onChangeRainIntensity) {
      onChangeRainIntensity(level);
    } else {
      ambientAudio.setRainIntensity(level);
    }
    // If storm selected, give instant thunder preview
    if (level === 'storm') {
      setTimeout(() => {
        ambientAudio.playThunderclap(1.1);
      }, 150);
    }
  };

  const handleRainVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    ambientAudio.resumeOnInteraction();
    if (onChangeRainVolume) {
      onChangeRainVolume(val);
    } else {
      ambientAudio.setRainVolume(val);
    }
  };

  const rainVolumePercent = Math.round((settings.rainVolume ?? 0.45) * 100);
  const currentIntensity = settings.rainIntensityLevel || 'pour';

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-2 flex flex-col items-center gap-2">
      {/* Consolidated Compact Floating Atmosphere Bar */}
      <div 
        className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0D0D15]/80 backdrop-blur-lg border border-[#222234]/80 shadow-xl w-full max-w-3xl"
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 15px ${activeTheme.glowColor}`,
        }}
      >
        {/* Left Section: Visual & Mode Toggles */}
        <div className="flex items-center flex-wrap gap-1">
          {/* D3 Spectrum Visualizer Mode Toggle */}
          {onToggleVisualizerMode && (
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onToggleVisualizerMode();
              }}
              className={`min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1.5 transition-all cursor-pointer border ${
                isVisualizerMode
                  ? 'bg-white/15 text-white border-white/40 shadow-sm font-bold'
                  : 'bg-black/30 hover:bg-white/10 text-white/70 border-white/10'
              }`}
              title="Toggle D3 Frequency Visualizer / Retro Boombox View"
            >
              <Activity className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
              <span className="inline">{isVisualizerMode ? 'BOOMBOX' : 'SPECTRUM'}</span>
            </button>
          )}

          {/* Random Scene Wallpaper Button */}
          {onShuffleWallpaper && (
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onShuffleWallpaper();
              }}
              className="min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1.5 transition-all cursor-pointer bg-black/30 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/20 active:scale-95"
              title="Switch Random Aesthetic Wallpaper"
            >
              <ImageIcon className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
              <span className="inline">SCENE</span>
            </button>
          )}

          {/* Live Weather Pill */}
          {onOpenWeatherModal && (
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onOpenWeatherModal();
              }}
              className="min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1.5 transition-all cursor-pointer bg-black/30 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/20"
              title="Atmospheric Weather Controls"
            >
              <CloudSun className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xs:inline">
                {weatherTone ? `${weatherTone.temperatureC}°` : 'WEATHER'}
              </span>
            </button>
          )}

          {/* Spotify Sync Pill */}
          {onOpenSpotifyModal && (
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                onOpenSpotifyModal();
              }}
              className="min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1.5 transition-all cursor-pointer bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954]"
              title="Spotify Playlist Sync"
            >
              <Music2 className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">SPOTIFY</span>
            </button>
          )}
        </div>

        {/* Right Section: Compact Audio/FX Switches */}
        <div className="flex items-center flex-wrap gap-1">
          {/* Rain Toggle & Mixer Quick Expander */}
          <div className="flex items-center">
            <button
              onClick={() => {
                ambientAudio.resumeOnInteraction();
                ambientAudio.playTunerClick();
                onToggleRain();
                if (!settings.rainAmbience) {
                  setShowRainMixer(true);
                }
              }}
              className={`min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-l-xl text-[11px] font-mono-custom flex items-center gap-1.5 transition-all cursor-pointer border ${
                settings.rainAmbience
                  ? 'border-sky-500/50 bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)] font-bold'
                  : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
              }`}
              title="Toggle Rain Ambience"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span className="inline">RAIN</span>
              {settings.rainAmbience && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-400/20 text-sky-200 uppercase font-mono hidden xs:inline">
                  {currentIntensity}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                ambientAudio.playTunerClick();
                setShowRainMixer(!showRainMixer);
              }}
              className={`min-h-[40px] sm:min-h-0 px-2 py-1.5 rounded-r-xl text-[11px] border-y border-r transition-all cursor-pointer ${
                settings.rainAmbience
                  ? 'border-sky-500/50 bg-sky-500/30 text-sky-200 hover:bg-sky-500/40'
                  : 'border-white/10 bg-black/30 text-white/40 hover:text-white'
              } ${showRainMixer ? 'bg-sky-500/40 text-white' : ''}`}
              title="Open Rain Mixer & Loudness Controls"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tape Warmth */}
          <button
            onClick={() => {
              ambientAudio.resumeOnInteraction();
              ambientAudio.playTunerClick();
              onToggleTapeHiss();
            }}
            className={`min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1 transition-all cursor-pointer border ${
              settings.tapeHiss
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold'
                : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
            }`}
            title="Analog Tape Warmth"
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="inline">TAPE</span>
          </button>

          {/* CRT Scan */}
          <button
            onClick={() => {
              ambientAudio.playTunerClick();
              onToggleScanlines();
            }}
            className={`min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1 transition-all cursor-pointer border ${
              settings.scanlines
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-sm'
                : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
            }`}
            title="CRT Scanlines Texture"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="inline">CRT</span>
          </button>

          {/* Night Drive Mode */}
          <button
            onClick={() => {
              ambientAudio.playTunerClick();
              onToggleNightDrive();
            }}
            className={`min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1 transition-all cursor-pointer border ${
              settings.nightDriveMode
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-sm'
                : 'border-white/10 bg-black/20 text-white/40 hover:text-white'
            }`}
            title="Night Drive Immersion"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="inline">DARK</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className={`min-h-[40px] sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-mono-custom flex items-center gap-1 transition-all cursor-pointer border ${
              copied
                ? 'bg-white text-black font-bold border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Share Signal Link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="inline">{copied ? 'COPIED' : 'SHARE'}</span>
          </button>
        </div>
      </div>

      {/* 🌧️ Dedicated Rain Ambience Tuning Deck & Volume Slider */}
      {showRainMixer && (
        <div 
          className="w-full max-w-3xl p-3 sm:p-4 rounded-2xl bg-[#0B0B12]/90 backdrop-blur-xl border border-sky-500/30 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 animate-fadeIn"
          style={{
            boxShadow: `0 12px 35px rgba(0,0,0,0.65), 0 0 20px rgba(56, 189, 248, 0.25)`,
          }}
        >
          {/* Intensity Selection Buttons */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-mono-custom uppercase tracking-wider text-sky-300 font-bold">
                RAIN INTENSITY // DENSITY & AUDIO ENGINE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Drizzle */}
              <button
                onClick={() => handleRainIntensityChange('drizzle')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-custom flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  currentIntensity === 'drizzle'
                    ? 'bg-sky-500/25 border-sky-400 text-white font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <CloudDrizzle className="w-3.5 h-3.5 text-sky-300" />
                <span>DRIZZLE</span>
              </button>

              {/* Pour */}
              <button
                onClick={() => handleRainIntensityChange('pour')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-custom flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  currentIntensity === 'pour'
                    ? 'bg-sky-500/25 border-sky-400 text-white font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-sky-300" />
                <span>POUR</span>
              </button>

              {/* Storm */}
              <button
                onClick={() => handleRainIntensityChange('storm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-custom flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  currentIntensity === 'storm'
                    ? 'bg-indigo-600/35 border-indigo-400 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <CloudLightning className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>STORM ⚡</span>
              </button>
            </div>
          </div>

          {/* Rain Ambience Volume Slider */}
          <div className="flex flex-col gap-1.5 sm:min-w-[240px] border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-custom uppercase tracking-wider text-white/60 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-sky-400" />
                RAIN AMBIENCE LOUDNESS
              </span>
              <span className="text-xs font-mono-custom font-bold text-sky-300">
                {rainVolumePercent}%
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  ambientAudio.resumeOnInteraction();
                  if (onChangeRainVolume) {
                    onChangeRainVolume(settings.rainVolume > 0 ? 0 : 0.45);
                  }
                }}
                className="text-white/40 hover:text-white cursor-pointer transition-colors"
                title={settings.rainVolume === 0 ? "Unmute Rain" : "Mute Rain"}
              >
                {settings.rainVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-sky-400" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.rainVolume ?? 0.45}
                onChange={handleRainVolumeSlider}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
