import React, { useState, useEffect } from 'react';
import { X, Sparkles, Youtube, Check, RefreshCw, Layers, ShieldCheck, ListMusic, Lock, KeyRound, AlertCircle, Unlock, Music2, Eye, EyeOff } from 'lucide-react';
import { PLAYLIST_PRESETS, PlaylistPreset } from '../data/themesAndPresets';
import { StreamSourceConfig } from '../types';

interface AdminPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: StreamSourceConfig;
  onSaveConfig: (newConfig: StreamSourceConfig) => void;
}

const DEFAULT_PINS = ['0000', '9860', '1234'];
const CUSTOM_PIN_KEY = 'mixed_signals_custom_pin';

export const AdminPlaylistModal: React.FC<AdminPlaylistModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  // Always enforce PIN authentication when opened - never bypass directly
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  const [playlistInput, setPlaylistInput] = useState(currentConfig.playlistId);
  const [spotifyInput, setSpotifyInput] = useState(currentConfig.spotifyUrl || '');
  const [activePreset, setActivePreset] = useState(currentConfig.activePresetTitle || 'Mixed Signals Vol. 1');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [customListText, setCustomListText] = useState(
    currentConfig.customVideoIds?.join('\n') || ''
  );
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_url' | 'spotify' | 'custom_ids' | 'security'>('presets');
  const [newPin, setNewPin] = useState('');
  const [pinChangedMsg, setPinChangedMsg] = useState(false);

  // Every time the modal opens, reset authentication gate so PIN is strictly required
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setPinInput('');
      setPinError(false);
      setShowPinText(false);
      setPlaylistInput(currentConfig.playlistId);
      setSpotifyInput(currentConfig.spotifyUrl || '');
      setCustomListText(currentConfig.customVideoIds?.join('\n') || '');
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem(CUSTOM_PIN_KEY);
    const entered = pinInput.trim();

    // Check against custom set PIN (e.g. 0000) or valid default PINs
    const isValid = 
      (storedPin && entered === storedPin) || 
      DEFAULT_PINS.includes(entered);

    if (isValid) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLockOut = () => {
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPin.trim();
    if (cleaned.length >= 4) {
      try {
        localStorage.setItem(CUSTOM_PIN_KEY, cleaned);
      } catch {
        // Ignore
      }
      setPinChangedMsg(true);
      setTimeout(() => setPinChangedMsg(false), 2500);
      setNewPin('');
    }
  };

  // Helper to extract YouTube playlist ID from raw input or URL
  const extractPlaylistId = (input: string): string => {
    const clean = input.trim();
    if (!clean) return '';
    try {
      if (clean.includes('list=')) {
        const urlParams = new URLSearchParams(clean.split('?')[1] || clean);
        return urlParams.get('list') || clean;
      }
    } catch {
      // Fallback to raw string
    }
    return clean;
  };

  // Helper to parse Spotify links
  const extractSpotifyInfo = (input: string) => {
    const clean = input.trim();
    const match = clean.match(/(?:spotify\.com\/(playlist|album|track|artist)\/|spotify:(playlist|album|track|artist):)([a-zA-Z0-9]+)/);
    if (match) {
      const type = match[1] || match[2];
      const id = match[3];
      return { type, id, embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0` };
    }
    return null;
  };

  const handleApplyPreset = (preset: PlaylistPreset) => {
    setPlaylistInput(preset.playlistId);
    setActivePreset(preset.name);
    
    const newConfig: StreamSourceConfig = {
      type: 'playlist',
      playlistId: preset.playlistId,
      customVideoIds: [],
      activePresetTitle: preset.name,
    };

    onSaveConfig(newConfig);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleSaveSpotify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSpotify = spotifyInput.trim();
    if (!cleanSpotify) return;

    const spotifyInfo = extractSpotifyInfo(cleanSpotify);
    const newConfig: StreamSourceConfig = {
      type: 'spotify',
      playlistId: spotifyInfo ? spotifyInfo.id : 'spotify_stream',
      customVideoIds: [],
      spotifyUrl: cleanSpotify,
      activePresetTitle: `Spotify Broadcast (${spotifyInfo ? spotifyInfo.type.toUpperCase() : 'Playlist'})`,
    };

    onSaveConfig(newConfig);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractPlaylistId(playlistInput);
    
    if (!cleanId && activeTab === 'custom_url') return;

    let newConfig: StreamSourceConfig;

    if (activeTab === 'custom_ids') {
      const ids = customListText
        .split(/[\n,]+/)
        .map((s) => s.trim().replace(/^.*v=/, '').replace(/^.*youtu\.be\//, '').split('&')[0])
        .filter((s) => s.length >= 8);

      newConfig = {
        type: 'custom_list',
        playlistId: ids[0] || 'PLW1q_FRwhNUM',
        customVideoIds: ids,
        activePresetTitle: `Custom Track Mix (${ids.length} Tracks)`,
      };
    } else {
      newConfig = {
        type: 'playlist',
        playlistId: cleanId,
        customVideoIds: [],
        activePresetTitle: `Custom Playlist [${cleanId.slice(0, 8)}...]`,
      };
    }

    onSaveConfig(newConfig);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    const defaultConfig: StreamSourceConfig = {
      type: 'playlist',
      playlistId: 'PLW1q_FRwhNUM',
      customVideoIds: [],
      activePresetTitle: 'Mixed Signals Vol. 1 (Signature)',
    };
    setPlaylistInput('PLW1q_FRwhNUM');
    setActivePreset('Mixed Signals Vol. 1 (Signature)');
    onSaveConfig(defaultConfig);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#121216]/95 backdrop-blur-2xl border border-[#2A2A38] rounded-2xl shadow-2xl overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22222E] bg-[#17171E]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/20 border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono-custom tracking-wider flex items-center gap-2">
                SECRET ADMIN DECK
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#06B6D4]/20 text-[#06B6D4] font-normal uppercase">
                  PASSWORD PROTECTED
                </span>
              </h3>
              <p className="text-[11px] text-[#888899] font-mono-custom">
                Confidential broadcast configuration & playlist updater
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888899] hover:text-white hover:bg-[#252530] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Security Check Gate (Always prompted when opened) */}
        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#181822] border border-[#333345] flex items-center justify-center text-[#06B6D4] shadow-lg">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white font-mono-custom">
                RESTRICTED BROADCAST ACCESS
              </h4>
              <p className="text-xs text-[#888899] font-mono-custom mt-1 max-w-sm mx-auto">
                Please enter your 4-digit Master PIN or password to unlock the admin configuration.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3">
              <div className="relative flex items-center">
                <input
                  type={showPinText ? 'text' : 'password'}
                  maxLength={12}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter Password / PIN (e.g. 0000)"
                  className={`w-full text-center bg-[#0D0D12] border text-white text-sm font-mono-custom tracking-widest px-4 py-2.5 rounded-lg outline-none transition-all pr-10 ${
                    pinError
                      ? 'border-rose-500 ring-2 ring-rose-500/30'
                      : 'border-[#333345] focus:border-[#06B6D4]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPinText(!showPinText)}
                  className="absolute right-3 text-[#666] hover:text-white transition-colors cursor-pointer p-1"
                  title={showPinText ? 'Hide password' : 'Show password'}
                >
                  {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 font-mono-custom flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Incorrect PIN. Enter your configured PIN (e.g. 0000 or 9860)
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-bold text-xs font-mono-custom rounded-lg transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                UNLOCK CONSOLE
              </button>
            </form>

            <p className="text-[10px] text-[#666] font-mono-custom">
              Default Master PINs: <strong className="text-[#888]">0000</strong> or <strong className="text-[#888]">9860</strong>
            </p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-[#22222E] bg-[#0E0E12] px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-3 px-3.5 text-xs font-mono-custom border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'presets'
                    ? 'border-[#06B6D4] text-[#06B6D4] font-semibold'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                CURATED PRESETS
              </button>

              <button
                onClick={() => setActiveTab('custom_url')}
                className={`py-3 px-3.5 text-xs font-mono-custom border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'custom_url'
                    ? 'border-[#06B6D4] text-[#06B6D4] font-semibold'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                YOUTUBE LINK
              </button>

              <button
                onClick={() => setActiveTab('spotify')}
                className={`py-3 px-3.5 text-xs font-mono-custom border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'spotify'
                    ? 'border-[#1DB954] text-[#1DB954] font-semibold'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <Music2 className="w-3.5 h-3.5" />
                SPOTIFY PLAYLIST
              </button>

              <button
                onClick={() => setActiveTab('custom_ids')}
                className={`py-3 px-3.5 text-xs font-mono-custom border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'custom_ids'
                    ? 'border-[#06B6D4] text-[#06B6D4] font-semibold'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                TRACK LIST
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3.5 text-xs font-mono-custom border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-[#06B6D4] text-[#06B6D4] font-semibold'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                SECURITY PIN
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 max-h-[58vh] overflow-y-auto space-y-4">
              
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#999] font-mono-custom">
                    Select a ready-to-broadcast signature stream:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLAYLIST_PRESETS.map((preset) => {
                      const isSelected = playlistInput === preset.playlistId;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-[#06B6D4]/10 border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                              : 'bg-[#181820] hover:bg-[#20202C] border-[#2B2B38]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono-custom font-bold px-2 py-0.5 rounded bg-white/5 text-white/70">
                              {preset.badge}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] text-[#06B6D4] font-mono-custom font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> ACTIVE
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white font-mono-custom group-hover:text-[#06B6D4] transition-colors">
                            {preset.name}
                          </h4>
                          <p className="text-[11px] text-[#888] font-sans mt-1 leading-snug">
                            {preset.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'custom_url' && (
                <form onSubmit={handleSaveCustom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-custom text-[#CCC] mb-1.5 uppercase tracking-wider">
                      YouTube Playlist Link or Playlist ID:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={playlistInput}
                        onChange={(e) => setPlaylistInput(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/playlist?list=PLW1q_FRwhNUM"
                        className="w-full bg-[#0D0D12] border border-[#333345] focus:border-[#06B6D4] text-white text-xs font-mono-custom px-3.5 py-2.5 rounded-lg outline-none transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-[#777] font-mono-custom mt-1.5">
                      💡 Tip: Make sure the YouTube playlist visibility is set to <strong>Public</strong> or <strong>Unlisted</strong>.
                    </p>
                  </div>

                  <div className="bg-[#181820] border border-[#292938] rounded-lg p-3 text-xs font-mono-custom space-y-1 text-[#888]">
                    <span className="text-white font-bold block mb-1">Detected Playlist ID:</span>
                    <code className="text-[#06B6D4] break-all bg-black/40 px-2 py-1 rounded block">
                      {extractPlaylistId(playlistInput) || 'None specified'}
                    </code>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-bold text-xs font-mono-custom rounded-lg transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    SAVE PLAYLIST BROADCAST
                  </button>
                </form>
              )}

              {activeTab === 'spotify' && (
                <form onSubmit={handleSaveSpotify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-custom text-[#CCC] mb-1.5 uppercase tracking-wider">
                      Spotify Playlist / Album / Track Link:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={spotifyInput}
                        onChange={(e) => setSpotifyInput(e.target.value)}
                        placeholder="e.g. https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM"
                        className="w-full bg-[#0D0D12] border border-[#333345] focus:border-[#1DB954] text-white text-xs font-mono-custom px-3.5 py-2.5 rounded-lg outline-none transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-[#777] font-mono-custom mt-1.5">
                      Stream directly from public Spotify playlists or albums with dark ambient iframe player.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1AA34A] text-black font-bold text-xs font-mono-custom rounded-lg transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    SWITCH TO SPOTIFY BROADCAST
                  </button>
                </form>
              )}

              {activeTab === 'custom_ids' && (
                <form onSubmit={handleSaveCustom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-custom text-[#CCC] mb-1.5 uppercase tracking-wider">
                      Individual YouTube Video IDs or URLs (One per line):
                    </label>
                    <textarea
                      rows={5}
                      value={customListText}
                      onChange={(e) => setCustomListText(e.target.value)}
                      placeholder="hHuG7FIKgtc&#10;5qap5aO4i9A&#10;https://www.youtube.com/watch?v=jfKfPfyJRdk"
                      className="w-full bg-[#0D0D12] border border-[#333345] focus:border-[#06B6D4] text-white text-xs font-mono-custom px-3.5 py-2.5 rounded-lg outline-none transition-colors"
                    />
                    <p className="text-[11px] text-[#777] font-mono-custom mt-1.5">
                      Enter specific tracks you want to broadcast on your station.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-bold text-xs font-mono-custom rounded-lg transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    SAVE CUSTOM TRACKS
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="bg-[#181820] border border-[#292938] rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white font-mono-custom flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#06B6D4]" /> CHANGE MASTER PASSWORD / PIN
                    </h4>
                    <p className="text-[11px] text-[#888] font-sans">
                      Set a custom password or 4-digit PIN (e.g. <strong>0000</strong>) to protect your station configuration.
                    </p>

                    <form onSubmit={handleUpdatePin} className="space-y-2.5">
                      <input
                        type="password"
                        maxLength={12}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Enter new 4+ digit PIN / Password (e.g. 0000)"
                        className="w-full bg-[#0D0D12] border border-[#333345] focus:border-[#06B6D4] text-white text-xs font-mono-custom px-3.5 py-2 rounded-lg outline-none"
                      />
                      <button
                        type="submit"
                        disabled={newPin.trim().length < 4}
                        className="px-4 py-2 bg-[#06B6D4] disabled:opacity-40 text-black font-bold text-xs font-mono-custom rounded-lg transition-all cursor-pointer"
                      >
                        SAVE NEW PIN
                      </button>
                    </form>

                    {pinChangedMsg && (
                      <p className="text-xs text-emerald-400 font-mono-custom flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> PIN updated successfully!
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleLockOut}
                      className="text-xs font-mono-custom text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer p-1"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock Console Session Now
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#22222E] bg-[#0E0E12] text-xs font-mono-custom">
              <button
                onClick={handleResetToDefault}
                className="text-[#888] hover:text-[#06B6D4] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Default Mix</span>
              </button>

              {showSavedToast ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <Check className="w-4 h-4" /> BROADCAST SYNCED!
                </span>
              ) : (
                <span className="text-[#666] text-[10px]">Secret Shortcut: Alt+A</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
