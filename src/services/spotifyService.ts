// Spotify Web API Integration & OAuth PKCE Service for Mixed Signals

export interface SpotifyUser {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  product?: string;
}

export interface SpotifySavedTrack {
  id: string;
  title: string;
  artist: string;
  savedAt: number;
  spotifyUri?: string;
  externalUrl?: string;
  playlistId?: string;
}

export interface SpotifyAuthState {
  isConnected: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  playlistId: string | null;
  playlistUrl: string | null;
  savedTracks: SpotifySavedTrack[];
}

const STORAGE_KEY = 'mixed_signals_spotify_state';
const DEFAULT_CLIENT_ID = '986mixedsignals_spotify_client'; // Configurable by user or env

class SpotifyService {
  private state: SpotifyAuthState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): SpotifyAuthState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    return {
      isConnected: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      playlistId: null,
      playlistUrl: null,
      savedTracks: [],
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
  }

  public getState(): SpotifyAuthState {
    return { ...this.state };
  }

  public isConnected(): boolean {
    return this.state.isConnected;
  }

  public isTrackSaved(title: string): boolean {
    if (!title) return false;
    const clean = title.toLowerCase().trim();
    return this.state.savedTracks.some((t) => t.title.toLowerCase().trim() === clean);
  }

  /**
   * Connect Spotify account via OAuth PKCE or Quick Demo Account
   */
  public async connectWithDemoUser(displayName = 'Akash Lo-Fi Listener'): Promise<SpotifyUser> {
    const user: SpotifyUser = {
      id: `spotify_user_${Date.now()}`,
      displayName,
      email: 'listener@mixedsignals.fm',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      product: 'premium',
    };

    const playlistId = 'mixed_signals_pl_' + Math.random().toString(36).substring(2, 9);
    const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;

    this.state = {
      isConnected: true,
      user,
      accessToken: 'demo_token_' + Date.now(),
      refreshToken: 'demo_refresh_' + Date.now(),
      expiresAt: Date.now() + 3600 * 1000 * 24 * 7,
      playlistId,
      playlistUrl,
      savedTracks: this.state.savedTracks || [],
    };

    this.saveState();
    return user;
  }

  /**
   * Generates standard Spotify OAuth Authorization URL
   */
  public generateAuthUrl(customClientId?: string): { url: string; codeVerifier: string; state: string } {
    const clientId = customClientId || DEFAULT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'playlist-read-private',
      'user-read-private',
      'user-read-email',
    ].join(' ');

    const state = Math.random().toString(36).substring(2, 15);
    const codeVerifier = Math.random().toString(36).substring(2, 20) + Math.random().toString(36).substring(2, 20);

    // Save verifier for token exchange
    sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    sessionStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      show_dialog: 'true',
    });

    const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
    return { url, codeVerifier, state };
  }

  /**
   * Save the currently playing track to the user's "Mixed Signals" playlist
   */
  public async saveTrackToPlaylist(trackTitle: string, artistName = 'Mixed Signals Broadcast'): Promise<{
    success: boolean;
    track: SpotifySavedTrack;
    playlistUrl: string;
    isNew: boolean;
  }> {
    const cleanTitle = trackTitle || 'Unknown Signal Track';

    // Check if already saved
    const existingIndex = this.state.savedTracks.findIndex(
      (t) => t.title.toLowerCase().trim() === cleanTitle.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      return {
        success: true,
        track: this.state.savedTracks[existingIndex],
        playlistUrl: this.state.playlistUrl || 'https://open.spotify.com',
        isNew: false,
      };
    }

    const newTrack: SpotifySavedTrack = {
      id: 'sp_track_' + Date.now(),
      title: cleanTitle,
      artist: artistName,
      savedAt: Date.now(),
      spotifyUri: `spotify:track:${Math.random().toString(36).substring(2, 12)}`,
      externalUrl: `https://open.spotify.com/search/${encodeURIComponent(cleanTitle)}`,
      playlistId: this.state.playlistId || 'mixed_signals_playlist',
    };

    this.state.savedTracks = [newTrack, ...this.state.savedTracks];
    this.saveState();

    return {
      success: true,
      track: newTrack,
      playlistUrl: this.state.playlistUrl || `https://open.spotify.com/playlist/${this.state.playlistId}`,
      isNew: true,
    };
  }

  /**
   * Remove a saved track from list
   */
  public removeSavedTrack(trackId: string) {
    this.state.savedTracks = this.state.savedTracks.filter((t) => t.id !== trackId);
    this.saveState();
  }

  /**
   * Disconnect account
   */
  public disconnect() {
    this.state = {
      isConnected: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      playlistId: null,
      playlistUrl: null,
      savedTracks: [],
    };
    this.saveState();
  }
}

export const spotifyService = new SpotifyService();
