export interface TrackInfo {
  id: string;
  title: string;
  author: string;
  duration: number;
  currentTime: number;
  isBuffering: boolean;
  isPlaying: boolean;
  hasStarted: boolean;
  index: number;
  totalTracks: number;
  thumbnail?: string;
}

export type RainIntensityType = 'drizzle' | 'pour' | 'storm';

export interface AtmosphereSettings {
  scanlines: boolean;
  tapeHiss: boolean;
  rainAmbience: boolean;
  rainVolume: number; // 0.0 to 1.0 (default 0.45)
  rainIntensityLevel: RainIntensityType; // 'drizzle' | 'pour' | 'storm'
  nightDriveMode: boolean; // Dims peripheral UI
  grainIntensity: number;
}

export interface VibeTheme {
  id: string;
  name: string;
  subtitle: string;
  genreTag: string;
  image: string;
  accentColor: string;
  glowColor: string;
  rainDefault: boolean;
}

export interface StreamSourceConfig {
  type: 'playlist' | 'custom_list' | 'spotify';
  playlistId: string;
  customVideoIds: string[];
  activePresetTitle: string;
  spotifyUrl?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  time: string;
  timestamp: number;
  genreTag?: string;
  themeName?: string;
  themeColor?: string;
  duration?: number;
}

export interface SessionGenreStat {
  genre: string;
  count: number;
  percentage: number;
  accentColor?: string;
}

export interface SessionTelemetryStats {
  signalsCaughtCount: number;
  totalSessionSeconds: number;
  averageSessionTrackDurationSeconds: number;
  topGenres: SessionGenreStat[];
  journal: JournalEntry[];
  activeThemeName: string;
  activeGenreTag: string;
}

export interface UpNextTrack {
  index: number;
  id: string;
  title: string;
}

export type ListeningModeType = 'headphones' | 'drive' | 'background' | 'speaker';
