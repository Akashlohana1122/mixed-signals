/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Radio, Volume2, Sparkles, Moon, Play, Pause, Disc, Share2, Headphones, Wifi, Maximize, Minimize, Clock, Users, Timer, Check, ChevronDown, Activity } from 'lucide-react';
import { NightWindowCanvas } from './components/NightWindowCanvas';
import { AnalogBoombox } from './components/AnalogBoombox';
import { PlayerBar } from './components/PlayerBar';
import { RotatingQuotes } from './components/RotatingQuotes';
import { AtmosphereControls } from './components/AtmosphereControls';
import { VibeNotes } from './components/VibeNotes';
import { ThemeVibeDeck } from './components/ThemeVibeDeck';
import { AdminPlaylistModal } from './components/AdminPlaylistModal';
import { AtmosphericBackdrop } from './components/AtmosphericBackdrop';
import { FloatingDustOverlay } from './components/FloatingDustOverlay';
import { GlassTransitionHUD } from './components/GlassTransitionHUD';
import { HeroTitleLogo } from './components/HeroTitleLogo';
import { MixedSignalsEmblem } from './components/MixedSignalsEmblem';
import { TrackInfo, AtmosphereSettings, VibeTheme, StreamSourceConfig, JournalEntry, UpNextTrack, ListeningModeType } from './types';
import { ambientAudio } from './services/ambientAudio';
import { cacheVideoTitle, fetchYouTubeVideoTitle, getCachedVideoTitle } from './services/youtubeTitleHelper';
import { VIBE_THEMES } from './data/themesAndPresets';
import { ALL_WALLPAPERS } from './data/atmosphericImages';
import { LISTENING_MODES, getListeningModeById } from './data/listeningModes';
import { useLiveStationState } from './hooks/useLiveStationState';
import { spotifyService, SpotifyAuthState } from './services/spotifyService';
import { SpotifyModal } from './components/SpotifyModal';
import { weatherService, WeatherToneData } from './services/weatherService';
import { WeatherModal } from './components/WeatherModal';
import { D3FrequencyVisualizer } from './components/D3FrequencyVisualizer';
import { SessionSummaryModal } from './components/SessionSummaryModal';

// TypeScript declarations for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => {
    video_id: string;
    author: string;
    title: string;
  };
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  playVideoAt?: (index: number) => void;
  setShuffle: (shufflePlaylist: boolean) => void;
  cuePlaylist?: (playlist: { list: string; listType: string; index?: number } | string[], index?: number) => void;
  loadPlaylist: (playlist: { list: string; listType: string; index?: number } | string[], index?: number) => void;
}

const STORAGE_KEY = 'mixed_signals_playlist_config';
const INITIAL_VIDEO_ID = 'hHuG7FIKgtc';

// Helper to get dynamic welcome message based on time of day
const getTimeGreeting = (): { greeting: string; icon: string } => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    return { greeting: 'Late night traveler', icon: '🌙' };
  } else if (hour >= 5 && hour < 9) {
    return { greeting: 'Early morning signal searcher', icon: '🌅' };
  } else if (hour >= 9 && hour < 12) {
    return { greeting: 'Morning haze wanderer', icon: '☕' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Afternoon daydreamer', icon: '☀️' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Golden hour nomad', icon: '🌆' };
  } else {
    return { greeting: 'Late night traveler', icon: '✨' };
  }
};

// Helper to extract clean short song title (up to '-' or '|')
const getCleanShortSongTitle = (rawTitle: string): string => {
  if (!rawTitle) return 'Mixed Signals';
  const delimiterMatch = rawTitle.split(/[\-\|—\[\(【]/)[0];
  if (delimiterMatch && delimiterMatch.trim().length > 0) {
    let clean = delimiterMatch.trim();
    clean = clean.replace(/(official|video|audio|lyric(al)?|4k|hd|remix|slowed|reverb)/gi, '').trim();
    return clean || rawTitle.slice(0, 24);
  }
  return rawTitle.slice(0, 24);
};

// Helper to generate embed url for spotify links
const extractSpotifyEmbedUrl = (input?: string): string => {
  if (!input) return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
  const clean = input.trim();
  const match = clean.match(/(?:spotify\.com\/(playlist|album|track|artist)\/|spotify:(playlist|album|track|artist):)([a-zA-Z0-9]+)/);
  if (match) {
    const type = match[1] || match[2];
    const id = match[3];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }
  if (clean.includes('embed/')) return clean;
  return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
};

export default function App() {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSleepMenuOpen, setIsSleepMenuOpen] = useState(false);
  const [hudNotice, setHudNotice] = useState<{
    isVisible: boolean;
    actionType: 'next' | 'prev' | 'tune' | 'play' | null;
  }>({
    isVisible: false,
    actionType: null,
  });
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Glassmorphic Track Transition HUD Trigger (persists for 1.0 second as requested)
  const triggerTrackHUD = useCallback((action: 'next' | 'prev' | 'tune' | 'play') => {
    if (hudTimerRef.current) {
      clearTimeout(hudTimerRef.current);
    }
    setHudNotice({ isVisible: true, actionType: action });
    hudTimerRef.current = setTimeout(() => {
      setHudNotice({ isVisible: false, actionType: null });
    }, 1000);
  }, []);

  const handleDismissHUD = useCallback(() => {
    if (hudTimerRef.current) {
      clearTimeout(hudTimerRef.current);
    }
    setHudNotice({ isVisible: false, actionType: null });
  }, []);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Active visual theme (defaults to vibrant Cyber Cyan Night Drive)
  const [activeTheme, setActiveTheme] = useState<VibeTheme>(VIBE_THEMES[0]);
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(null);

  // Synchronized Station Listening Mode State
  const [selectedListeningMode, setSelectedListeningMode] = useState<ListeningModeType>(() => {
    try {
      const saved = localStorage.getItem('mixed_signals_listening_mode');
      if (saved && ['headphones', 'drive', 'background', 'speaker'].includes(saved)) {
        return saved as ListeningModeType;
      }
    } catch {
      // Fallback
    }
    return 'headphones';
  });

  const handleSelectListeningMode = useCallback((modeId: ListeningModeType) => {
    ambientAudio.playTunerClick();
    ambientAudio.applyListeningModeAcoustics(modeId, 0.25);
    setSelectedListeningMode(modeId);
    try {
      localStorage.setItem('mixed_signals_listening_mode', modeId);
    } catch {
      // Ignore
    }
    triggerTrackHUD('tune');
  }, [triggerTrackHUD]);

  // Spotify OAuth & Save to Playlist State
  const [spotifyAuthState, setSpotifyAuthState] = useState<SpotifyAuthState>(() => spotifyService.getState());
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);

  // D3 Frequency Visualizer Mode & Fullscreen State
  const [isVisualizerMode, setIsVisualizerMode] = useState(false);
  const [isFullScreenVisualizer, setIsFullScreenVisualizer] = useState(false);

  // Session Telemetry & Statistics Modal State
  const [isSessionSummaryOpen, setIsSessionSummaryOpen] = useState(false);

  // Synchronize dynamic scene CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', activeTheme.accentColor);
    root.style.setProperty('--theme-glow', activeTheme.glowColor);
    root.style.setProperty('--theme-accent-soft', `${activeTheme.accentColor}33`);
    root.style.setProperty('--theme-border-glow', `${activeTheme.accentColor}66`);
  }, [activeTheme]);

  // Live Atmospheric Weather Tone & Location State (Defaults to User Device Location)
  const [weatherTone, setWeatherTone] = useState<WeatherToneData>(() => weatherService.getAutoWeatherForCurrentHour());
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isAutoWeatherSync, setIsAutoWeatherSync] = useState(true);

  // Automatically detect and sync real device location & live weather upon load
  useEffect(() => {
    let isMounted = true;
    weatherService.detectRealDeviceWeather().then((realWeather) => {
      if (isMounted && realWeather) {
        setWeatherTone(realWeather);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Playlist / Stream configuration stored in localStorage
  const [streamConfig, setStreamConfig] = useState<StreamSourceConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      type: 'playlist',
      playlistId: 'PLW1q_FRwhNUM',
      customVideoIds: [],
      activePresetTitle: 'Mixed Signals Vol. 1 (Signature)',
    };
  });

  const [track, setTrack] = useState<TrackInfo>({
    id: INITIAL_VIDEO_ID,
    title: 'Mixed Signals — Midnight Transmission',
    author: '',
    duration: 0,
    currentTime: 0,
    isBuffering: false,
    isPlaying: false,
    hasStarted: false,
    index: 0,
    totalTracks: 20,
  });

  const [atmosphere, setAtmosphere] = useState<AtmosphereSettings>(() => {
    try {
      const saved = localStorage.getItem('mixed_signals_atmosphere');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          tapeHiss: false,
          rainAmbience: false,
          rainVolume: parsed.rainVolume ?? 0.45,
          rainIntensityLevel: parsed.rainIntensityLevel ?? 'pour',
        };
      }
    } catch {
      // Fallback
    }
    return {
      scanlines: true,
      tapeHiss: false,
      rainAmbience: false,
      rainVolume: 0.45,
      rainIntensityLevel: 'pour',
      nightDriveMode: false,
      grainIntensity: 0.04,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('mixed_signals_atmosphere', JSON.stringify({
        scanlines: atmosphere.scanlines,
        nightDriveMode: atmosphere.nightDriveMode,
        rainVolume: atmosphere.rainVolume,
        rainIntensityLevel: atmosphere.rainIntensityLevel,
      }));
    } catch {
      // Ignore
    }
  }, [atmosphere.scanlines, atmosphere.nightDriveMode, atmosphere.rainVolume, atmosphere.rainIntensityLevel]);

  // Handle sleep timer expiring: gently pause playback
  const handleSleepTimerExpire = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setTrack((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Hook for live clock, online listeners, sleep timer, and fullscreen
  const {
    liveTime,
    onlineListeners,
    sleepSecondsLeft,
    formattedSleepTimer,
    setSleepTimer,
    isFullscreen,
    toggleFullscreen,
  } = useLiveStationState(handleSleepTimerExpire);

  // Sync ambient audio when settings change
  useEffect(() => {
    ambientAudio.setTapeHiss(atmosphere.tapeHiss);
  }, [atmosphere.tapeHiss]);

  useEffect(() => {
    ambientAudio.setRainAmbience(
      atmosphere.rainAmbience, 
      atmosphere.rainVolume ?? 0.45, 
      atmosphere.rainIntensityLevel ?? 'pour'
    );
  }, [atmosphere.rainAmbience, atmosphere.rainVolume, atmosphere.rainIntensityLevel]);

  // Graceful audio cross-fade transition when toggling Night Drive mode
  useEffect(() => {
    ambientAudio.setNightDriveAmbience(atmosphere.nightDriveMode, 0.24, 1.6);
  }, [atmosphere.nightDriveMode]);

  // 1. Listening Session Live Timer (HH:MM:SS from initial load)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionFormattedTime = useMemo(() => {
    const hrs = Math.floor(sessionSeconds / 3600);
    const mins = Math.floor((sessionSeconds % 3600) / 60);
    const secs = sessionSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [sessionSeconds]);

  // 2. Signal Journal & Signals Caught counter (current visit listening history)
  const [signalJournal, setSignalJournal] = useState<JournalEntry[]>([]);
  const [signalsCaughtCount, setSignalsCaughtCount] = useState(0);
  const lastLoggedTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (track.id && track.title && (track.isPlaying || track.hasStarted)) {
      if (lastLoggedTrackIdRef.current !== track.id) {
        lastLoggedTrackIdRef.current = track.id;
        cacheVideoTitle(track.id, track.title);
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        setSignalJournal((prev) => {
          const newEntry: JournalEntry = {
            id: track.id,
            title: track.title,
            time: timeStr,
            timestamp: Date.now(),
          };
          // Filter duplicates within recent window and keep latest 5
          const filtered = prev.filter((e) => e.id !== track.id);
          return [newEntry, ...filtered].slice(0, 5);
        });

        setSignalsCaughtCount((prev) => prev + 1);
      }
    }
  }, [track.id, track.title, track.isPlaying, track.hasStarted]);

  // 3. Up Next Transmission Queue (live YouTube playlist upcoming tracks)
  const [upNextTracks, setUpNextTracks] = useState<UpNextTrack[]>([]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !player.getPlaylist) return;

    const playlist: string[] = player.getPlaylist() || [];
    const currentIdx: number = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;

    if (playlist && playlist.length > 0) {
      if (track.id && track.title) {
        cacheVideoTitle(track.id, track.title);
      }

      const nextItems: UpNextTrack[] = [];
      const countToShow = Math.min(3, playlist.length - 1);

      for (let offset = 1; offset <= countToShow; offset++) {
        const targetIdx = (currentIdx + offset) % playlist.length;
        const vidId = playlist[targetIdx];
        const cached = getCachedVideoTitle(vidId);
        nextItems.push({
          index: targetIdx,
          id: vidId,
          title: cached || `Signal Channel [${String(targetIdx + 1).padStart(2, '0')}]`,
        });
      }

      setUpNextTracks(nextItems);

      // Asynchronously fetch titles for any uncached videos
      nextItems.forEach((item) => {
        if (!getCachedVideoTitle(item.id)) {
          fetchYouTubeVideoTitle(item.id).then((fetchedTitle) => {
            if (fetchedTitle) {
              setUpNextTracks((prev) =>
                prev.map((p) => (p.id === item.id ? { ...p, title: fetchedTitle } : p))
              );
            }
          });
        }
      });
    }
  }, [track.index, track.id, track.title, isPlayerReady]);

  // Update track details from live YouTube player
  const updateTrackState = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    try {
      const data = player.getVideoData ? player.getVideoData() : null;
      const duration = player.getDuration ? player.getDuration() : 0;
      const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const state = player.getPlayerState ? player.getPlayerState() : -1;
      const playlist = player.getPlaylist ? player.getPlaylist() : [];
      const playlistIdx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;

      const isPlaying = state === 1; // YT.PlayerState.PLAYING
      const isBuffering = state === 3; // YT.PlayerState.BUFFERING

      setTrack((prev) => ({
        ...prev,
        id: data?.video_id || prev.id,
        title: data?.title ? data.title : prev.title,
        author: data?.author || prev.author,
        duration: duration || prev.duration,
        currentTime: currentTime,
        isPlaying,
        isBuffering,
        index: playlistIdx >= 0 ? playlistIdx : prev.index,
        totalTracks: playlist?.length || prev.totalTracks,
      }));
    } catch {
      // Ignored if player is initializing
    }
  }, []);

  // Load YouTube IFrame API and initialize player with active stream config
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerVars: Record<string, unknown> = {
        autoplay: 0,
        controls: 0,
        rel: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      };

      if (streamConfig.type === 'playlist') {
        playerVars.listType = 'playlist';
        playerVars.list = streamConfig.playlistId;
      }

      playerRef.current = new window.YT.Player('youtube-stream-container', {
        height: '180',
        width: '180',
        playerVars,
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            event.target.unMute();
            event.target.setVolume(volume || 100);

            const randomizeAndCue = () => {
              try {
                if (streamConfig.type === 'custom_list' && streamConfig.customVideoIds?.length > 0) {
                  const randomStartIdx = Math.floor(Math.random() * streamConfig.customVideoIds.length);
                  if (event.target.cuePlaylist) {
                    event.target.cuePlaylist(streamConfig.customVideoIds, randomStartIdx);
                  } else {
                    event.target.loadPlaylist(streamConfig.customVideoIds, randomStartIdx);
                    if (event.target.pauseVideo) event.target.pauseVideo();
                  }
                } else if (streamConfig.playlistId) {
                  const playlist = event.target.getPlaylist ? event.target.getPlaylist() : null;
                  const playlistLength = playlist && playlist.length > 0 ? playlist.length : 20;
                  const randomStartIdx = Math.floor(Math.random() * playlistLength);

                  if (event.target.cuePlaylist) {
                    event.target.cuePlaylist({
                      listType: 'playlist',
                      list: streamConfig.playlistId,
                      index: randomStartIdx,
                    });
                  } else if (event.target.playVideoAt) {
                    event.target.playVideoAt(randomStartIdx);
                    setTimeout(() => {
                      if (event.target.pauseVideo) event.target.pauseVideo();
                      updateTrackState();
                    }, 250);
                  }
                }
              } catch {
                // Fallback safe
              }
              updateTrackState();
            };

            // Immediate randomized cueing
            randomizeAndCue();
            setTimeout(randomizeAndCue, 350);
            setTimeout(updateTrackState, 600);
          },
          onStateChange: (event) => {
            const isNowPlaying = event.data === 1;
            if (isNowPlaying) {
              event.target.unMute();
              event.target.setVolume(volume || 100);
              setTrack((prev) => ({ ...prev, hasStarted: true, isPlaying: true }));
              ambientAudio.playSignalLockedChime();
            } else if (event.data === 2) {
              setTrack((prev) => ({ ...prev, isPlaying: false }));
            }
            updateTrackState();
          },
          onError: () => {
            // Auto skip failed tracks
            setTimeout(() => {
              if (playerRef.current?.nextVideo) {
                playerRef.current.nextVideo();
              }
            }, 800);
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = initPlayer;
      document.body.appendChild(tag);
    } else {
      initPlayer();
    }
  }, [streamConfig.playlistId, updateTrackState, volume]);

  // Periodic polling for time progress & title
  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current && isPlayerReady) {
        updateTrackState();
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isPlayerReady, updateTrackState]);

  // Track playback controls
  const handlePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    triggerTrackHUD('play');
    ambientAudio.resumeOnInteraction();

    if (track.isPlaying) {
      player.pauseVideo();
    } else {
      if (player.isMuted()) {
        player.unMute();
      }
      player.setVolume(volume || 100);
      player.playVideo();
      setTrack((prev) => ({ ...prev, hasStarted: true, isPlaying: true }));
    }
  }, [track.isPlaying, volume, triggerTrackHUD]);

  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const nextVal = !prev;
      ambientAudio.playTunerClick();
      if (playerRef.current?.setShuffle) {
        playerRef.current.setShuffle(nextVal);
      }
      return nextVal;
    });
  }, []);

  const handleToggleRepeat = useCallback(() => {
    setIsRepeat((prev) => {
      const nextVal = !prev;
      ambientAudio.playTunerClick();
      if (playerRef.current?.setLoop) {
        playerRef.current.setLoop(nextVal);
      }
      return nextVal;
    });
  }, []);

  const handleNext = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    
    // Immediate audio feedback & HUD trigger
    ambientAudio.playTunerClick();
    triggerTrackHUD('next');
    
    // Ensure stream is unmuted & volume is optimal for instant playback
    try {
      if (player.isMuted && player.isMuted()) {
        player.unMute();
      }
      if (player.setVolume) {
        player.setVolume(volume || 100);
      }
    } catch {
      // Safe fallback
    }

    if (isShuffle) {
      const playlist = player.getPlaylist ? player.getPlaylist() : null;
      if (playlist && playlist.length > 1) {
        const currentIdx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
        let randomIdx = Math.floor(Math.random() * playlist.length);
        if (randomIdx === currentIdx) {
          randomIdx = (currentIdx + 1) % playlist.length;
        }
        if (player.playVideoAt) {
          // Optimistically update upcoming track index to avoid lag
          const nextVidId = playlist[randomIdx];
          const cachedTitle = getCachedVideoTitle(nextVidId);
          setTrack((prev) => ({
            ...prev,
            id: nextVidId || prev.id,
            title: cachedTitle || prev.title,
            index: randomIdx,
            isPlaying: true,
            isBuffering: true,
          }));
          player.playVideoAt(randomIdx);
          updateTrackState();
          setTimeout(updateTrackState, 150);
          return;
        }
      }
    }
    
    // Direct & instant switch
    const playlist = player.getPlaylist ? player.getPlaylist() : null;
    const currentIdx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
    if (playlist && playlist.length > 0) {
      const nextIdx = (currentIdx + 1) % playlist.length;
      const nextVidId = playlist[nextIdx];
      const cachedTitle = getCachedVideoTitle(nextVidId);
      setTrack((prev) => ({
        ...prev,
        id: nextVidId || prev.id,
        title: cachedTitle || prev.title,
        index: nextIdx,
        isPlaying: true,
        isBuffering: true,
      }));
    }

    player.nextVideo();
    updateTrackState();
    setTimeout(updateTrackState, 150);
  }, [updateTrackState, triggerTrackHUD, isShuffle, volume]);

  const handlePrevious = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    
    // Immediate audio feedback & HUD trigger
    ambientAudio.playTunerClick();
    triggerTrackHUD('prev');
    
    // Ensure stream is unmuted & volume is optimal for instant playback
    try {
      if (player.isMuted && player.isMuted()) {
        player.unMute();
      }
      if (player.setVolume) {
        player.setVolume(volume || 100);
      }
    } catch {
      // Safe fallback
    }

    if (isShuffle) {
      const playlist = player.getPlaylist ? player.getPlaylist() : null;
      if (playlist && playlist.length > 1) {
        const currentIdx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
        let randomIdx = Math.floor(Math.random() * playlist.length);
        if (randomIdx === currentIdx) {
          randomIdx = (currentIdx - 1 + playlist.length) % playlist.length;
        }
        if (player.playVideoAt) {
          const prevVidId = playlist[randomIdx];
          const cachedTitle = getCachedVideoTitle(prevVidId);
          setTrack((prev) => ({
            ...prev,
            id: prevVidId || prev.id,
            title: cachedTitle || prev.title,
            index: randomIdx,
            isPlaying: true,
            isBuffering: true,
          }));
          player.playVideoAt(randomIdx);
          updateTrackState();
          setTimeout(updateTrackState, 150);
          return;
        }
      }
    }

    const playlist = player.getPlaylist ? player.getPlaylist() : null;
    const currentIdx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
    if (playlist && playlist.length > 0) {
      const prevIdx = (currentIdx - 1 + playlist.length) % playlist.length;
      const prevVidId = playlist[prevIdx];
      const cachedTitle = getCachedVideoTitle(prevVidId);
      setTrack((prev) => ({
        ...prev,
        id: prevVidId || prev.id,
        title: cachedTitle || prev.title,
        index: prevIdx,
        isPlaying: true,
        isBuffering: true,
      }));
    }

    player.previousVideo();
    updateTrackState();
    setTimeout(updateTrackState, 150);
  }, [updateTrackState, triggerTrackHUD, isShuffle, volume]);

  const handleSelectTrackIndex = useCallback((targetIndex: number) => {
    const player = playerRef.current;
    if (!player) return;
    
    ambientAudio.playTunerClick();
    triggerTrackHUD('tune');

    try {
      if (player.isMuted && player.isMuted()) {
        player.unMute();
      }
      if (player.setVolume) {
        player.setVolume(volume || 100);
      }
    } catch {
      // Safe fallback
    }

    if (player.playVideoAt) {
      const playlist = player.getPlaylist ? player.getPlaylist() : null;
      if (playlist && playlist[targetIndex]) {
        const targetVidId = playlist[targetIndex];
        const cachedTitle = getCachedVideoTitle(targetVidId);
        setTrack((prev) => ({
          ...prev,
          id: targetVidId,
          title: cachedTitle || prev.title,
          index: targetIndex,
          isPlaying: true,
          isBuffering: true,
        }));
      }
      player.playVideoAt(targetIndex);
      updateTrackState();
      setTimeout(updateTrackState, 150);
    }
  }, [triggerTrackHUD, updateTrackState, volume]);

  const handleSeek = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(seconds, true);
    setTrack((prev) => ({ ...prev, currentTime: seconds }));
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && playerRef.current.isMuted()) {
        playerRef.current.unMute();
      }
    }
  }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleSelectTheme = (theme: VibeTheme) => {
    setActiveTheme(theme);
    setCustomWallpaperUrl(null);
    triggerTrackHUD('tune');
    
    // Play theme's acoustic signature chime & apply ambient environment
    ambientAudio.playThemeAcousticSignature(theme.id);
    ambientAudio.applyThemeAmbientEnvironment(theme.id);

    if (theme.id === 'rainy-tokyo') {
      setAtmosphere((prev) => ({ ...prev, rainAmbience: true, tapeHiss: false, nightDriveMode: false }));
    } else if (theme.id === 'night-drive') {
      // Midnight Synth is the pure clean/silent chill master switch (turns all background effects OFF)
      setAtmosphere((prev) => ({ ...prev, nightDriveMode: true, rainAmbience: false, tapeHiss: false }));
    } else if (theme.id === 'vintage-cassette') {
      setAtmosphere((prev) => ({ ...prev, tapeHiss: true, rainAmbience: false, nightDriveMode: false }));
    } else {
      setAtmosphere((prev) => ({ ...prev, rainAmbience: false, tapeHiss: false, nightDriveMode: false }));
    }
  };

  const handleShuffleWallpaper = useCallback(() => {
    ambientAudio.playTunerClick();
    triggerTrackHUD('tune');
    setCustomWallpaperUrl((prev) => {
      const candidates = ALL_WALLPAPERS.map((w) => w.url).filter((u) => u !== prev);
      const randomPicked = candidates[Math.floor(Math.random() * candidates.length)];
      return randomPicked || ALL_WALLPAPERS[0].url;
    });
  }, [triggerTrackHUD]);

  // Spotify Save Track to "Mixed Signals" Playlist Handler
  const handleToggleSpotifySave = useCallback(async () => {
    ambientAudio.playTunerClick();
    if (!spotifyAuthState.isConnected) {
      setIsSpotifyModalOpen(true);
      return;
    }

    if (spotifyService.isTrackSaved(track.title)) {
      setIsSpotifyModalOpen(true);
      return;
    }

    const res = await spotifyService.saveTrackToPlaylist(track.title || 'Mixed Signals Stream Track');
    if (res.success) {
      ambientAudio.playSignalLockedChime();
      setSpotifyAuthState(spotifyService.getState());
      triggerTrackHUD('tune');
    }
  }, [spotifyAuthState.isConnected, track.title, triggerTrackHUD]);

  // Live Weather Preset Selection Handler
  const handleSelectWeatherPreset = useCallback((preset: WeatherToneData) => {
    setWeatherTone(preset);
    setIsAutoWeatherSync(false);
    if (preset.rainIntensity > 0.3) {
      setAtmosphere((prev) => ({ ...prev, rainAmbience: true }));
    }
  }, []);

  const handleToggleAutoWeatherSync = useCallback(() => {
    setIsAutoWeatherSync((prev) => {
      const next = !prev;
      if (next) {
        setWeatherTone(weatherService.getAutoWeatherForCurrentHour());
      }
      return next;
    });
  }, []);

  // Keyboard shortcut listeners (Space, Arrow keys, Mute, Admin Alt+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.min(100, v + 5);
          if (playerRef.current) playerRef.current.setVolume(next);
          return next;
        });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, v - 5);
          if (playerRef.current) playerRef.current.setVolume(next);
          return next;
        });
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleNext, handlePrevious, handleToggleMute]);

  // Save new playlist stream configuration
  const handleSaveStreamConfig = (newConfig: StreamSourceConfig) => {
    setStreamConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // Ignore
    }

    if (playerRef.current) {
      if (newConfig.type === 'custom_list' && newConfig.customVideoIds?.length > 0) {
        playerRef.current.loadPlaylist(newConfig.customVideoIds);
      } else {
        playerRef.current.loadPlaylist({
          list: newConfig.playlistId,
          listType: 'playlist',
        });
      }
    }
  };

  // Secret Brand Triple Click for station owner admin access
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretBrandClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setIsAdminModalOpen(true);
      ambientAudio.playSignalLockedChime();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 700);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080C] text-[#E4E3E0] font-sans selection:bg-cyan-500 selection:text-black flex flex-col justify-between overflow-x-hidden">
      
      {/* Hidden YouTube IFrame Audio Host */}
      <div 
        id="youtube-stream-container" 
        className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50"
        aria-hidden="true"
      />

      {/* Atmospheric Dust Motifs */}
      <FloatingDustOverlay isPlaying={track.isPlaying} activeTheme={activeTheme} />

      {/* Cinematic Theme Atmospheric Backdrop Imagery */}
      <AtmosphericBackdrop 
        activeTheme={activeTheme} 
        isPlaying={track.isPlaying} 
        trackId={track.id} 
        forcedWallpaperUrl={customWallpaperUrl}
        weatherTone={weatherTone}
      />

      {/* Atmospheric Night Window Backdrop with Dynamic Tempo & Energy Scaling */}
      <NightWindowCanvas 
        isPlaying={track.isPlaying}
        rainEnabled={atmosphere.rainAmbience}
        rainIntensity={atmosphere.rainAmbience ? Math.max(0.6, weatherTone.rainIntensity) : weatherTone.rainIntensity}
        rainIntensityLevel={atmosphere.rainIntensityLevel}
        hasThunder={weatherTone.hasThunder}
        track={track}
        activeTheme={activeTheme}
      />

      {/* Shifting Ambient Light Glow Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out animate-tube-flicker"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 25%, ${activeTheme.glowColor}, transparent 75%)`,
        }}
      />

      {/* Noise Texture Overlay */}
      <div className={`fixed inset-0 noise-bg pointer-events-none z-10 ${track.isPlaying ? 'noise-bg-active opacity-90' : 'opacity-60'} transition-opacity duration-700`} />

      {/* CRT Scanline Overlay (Subtle, non-destructive to text) */}
      {atmosphere.scanlines && (
        <div className="fixed inset-0 scanlines pointer-events-none z-10 opacity-15" />
      )}

      {/* Analog Screen Vignette */}
      <div className="fixed inset-0 analog-vignette pointer-events-none z-10" />

      {/* Glassmorphic Track Transition HUD */}
      <GlassTransitionHUD
        isVisible={hudNotice.isVisible}
        actionType={hudNotice.actionType}
        activeTheme={activeTheme}
        onDismiss={handleDismissHUD}
      />

      {/* Top Bar (Single row contract: Brand / Real-time clock — Welcome & Listeners Pill — Action Controls) */}
      <header className="relative z-30 w-full border-b border-[#1C1C28]/80 bg-[#09090D]/80 backdrop-blur-xl px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 select-none">
        
        {/* Left Zone: Brand Wordmark (Always cleanly displayed & never clipped) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div 
            onClick={handleSecretBrandClick}
            title="Triple-click for Station Owner Secret Admin Console"
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <MixedSignalsEmblem size={26} themeAccent={activeTheme.accentColor} glow={false} />
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black transition-transform ${track.isPlaying ? 'animate-ping' : 'opacity-80'}`}
                style={{ backgroundColor: activeTheme.accentColor }} 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display-custom text-sm sm:text-base md:text-lg font-black tracking-wider sm:tracking-widest text-[#E4E3E0] uppercase whitespace-nowrap group-hover:text-white transition-colors leading-tight">
                MIXED SIGNALS
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-mono-custom font-bold text-cyan-400 uppercase tracking-[0.15em] sm:tracking-[0.25em] leading-tight group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                MADE BY AKASH KUMAR
              </span>
            </div>
          </div>
        </div>

        {/* Center Zone: Live Real-Time Clock + Break Sleep Timer (Visible on all screens, compact on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Live Clock with Precision Glow */}
          <div 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#11111A]/95 border border-[#2B2B3E] shadow-inner font-digital-custom tracking-wider group transition-all shrink-0"
            style={{
              borderColor: track.isPlaying ? `${activeTheme.accentColor}40` : '#2B2B3E',
              boxShadow: track.isPlaying ? `0 0 14px ${activeTheme.glowColor}25` : undefined,
            }}
          >
            <span className="text-[10px] font-bold text-[#888899] uppercase tracking-widest hidden md:inline">
              {liveTime.dayName || 'LIVE'}
            </span>
            <div className="flex items-baseline gap-0.5 text-[11px] sm:text-xs md:text-sm font-bold text-white font-digital-custom tracking-wider">
              <span className="tabular-nums font-semibold">{liveTime.hours}</span>
              <span className="text-white/60 animate-pulse font-bold">:</span>
              <span className="tabular-nums font-semibold">{liveTime.minutes}</span>
              <span className="text-white/40 font-bold hidden xs:inline">:</span>
              <span className="text-white/90 tabular-nums font-semibold hidden xs:inline">{liveTime.seconds}</span>
              
              {/* Microsecond pulse */}
              <span 
                className="text-[9px] sm:text-[10px] font-digital-custom tabular-nums font-bold ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 rounded bg-black/50 border border-white/10 transition-opacity hidden sm:inline"
                style={{
                  color: activeTheme.accentColor,
                  textShadow: track.isPlaying ? `0 0 8px ${activeTheme.accentColor}80` : undefined,
                  opacity: track.isPlaying ? 0.9 : 0.6,
                }}
                title="Real-time precision centiseconds telemetry"
              >
                .{liveTime.micro}
              </span>

              <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase ml-0.5 sm:ml-1 font-digital-custom tracking-normal" style={{ color: activeTheme.accentColor }}>
                {liveTime.ampm}
              </span>
            </div>
          </div>

          {/* Break / Sleep Timer Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsSleepMenuOpen((prev) => !prev)}
              className={`touch-target-comfort-h px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-digital-custom tracking-wide flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
                sleepSecondsLeft !== null
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold'
                  : 'text-white/70 hover:text-white border-[#2B2B3E] hover:border-white/30 bg-[#11111A]/95'
              }`}
              style={{
                borderColor: sleepSecondsLeft !== null ? undefined : (track.isPlaying ? `${activeTheme.accentColor}40` : '#2B2B3E'),
                boxShadow: sleepSecondsLeft === null && track.isPlaying ? `0 0 10px ${activeTheme.glowColor}18` : undefined,
              }}
              title="Sleep / Focus Break Timer"
            >
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: sleepSecondsLeft !== null ? '#34D399' : activeTheme.accentColor }} />
              <span className="tabular-nums font-semibold uppercase hidden xs:inline">{formattedSleepTimer ? formattedSleepTimer : 'BREAK'}</span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60" />
            </button>

            {/* Sleep Timer Options Menu */}
            {isSleepMenuOpen && (
              <div 
                className="absolute top-full right-0 sm:left-0 mt-2 w-48 bg-[#121218]/95 backdrop-blur-xl border border-[#2A2A38] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in"
                onClick={() => setIsSleepMenuOpen(false)}
              >
                <div className="px-2.5 py-1 text-[9.5px] font-digital-custom text-[#888] uppercase tracking-wider border-b border-white/10 mb-1">
                  FOCUS / BREAK TIMER
                </div>
                {[
                  { label: 'Off / None', mins: null },
                  { label: '15 Minutes', mins: 15 },
                  { label: '30 Minutes', mins: 30 },
                  { label: '45 Minutes', mins: 45 },
                  { label: '60 Minutes', mins: 60 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSleepTimer(opt.mins)}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-digital-custom tracking-wide hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>{opt.label}</span>
                    {((opt.mins === null && sleepSecondsLeft === null) ||
                      (opt.mins !== null && sleepSecondsLeft !== null && Math.ceil(sleepSecondsLeft / 60) === opt.mins)) && (
                      <Check className="w-3 h-3 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Synchronized Station Listening Mode Pill (Desktop / Tablet) */}
          {(() => {
            const currentModeObj = getListeningModeById(selectedListeningMode);
            const ModeIcon = currentModeObj.icon;
            return (
              <button
                onClick={() => {
                  const idx = LISTENING_MODES.findIndex((m) => m.id === selectedListeningMode);
                  const nextId = LISTENING_MODES[(idx + 1) % LISTENING_MODES.length].id;
                  handleSelectListeningMode(nextId);
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14141E]/75 hover:bg-[#1C1C2A]/90 border border-[#28283C] hover:border-white/25 text-xs font-mono-custom text-white/80 shadow-inner cursor-pointer transition-all active:scale-95 group"
                title="Click to cycle Listening Mode"
              >
                <ModeIcon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: activeTheme.accentColor }} />
                <span className="font-medium text-white/90 tracking-tight">
                  {currentModeObj.pillGreeting || currentModeObj.shortTitle}
                </span>
              </button>
            );
          })()}

          {/* Live Transmission Badge (Hidden on mobile to prioritize clean layout) */}
          <div className="hidden xl:flex px-3 py-1 rounded-full bg-[#14141E]/80 border border-[#28283C] shadow-inner items-center gap-2 text-xs font-mono-custom">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider text-[11px]">
              LIVE TRANSMISSION
            </span>
          </div>
        </div>

        {/* Right Action Zone: Visualizer Mode + Fullscreen + Primary Play/Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Visualizer Mode Toggle */}
          <button
            onClick={() => {
              ambientAudio.playTunerClick();
              setIsVisualizerMode(!isVisualizerMode);
            }}
            className="touch-target-comfort-h px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 hover:text-white transition-all cursor-pointer text-[10px] sm:text-xs font-mono-custom flex items-center gap-1 sm:gap-1.5"
            title={isVisualizerMode ? 'Switch to Vintage Boombox View' : 'Switch to D3 Spectrum Visualizer'}
          >
            <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: activeTheme.accentColor }} />
            <span className="hidden sm:inline">{isVisualizerMode ? 'BOOMBOX' : 'SPECTRUM'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer hidden sm:flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Broadcast Play / Pause Primary Action */}
          <button
            onClick={handlePlayPause}
            className="touch-target-comfort-h px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-mono-custom font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 text-black shrink-0"
            style={{
              backgroundColor: activeTheme.accentColor,
              boxShadow: `0 0 16px ${activeTheme.glowColor}`,
            }}
          >
            {track.isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />}
            <span className="hidden xs:inline">{track.isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
        </div>
      </header>

      {/* Main Experience Hero Surface */}
      <main className={`relative z-20 flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pt-3 sm:pt-5 pb-36 sm:pb-28 gap-2 sm:gap-3 transition-opacity duration-700 ${
        atmosphere.nightDriveMode ? 'opacity-90' : 'opacity-100'
      }`}>
        
        {/* Giant Watermark Background Typography "MIXED" "SIGNALS" behind the player */}
        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-12 pointer-events-none select-none overflow-hidden -z-10 opacity-20 sm:opacity-35">
          <span className="font-display-custom text-[11vw] sm:text-[16vw] font-black tracking-tighter text-white/[0.08] sm:text-white/[0.12] leading-none">
            MIXED
          </span>
          <span className="font-display-custom text-[11vw] sm:text-[16vw] font-black tracking-tighter text-white/[0.08] sm:text-white/[0.12] leading-none text-right">
            SIGNALS
          </span>
        </div>

        {/* Editorial Hero Title Section */}
        <div className="text-center max-w-6xl w-full mx-auto px-1 sm:px-4">
          
          {/* Micro Terminal Tags */}
          <div className="inline-flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-0.5 rounded-full bg-[#121218]/65 border border-[#242436]/70 text-[9.5px] sm:text-[11px] font-mono-custom text-[#888] mb-1.5 shadow-md backdrop-blur-md max-w-full">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: activeTheme.accentColor }} />
            <span className="font-semibold shrink-0" style={{ color: activeTheme.accentColor }}>SIGNAL 98.6 FM</span>
            <span className="text-white/20">|</span>
            <span className="text-white/90 uppercase truncate max-w-[120px] sm:max-w-none">{activeTheme.genreTag}</span>
            <span className="text-white/20">|</span>
            <span className="text-cyan-400 font-bold uppercase shrink-0">MADE BY AKASH KUMAR</span>
          </div>

          {/* Signature Dual-Tier Typography: Outlined Neon "MIXED" + Luxury Serif "SIGNALS." with Audio-Reactive Glow & Floating Drift */}
          <HeroTitleLogo 
            activeTheme={activeTheme} 
            track={track} 
            volume={volume}
            isMuted={isMuted}
            onUnmute={() => {
              setIsMuted(false);
              setVolume(80);
              if (playerRef.current?.unMute) {
                playerRef.current.unMute();
              }
              if (playerRef.current?.setVolume) {
                playerRef.current.setVolume(80);
              }
            }}
          />
        </div>

        {/* Rotating Poetic Quotes */}
        <div className="w-full max-w-2xl mx-auto">
          <RotatingQuotes isPlaying={track.isPlaying} activeTheme={activeTheme} />
        </div>

        {/* Central Visual Masterpiece: Spotify Broadcast OR Minimalist D3 Frequency Visualizer OR Analog Boombox */}
        {streamConfig.type === 'spotify' && streamConfig.spotifyUrl ? (
          <div className="w-full max-w-2xl sm:max-w-3xl mx-auto bg-[#121218]/80 backdrop-blur-lg border border-[#262633] rounded-xl p-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#222230] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
                <span className="text-xs font-bold font-mono-custom text-white uppercase tracking-wider">
                  SPOTIFY BROADCAST MODE
                </span>
              </div>
              <button 
                onClick={() => handleSaveStreamConfig({
                  type: 'playlist',
                  playlistId: 'PLW1q_FRwhNUM',
                  customVideoIds: [],
                  activePresetTitle: 'Mixed Signals Vol. 1 (Signature)',
                })}
                className="text-xs text-[#06B6D4] hover:underline font-mono-custom cursor-pointer"
              >
                Switch back to Radio FM
              </button>
            </div>
            <iframe
              src={extractSpotifyEmbedUrl(streamConfig.spotifyUrl)}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg shadow-inner bg-black"
            />
          </div>
        ) : isVisualizerMode ? (
          <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <D3FrequencyVisualizer
              isPlaying={track.isPlaying}
              activeTheme={activeTheme}
              track={track}
              onToggleBoomboxView={() => setIsVisualizerMode(false)}
              onToggleFullScreen={() => setIsFullScreenVisualizer(!isFullScreenVisualizer)}
              isExpandedFullScreen={isFullScreenVisualizer}
            />
          </div>
        ) : (
          <AnalogBoombox
            track={track}
            activeTheme={activeTheme}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onToggleShuffle={handleToggleShuffle}
            isShuffle={isShuffle}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            tapeHissEnabled={atmosphere.tapeHiss}
            onToggleTapeHiss={() => setAtmosphere((prev) => ({ ...prev, tapeHiss: !prev.tapeHiss }))}
            upNextTracks={upNextTracks}
            journal={signalJournal}
            sessionFormattedTime={sessionFormattedTime}
            signalsCaughtCount={signalsCaughtCount}
            onSelectTrackIndex={handleSelectTrackIndex}
            onResetSession={() => setSessionSeconds(0)}
            onOpenSessionSummary={() => setIsSessionSummaryOpen(true)}
          />
        )}

        {/* Smart Compact Atmosphere Bar */}
        <AtmosphereControls
          settings={atmosphere}
          activeTheme={activeTheme}
          onToggleScanlines={() => setAtmosphere((prev) => ({ ...prev, scanlines: !prev.scanlines }))}
          onToggleTapeHiss={() => setAtmosphere((prev) => ({ ...prev, tapeHiss: !prev.tapeHiss }))}
          onToggleRain={() => setAtmosphere((prev) => ({ ...prev, rainAmbience: !prev.rainAmbience }))}
          onToggleNightDrive={() => setAtmosphere((prev) => ({ ...prev, nightDriveMode: !prev.nightDriveMode }))}
          onChangeRainVolume={(volume) => setAtmosphere((prev) => ({ ...prev, rainVolume: volume }))}
          onChangeRainIntensity={(level) => setAtmosphere((prev) => ({ ...prev, rainIntensityLevel: level }))}
          onShuffleWallpaper={handleShuffleWallpaper}
          onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
          onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
          weatherTone={weatherTone}
          currentTrack={track}
          isVisualizerMode={isVisualizerMode}
          onToggleVisualizerMode={() => setIsVisualizerMode(!isVisualizerMode)}
        />

        {/* Dynamic Vibe & Artwork Themes Deck for Mixed Playlist Genres */}
        <ThemeVibeDeck
          themes={VIBE_THEMES}
          activeTheme={activeTheme}
          onSelectTheme={handleSelectTheme}
          track={track}
        />

        {/* Nostalgic Memory Notes & Real-time Live Micro Details */}
        <VibeNotes 
          track={track} 
          activeTheme={activeTheme} 
          liveTime={liveTime} 
          onlineListeners={onlineListeners} 
          onSpaceHintClick={handlePlayPause} 
          selectedModeId={selectedListeningMode}
          onSelectListeningMode={handleSelectListeningMode}
        />

      </main>

      {/* Dedicated Immersive Fullscreen D3 Visualizer Modal */}
      {isFullScreenVisualizer && (
        <div className="fixed inset-0 z-50 bg-[#06060A]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-fade-in">
          {/* Top bar in fullscreen */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span 
                className="w-3 h-3 rounded-full animate-ping"
                style={{ backgroundColor: activeTheme.accentColor }} 
              />
              <div>
                <span className="font-display-custom text-lg font-black tracking-widest text-white uppercase block">
                  MIXED SIGNALS — 98.6 FM
                </span>
                <span className="text-xs font-mono-custom text-white/50">
                  {activeTheme.name} • {activeTheme.genreTag}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsFullScreenVisualizer(false)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Exit Fullscreen
            </button>
          </div>

          {/* Expanded D3 canvas in center */}
          <div className="my-auto w-full max-w-6xl mx-auto py-8">
            <D3FrequencyVisualizer
              isPlaying={track.isPlaying}
              activeTheme={activeTheme}
              track={track}
              isExpandedFullScreen={true}
              onToggleFullScreen={() => setIsFullScreenVisualizer(false)}
            />
          </div>

          {/* Bottom metadata */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono-custom text-white/60">
            <div className="flex items-center gap-2">
              <span className="text-white/40">NOW PLAYING:</span>
              <span className="text-white font-bold">{track.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{weatherTone?.cityName} ({weatherTone?.temperatureC}°C)</span>
              <span className="text-emerald-400 font-bold">● SIGNAL ACTIVE • 98.6 FM</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Signature Badge: "created by Akash Kumar | 🎵 [Song Title]" */}
      <div 
        className="fixed bottom-28 sm:bottom-22 right-3 sm:right-8 z-30 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0E0E16]/85 backdrop-blur-xl border border-[#2B2B3E]/80 shadow-2xl hover:border-[#4B4B6E] hover:bg-[#12121E]/95 transition-all duration-300 group select-none pointer-events-auto max-w-[90vw] sm:max-w-md"
        style={{
          boxShadow: `0 8px 25px rgba(0,0,0,0.5), 0 0 15px ${activeTheme.glowColor}`,
        }}
      >
        <span 
          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${track.isPlaying ? 'animate-ping' : 'opacity-80'}`}
          style={{ backgroundColor: activeTheme.accentColor }} 
        />
        <span className="text-[10px] sm:text-xs font-mono-custom font-bold text-white tracking-wide whitespace-nowrap shrink-0">
          created by <span style={{ color: activeTheme.accentColor }}>Akash Kumar</span>
        </span>
        <span className="text-white/20 font-mono-custom shrink-0">|</span>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono-custom text-white/85 min-w-0 flex-1 truncate">
          <span className="text-xs shrink-0">🎵</span>
          <span className="truncate font-medium block">{getCleanShortSongTitle(track.title)}</span>
        </div>
      </div>

      {/* Fixed Bottom Retro Radio Console */}
      <PlayerBar
        track={track}
        activeTheme={activeTheme}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isShuffle={isShuffle}
        onToggleShuffle={handleToggleShuffle}
        isRepeat={isRepeat}
        onToggleRepeat={handleToggleRepeat}
        isSpotifySaved={spotifyService.isTrackSaved(track.title)}
        onToggleSpotifySave={handleToggleSpotifySave}
        onOpenSpotifyModal={() => setIsSpotifyModalOpen(true)}
      />

      {/* Spotify Sync & OAuth Playlist Modal */}
      <SpotifyModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        activeTheme={activeTheme}
        currentTrack={track}
        authState={spotifyAuthState}
        onAuthChange={setSpotifyAuthState}
        onSaveCurrentTrack={handleToggleSpotifySave}
      />

      {/* Live Atmospheric Weather & Visual Tone Modal */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        currentWeather={weatherTone}
        onSelectPreset={handleSelectWeatherPreset}
        isAutoSync={isAutoWeatherSync}
        onToggleAutoSync={handleToggleAutoWeatherSync}
        activeTheme={activeTheme}
      />

      {/* Session Telemetry & Statistics Summary Modal */}
      <SessionSummaryModal
        isOpen={isSessionSummaryOpen}
        onClose={() => setIsSessionSummaryOpen(false)}
        signalsCaughtCount={signalsCaughtCount}
        sessionFormattedTime={sessionFormattedTime}
        totalSessionSeconds={sessionSeconds}
        journal={signalJournal}
        activeTheme={activeTheme}
        rainAmbienceActive={atmosphere.rainAmbience}
        tapeHissActive={atmosphere.tapeHiss}
        nightDriveActive={atmosphere.nightDriveMode}
        onSelectTrackIndex={handleSelectTrackIndex}
      />

      {/* Admin Playlist / Stream Management Modal */}
      <AdminPlaylistModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentConfig={streamConfig}
        onSaveConfig={handleSaveStreamConfig}
      />

    </div>
  );
}
