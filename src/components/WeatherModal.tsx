import React from 'react';
import { X, CloudRain, Sun, Moon, Zap, Cloud, Compass, Check, Sparkles } from 'lucide-react';
import { WeatherToneData, WEATHER_PRESETS } from '../services/weatherService';
import { VibeTheme } from '../types';
import { ambientAudio } from '../services/ambientAudio';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeather: WeatherToneData;
  onSelectPreset: (preset: WeatherToneData) => void;
  isAutoSync: boolean;
  onToggleAutoSync: () => void;
  activeTheme: VibeTheme;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  currentWeather,
  onSelectPreset,
  isAutoSync,
  onToggleAutoSync,
  activeTheme,
}) => {
  if (!isOpen) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'heavy_storm':
        return <Zap className="w-5 h-5 text-indigo-400" />;
      case 'rainy_drizzle':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'sunset_warmth':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'foggy_overcast':
        return <Cloud className="w-5 h-5 text-slate-300" />;
      case 'clear_night':
      default:
        return <Moon className="w-5 h-5 text-cyan-300" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#0F0F16]/90 backdrop-blur-2xl border border-[#262638] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 25px ${activeTheme.glowColor}`,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#202030] flex items-center justify-between bg-[#14141E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              {getWeatherIcon(currentWeather.condition)}
            </div>
            <div>
              <h3 className="font-display-custom text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
                Atmospheric Weather <span className="text-[9px] px-1.5 py-0.5 rounded font-mono-custom" style={{ backgroundColor: `${activeTheme.accentColor}25`, color: activeTheme.accentColor }}>LIVE TONE</span>
              </h3>
              <p className="text-[10px] text-white/50 font-mono-custom">
                Adapts background tone and rain intensity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Weather Banner */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div 
            className="p-4 rounded-xl border relative overflow-hidden"
            style={{
              backgroundColor: `${activeTheme.accentColor}12`,
              borderColor: `${activeTheme.accentColor}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono-custom uppercase tracking-wider text-white/60">
                  <Compass className="w-3 h-3" />
                  <span>{currentWeather.cityName}</span>
                </div>
                <h4 className="text-lg font-bold text-white font-sans mt-0.5">
                  {currentWeather.conditionLabel}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono-custom text-white">
                  {currentWeather.temperatureC}°C
                </span>
                <span className="block text-[10px] font-mono-custom text-white/50">
                  Rain: {Math.round(currentWeather.rainIntensity * 100)}%
                </span>
              </div>
            </div>

            {/* Auto Sync Toggle */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono-custom text-white/70">
                Time-of-day Auto Sync
              </span>
              <button
                onClick={() => {
                  ambientAudio.playTunerClick();
                  onToggleAutoSync();
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono-custom uppercase tracking-wider transition-all cursor-pointer ${
                  isAutoSync
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                    : 'bg-white/10 text-white/50 hover:text-white'
                }`}
              >
                {isAutoSync ? '● Auto Enabled' : '○ Manual'}
              </button>
            </div>
          </div>

          {/* Weather Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono-custom uppercase tracking-wider text-white/40 block">
              Simulated Weather Moods & Locations
            </span>

            <div className="grid grid-cols-1 gap-2">
              {WEATHER_PRESETS.map((preset, index) => {
                const isSelected = currentWeather.condition === preset.condition;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      ambientAudio.playTunerClick();
                      onSelectPreset(preset);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/40 shadow-md'
                        : 'bg-[#12121A] border-[#222230] hover:border-white/20 hover:bg-[#161622]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                        {getWeatherIcon(preset.condition)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">
                          {preset.conditionLabel}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono-custom">
                          {preset.cityName} • {preset.temperatureC}°C • Rain: {Math.round(preset.rainIntensity * 100)}%
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                        style={{ backgroundColor: activeTheme.accentColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1C1C28] bg-[#0B0B10] flex justify-between items-center text-[10px] font-mono-custom text-white/40">
          <span>ATMOSPHERIC TONE ENGINE</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
