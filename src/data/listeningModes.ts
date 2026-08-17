import React from 'react';
import { Headphones, Car, Moon, Volume2 } from 'lucide-react';
import { ListeningModeType } from '../types';

export interface ListeningModeOption {
  id: ListeningModeType;
  title: string;
  shortTitle: string;
  sublabel: string;
  pillGreeting: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  indicator: string;
}

export const LISTENING_MODES: ListeningModeOption[] = [
  {
    id: 'headphones',
    title: 'HEADPHONES ON',
    shortTitle: 'Headphones Focus',
    sublabel: 'Binaural Stereo Focus',
    pillGreeting: 'Headphones on. World off.',
    icon: Headphones,
    indicator: 'STEREO FOCUS ACTIVE',
  },
  {
    id: 'drive',
    title: 'LATE NIGHT DRIVE',
    shortTitle: 'Late Night Drive',
    sublabel: 'Night Velocity Soundscape',
    pillGreeting: 'Late night traveler',
    icon: Car,
    indicator: 'VELOCITY ROAD TUNED',
  },
  {
    id: 'background',
    title: 'BACKGROUND LISTENING',
    shortTitle: 'Background Listening',
    sublabel: 'Ambient Low-Profile',
    pillGreeting: 'Ambient midnight drift',
    icon: Moon,
    indicator: 'AMBIENT PROFILE',
  },
  {
    id: 'speaker',
    title: 'SPEAKER MODE',
    shortTitle: 'Speaker Mode',
    sublabel: 'Open Room Acoustics',
    pillGreeting: 'Room acoustics unlocked',
    icon: Volume2,
    indicator: 'ROOM ACOUSTICS',
  },
];

export const getListeningModeById = (id: ListeningModeType): ListeningModeOption => {
  return LISTENING_MODES.find((m) => m.id === id) || LISTENING_MODES[0];
};
