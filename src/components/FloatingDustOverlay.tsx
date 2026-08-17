import React, { useMemo } from 'react';
import { VibeTheme } from '../types';

interface FloatingDustOverlayProps {
  isPlaying: boolean;
  activeTheme?: VibeTheme;
}

interface DustParticle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

export const FloatingDustOverlay: React.FC<FloatingDustOverlayProps> = ({ isPlaying, activeTheme }) => {
  // Generate a fixed set of randomized dust motes
  const particles = useMemo(() => {
    const items: DustParticle[] = [];
    const count = 36;

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        left: `${(Math.random() * 100).toFixed(2)}%`,
        top: `${(Math.random() * 100).toFixed(2)}%`,
        size: Math.random() < 0.3 ? 2.2 : Math.random() < 0.7 ? 1.6 : 1.0,
        duration: 14 + Math.random() * 22,
        delay: -(Math.random() * 20),
        driftX: (Math.random() - 0.5) * 80,
        driftY: -40 - Math.random() * 100,
        opacity: 0.15 + Math.random() * 0.45,
      });
    }
    return items;
  }, []);

  const glow = activeTheme?.glowColor || 'rgba(6, 182, 212, 0.4)';

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white dust-particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: 'blur(0.4px)',
            boxShadow: `0 0 ${p.size * 3}px ${glow}`,
            animationDuration: `${isPlaying ? p.duration * 0.8 : p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `translate3d(0, 0, 0)`,
          }}
        />
      ))}
    </div>
  );
};
