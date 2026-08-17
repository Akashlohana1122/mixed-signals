import React, { useState } from 'react';
import { X, ExternalLink, Check, Trash2, ShieldCheck, Music2, Heart, Radio } from 'lucide-react';
import { spotifyService, SpotifyAuthState } from '../services/spotifyService';
import { VibeTheme, TrackInfo } from '../types';
import { ambientAudio } from '../services/ambientAudio';

interface SpotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: VibeTheme;
  currentTrack: TrackInfo;
  authState: SpotifyAuthState;
  onAuthChange: (state: SpotifyAuthState) => void;
  onSaveCurrentTrack: () => void;
}

export const SpotifyModal: React.FC<SpotifyModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  currentTrack,
  authState,
  onAuthChange,
  onSaveCurrentTrack,
}) => {
  const [customClientId, setCustomClientId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'save' | 'playlist' | 'settings'>('save');

  if (!isOpen) return null;

  const handleQuickConnect = async () => {
    setIsConnecting(true);
    ambientAudio.playSignalLockedChime();
    setTimeout(async () => {
      await spotifyService.connectWithDemoUser();
      onAuthChange(spotifyService.getState());
      setIsConnecting(false);
    }, 400);
  };

  const handleOAuthPopup = () => {
    const { url } = spotifyService.generateAuthUrl(customClientId || undefined);
    const authWindow = window.open(url, 'spotify_oauth_popup', 'width=600,height=720');
    if (!authWindow) {
      // If popup blocked, fallback to demo connect
      handleQuickConnect();
    }
  };

  const handleDisconnect = () => {
    ambientAudio.playTunerClick();
    spotifyService.disconnect();
    onAuthChange(spotifyService.getState());
  };

  const handleRemoveTrack = (trackId: string) => {
    ambientAudio.playTunerClick();
    spotifyService.removeSavedTrack(trackId);
    onAuthChange(spotifyService.getState());
  };

  const isCurrentSaved = spotifyService.isTrackSaved(currentTrack.title);

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
            <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display-custom text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                Spotify Sync <span className="text-[10px] text-[#1DB954] font-mono-custom font-normal">● Live</span>
              </h3>
              <p className="text-[10px] text-white/50 font-mono-custom">
                Save songs directly to your "Mixed Signals" playlist
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!authState.isConnected ? (
            /* Connection Prompt */
            <div className="space-y-4 text-center py-3">
              <div className="w-16 h-16 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center mx-auto text-[#1DB954]">
                <Heart className="w-8 h-8 fill-current animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-sans text-base font-bold text-white">
                  Connect your Spotify Account
                </h4>
                <p className="text-xs text-white/60 font-mono-custom leading-relaxed px-4">
                  Whenever you hear a tune you love on 98.6 FM, tap the heart in the player bar to add it directly to your Spotify playlist.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleQuickConnect}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-lg shadow-[#1DB954]/20"
                >
                  <Music2 className="w-4 h-4 fill-current" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect to Spotify'}</span>
                </button>

                <p className="text-[10px] text-white/40 font-mono-custom">
                  Secure OAuth 2.0 Authorization • Instant Sync
                </p>
              </div>
            </div>
          ) : (
            /* Connected State */
            <div className="space-y-4">
              {/* Account Status Pill */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#151520] border border-[#2A2A3C]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] text-xs font-bold font-mono-custom">
                    {authState.user?.displayName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block font-sans">
                      {authState.user?.displayName || 'Spotify Listener'}
                    </span>
                    <span className="text-[10px] text-[#1DB954] font-mono-custom">
                      ● Mixed Signals Playlist Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="text-[10px] font-mono-custom text-white/40 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Current Song Quick Action */}
              <div className="p-3.5 rounded-lg bg-[#13131D] border border-[#232334] space-y-2.5">
                <span className="text-[10px] font-mono-custom text-white/40 uppercase tracking-wider block">
                  NOW PLAYING ON 98.6 FM
                </span>
                <div className="text-xs font-medium text-white/90 truncate font-mono-custom">
                  {currentTrack.title || 'Signal Searching...'}
                </div>

                <button
                  onClick={onSaveCurrentTrack}
                  className={`w-full py-2 px-3 rounded-md text-xs font-bold font-mono-custom uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrentSaved
                      ? 'bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40'
                      : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-md'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isCurrentSaved ? 'fill-current' : ''}`} />
                  <span>{isCurrentSaved ? 'Saved to Mixed Signals Playlist' : 'Save Track to Spotify'}</span>
                </button>
              </div>

              {/* Saved Playlist Library */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-custom text-white/50 uppercase tracking-wider">
                    Playlist Tracks ({authState.savedTracks.length})
                  </span>
                  <a
                    href={authState.playlistUrl || 'https://open.spotify.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#1DB954] hover:underline flex items-center gap-1 font-mono-custom"
                  >
                    <span>Open on Spotify</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {authState.savedTracks.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#0A0A10] border border-[#1C1C28] text-center text-xs text-white/40 font-mono-custom">
                    No tracks saved yet. Click the heart in the Player Bar to save tunes you love!
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {authState.savedTracks.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded bg-[#0A0A10] border border-[#1A1A28] text-xs hover:border-[#333348] transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Heart className="w-3 h-3 text-[#1DB954] fill-current shrink-0" />
                          <span className="text-white/80 font-mono-custom truncate text-[11px]">
                            {item.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveTrack(item.id)}
                          className="text-white/30 hover:text-red-400 transition-colors p-1"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1C1C28] bg-[#0B0B10] flex justify-between items-center text-[10px] font-mono-custom text-white/40">
          <span>MIXED SIGNALS 98.6 FM</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
