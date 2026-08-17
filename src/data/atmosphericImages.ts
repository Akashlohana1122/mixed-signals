// Curated static collection of aesthetic Lo-Fi, Anime, Retro, Night Drive, and Rainy Room wallpapers

export interface AtmosphericWallpaper {
  id: string;
  title: string;
  url: string;
  vibeTag: string;
}

export interface ThemedImageLibrary {
  [themeId: string]: string[];
}

export const ALL_WALLPAPERS: AtmosphericWallpaper[] = [
  {
    id: 'lofi-bedroom-rain',
    title: 'Cozy Lo-Fi Anime Bedroom & Rainy Window',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'LO-FI BEDROOM',
  },
  {
    id: 'midnight-neon-drive',
    title: 'Cyberpunk Neon Highway Drive',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'NIGHT DRIVE',
  },
  {
    id: 'rainy-tokyo-neon',
    title: 'Rain on Tokyo Glass & Neon Bokeh',
    url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'RAINY CITY',
  },
  {
    id: 'vinyl-chill-room',
    title: 'Late Night Turntable & Warm Amber Lamp',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'VINYL LOUNGE',
  },
  {
    id: 'retro-synth-car',
    title: 'Retro Classic Dashboard & Twilight Skyline',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'SYNTHWAVE',
  },
  {
    id: 'tokyo-shinjuku-rain',
    title: 'Shinjuku Neon Reflections in the Rain',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'TOKYO RAIN',
  },
  {
    id: 'cozy-desk-study',
    title: 'Midnight Lo-Fi Study Desk with Headphones',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'CHILL STUDY',
  },
  {
    id: 'dusk-sunset-haze',
    title: 'Sunset Coastal Highway & Palm Haze',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'SUNSET DUSK',
  },
  {
    id: 'foggy-window-night',
    title: 'Midnight Rain Droplets & Distant City Lights',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'RAIN ON GLASS',
  },
  {
    id: 'analog-reel-tape',
    title: 'Vintage Analog Reel-to-Reel Glow',
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'ANALOG CHILL',
  },
  {
    id: 'purple-cyber-city',
    title: 'Electric Violet Skyline & Late Night Vibe',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'CYBER VIOLET',
  },
  {
    id: 'cyber-highway-speed',
    title: 'Tokyo Metropolitan Expressway Neon Trails',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'MIDNIGHT HIGHWAY',
  },
  {
    id: 'moody-tokyo-night-tower',
    title: 'Tokyo Midnight Silhouette & Horizon Glow',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'TOKYO TOWER',
  },
  {
    id: 'cozy-candle-coffee',
    title: 'Warm Candle Coffee Station on Rainy Evening',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'COZY CAFE',
  },
  {
    id: 'synthwave-grid-night',
    title: 'Midnight Tunnel Lights & Red Taillights',
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop',
    vibeTag: 'NIGHT TUNNEL',
  },
];

export const ATMOSPHERIC_IMAGE_LIBRARY: ThemedImageLibrary = {
  'night-drive': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2560&auto=format&fit=crop',
  ],
  'rainy-tokyo': [
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=2560&auto=format&fit=crop',
  ],
  'vintage-cassette': [
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=2560&auto=format&fit=crop',
  ],
  'sunset-coastal': [
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2560&auto=format&fit=crop',
  ],
  'vinyl-bedroom': [
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2560&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=2560&auto=format&fit=crop',
  ],
};
