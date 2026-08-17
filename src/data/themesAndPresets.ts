import { VibeTheme } from '../types';

export const VIBE_THEMES: VibeTheme[] = [
  {
    id: 'night-drive',
    name: 'Midnight Synth',
    subtitle: 'Late-night music room, neon city skyline & moonlit window',
    genreTag: 'MIDNIGHT SYNTH / DRIVE',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop',
    accentColor: '#06B6D4', // Vibrant Cyber Cyan
    glowColor: 'rgba(6, 182, 212, 0.38)',
    rainDefault: false,
  },
  {
    id: 'rainy-tokyo',
    name: 'Rain on Glass',
    subtitle: 'Rain-streaked window, blurred city neon & cozy desk reflection',
    genreTag: 'LO-FI / AMBIENT RAIN',
    image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2560&auto=format&fit=crop',
    accentColor: '#38BDF8', // Crisp Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.38)',
    rainDefault: true,
  },
  {
    id: 'vintage-cassette',
    name: 'Cassette Lounge',
    subtitle: 'Warm analog room, cassette shelves, tape warmth & wooden desk',
    genreTag: 'ANALOG CHILL / INDIE',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2560&auto=format&fit=crop',
    accentColor: '#10B981', // Retro Mint Emerald
    glowColor: 'rgba(16, 185, 129, 0.38)',
    rainDefault: false,
  },
  {
    id: 'sunset-coastal',
    name: 'Sunset Highway',
    subtitle: 'Twilight coastal road, winding asphalt & mountain sunset haze',
    genreTag: 'VINTAGE POP / NOSTALGIA',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2560&auto=format&fit=crop',
    accentColor: '#F43F5E', // Dusk Rose Coral
    glowColor: 'rgba(244, 63, 94, 0.38)',
    rainDefault: false,
  },
  {
    id: 'vinyl-bedroom',
    name: 'Midnight Vinyl',
    subtitle: 'Late night vinyl sanctuary, spinning turntable & warm lamp',
    genreTag: 'DOWNTEMPO / JAZZ HOP',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2560&auto=format&fit=crop',
    accentColor: '#A78BFA', // Dreamy Lavender Violet
    glowColor: 'rgba(167, 139, 250, 0.38)',
    rainDefault: false,
  },
];

export interface PlaylistPreset {
  id: string;
  name: string;
  description: string;
  playlistId: string;
  badge: string;
}

export const PLAYLIST_PRESETS: PlaylistPreset[] = [
  {
    id: 'default-mixed',
    name: 'Mixed Signals Vol. 1 (Signature)',
    description: 'Eclectic midnight gems, nostalgia beats & late night radio tunes',
    playlistId: 'PLW1q_FRwhNUM',
    badge: 'DEFAULT',
  },
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill & Night Study',
    description: 'Relaxing ambient beats, vinyl pops and mellow keyboards',
    playlistId: 'PLOzDu-MXXL3jkvdV2Wq9i6Wk8aDk3b6QZ',
    badge: 'CHILL',
  },
  {
    id: 'retro-synth',
    name: 'Retro Synthwave & Night Drive',
    description: 'Outrun arpeggios, analog basslines and neon 80s nostalgia',
    playlistId: 'PL3-sRm8425NMTX22uQpXkGqG2R7Y0U_Yp',
    badge: 'RETRO',
  },
  {
    id: 'indie-midnight',
    name: 'Indie Late Night Road Trip',
    description: 'Dream pop, warm acoustic guitars & contemplative melodies',
    playlistId: 'PL6NdkXsVQ17L44Z3jJbN5r6Vq-E58G00F',
    badge: 'INDIE',
  },
];
