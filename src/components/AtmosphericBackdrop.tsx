import React, { useState, useEffect, useMemo, useRef } from 'react';
import { VibeTheme } from '../types';
import { ATMOSPHERIC_IMAGE_LIBRARY } from '../data/atmosphericImages';
import { WeatherToneData } from '../services/weatherService';

interface AtmosphericBackdropProps {
  activeTheme: VibeTheme;
  isPlaying: boolean;
  trackId?: string;
  forcedWallpaperUrl?: string | null;
  weatherTone?: WeatherToneData | null;
  onCycleWallpaper?: (url: string) => void;
}

interface SceneColorGrading {
  filter: string;
  midgroundGlow: string;
  lampGlow: string;
  ambientVibe: string;
}

const SCENE_COLOR_GRADINGS: Record<string, SceneColorGrading> = {
  'night-drive': {
    filter: 'contrast(1.18) saturate(1.22) brightness(1.02)',
    midgroundGlow: 'radial-gradient(ellipse 80% 50% at 50% 25%, rgba(6, 182, 212, 0.28) 0%, transparent 70%)',
    lampGlow: 'radial-gradient(circle at 16% 36%, rgba(245, 158, 11, 0.32) 0%, rgba(245, 158, 11, 0.08) 42%, transparent 65%)',
    ambientVibe: 'rgba(6, 182, 212, 0.08)',
  },
  'rainy-tokyo': {
    filter: 'contrast(1.15) saturate(1.18) brightness(1.0)',
    midgroundGlow: 'radial-gradient(ellipse 80% 55% at 50% 20%, rgba(56, 189, 248, 0.26) 0%, transparent 75%)',
    lampGlow: 'radial-gradient(circle at 18% 38%, rgba(251, 191, 36, 0.24) 0%, rgba(251, 191, 36, 0.06) 40%, transparent 60%)',
    ambientVibe: 'rgba(56, 189, 248, 0.08)',
  },
  'vintage-cassette': {
    filter: 'contrast(1.16) saturate(1.15) sepia(0.16) brightness(1.02)',
    midgroundGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(245, 158, 11, 0.26) 0%, transparent 75%)',
    lampGlow: 'radial-gradient(circle at 20% 35%, rgba(251, 146, 60, 0.35) 0%, rgba(217, 119, 6, 0.12) 45%, transparent 68%)',
    ambientVibe: 'rgba(245, 158, 11, 0.1)',
  },
  'sunset-coastal': {
    filter: 'contrast(1.16) saturate(1.26) hue-rotate(4deg) brightness(1.04)',
    midgroundGlow: 'radial-gradient(ellipse 90% 55% at 50% 35%, rgba(244, 63, 94, 0.28) 0%, rgba(251, 146, 60, 0.15) 50%, transparent 80%)',
    lampGlow: 'radial-gradient(circle at 15% 35%, rgba(251, 146, 60, 0.3) 0%, transparent 55%)',
    ambientVibe: 'rgba(244, 63, 94, 0.09)',
  },
  'vinyl-bedroom': {
    filter: 'contrast(1.18) saturate(1.2) hue-rotate(265deg) brightness(1.0)',
    midgroundGlow: 'radial-gradient(ellipse 85% 60% at 50% 25%, rgba(167, 139, 250, 0.25) 0%, transparent 75%)',
    lampGlow: 'radial-gradient(circle at 18% 36%, rgba(251, 191, 36, 0.3) 0%, rgba(167, 139, 250, 0.08) 45%, transparent 65%)',
    ambientVibe: 'rgba(167, 139, 250, 0.09)',
  },
};

interface ImageLayerState {
  url: string;
  themeId: string;
  key: string;
  isReady: boolean;
}

export const AtmosphericBackdrop: React.FC<AtmosphericBackdropProps> = ({
  activeTheme,
  isPlaying,
  trackId,
  forcedWallpaperUrl,
  weatherTone,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Parallax physics state
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  const rafRef = useRef<number | null>(null);

  // Theme image library selection
  const themeImages = useMemo(() => {
    const list = ATMOSPHERIC_IMAGE_LIBRARY[activeTheme.id];
    if (list && list.length > 0) return list;
    return [activeTheme.image];
  }, [activeTheme]);

  const activeImageUrl = forcedWallpaperUrl || themeImages[currentImageIndex] || activeTheme.image;

  // Scene-specific color grading definition
  const sceneGrading = useMemo(() => {
    return SCENE_COLOR_GRADINGS[activeTheme.id] || SCENE_COLOR_GRADINGS['night-drive'];
  }, [activeTheme.id]);

  // Dual-Layer Seamless Cross-Fade State
  // primaryLayer is currently visible; secondaryLayer handles outgoing or incoming cross-fading
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [layerA, setLayerA] = useState<ImageLayerState>({
    url: activeImageUrl,
    themeId: activeTheme.id,
    key: `layer-a-${activeImageUrl}`,
    isReady: true,
  });
  const [layerB, setLayerB] = useState<ImageLayerState>({
    url: activeImageUrl,
    themeId: activeTheme.id,
    key: `layer-b-${activeImageUrl}`,
    isReady: true,
  });

  // Preload and smoothly cross-fade between layers on theme or wallpaper change
  useEffect(() => {
    const currentTargetUrl = activeImageUrl;
    const currentActiveUrl = activeLayer === 'A' ? layerA.url : layerB.url;

    if (currentTargetUrl === currentActiveUrl) {
      return;
    }

    // Preload incoming image in background
    const img = new Image();
    img.src = currentTargetUrl;

    const handleLoaded = () => {
      if (activeLayer === 'A') {
        // Prepare layer B and switch active layer to B
        setLayerB({
          url: currentTargetUrl,
          themeId: activeTheme.id,
          key: `layer-b-${Date.now()}`,
          isReady: true,
        });
        setActiveLayer('B');
      } else {
        // Prepare layer A and switch active layer to A
        setLayerA({
          url: currentTargetUrl,
          themeId: activeTheme.id,
          key: `layer-a-${Date.now()}`,
          isReady: true,
        });
        setActiveLayer('A');
      }
    };

    if (img.complete) {
      handleLoaded();
    } else {
      img.onload = handleLoaded;
      img.onerror = handleLoaded; // Fallback so transition still occurs
    }
  }, [activeImageUrl, activeTheme.id, activeLayer, layerA.url, layerB.url]);

  // Detect touch / mobile devices for automatic drift fallback
  useEffect(() => {
    const checkTouch = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch, { passive: true });
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Auto-cycle within library on track change if wallpaper isn't manually locked
  useEffect(() => {
    if (forcedWallpaperUrl) return;

    const timer = setTimeout(() => {
      setCurrentImageIndex((prev) => {
        if (themeImages.length <= 1) return 0;
        let next = Math.floor(Math.random() * themeImages.length);
        if (next === prev) next = (prev + 1) % themeImages.length;
        return next;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTheme.id, trackId, themeImages.length, forcedWallpaperUrl]);

  // Desktop Mouse Parallax Loop with Smooth Inertia
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      mouseRef.current.targetX = nx * 18;
      mouseRef.current.targetY = ny * 12;
    };

    const animate = () => {
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.055;
      m.currentY += (m.targetY - m.currentY) * 0.055;
      setParallax({ x: m.currentX, y: m.currentY });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouchDevice]);

  // Weather-specific multipliers
  const weatherFilter = weatherTone?.visualTone.overlayFilter || '';
  const weatherBrightness = weatherTone?.visualTone.brightness ?? 1.0;
  const weatherTint = weatherTone?.visualTone.ambientTint || 'transparent';

  // Parallax Layer Transforms:
  const bgTransform = isTouchDevice 
    ? undefined 
    : `translate3d(${-parallax.x * 0.35}px, ${-parallax.y * 0.35}px, 0)`;

  const midTransform = isTouchDevice 
    ? undefined 
    : `translate3d(${-parallax.x * 0.7}px, ${-parallax.y * 0.7}px, 0)`;

  const fgTransform = isTouchDevice 
    ? undefined 
    : `translate3d(${-parallax.x * 1.15}px, ${-parallax.y * 1.15}px, 0)`;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#06060A]" aria-hidden="true">
      
      {/* ========================================================================= */}
      {/* DUAL-BUFFER CINEMATIC SOFT CROSS-FADE SYSTEM                             */}
      {/* ========================================================================= */}
      
      {/* Layer A */}
      <div 
        className={`absolute inset-[-25px] transition-all duration-[1400ms] ease-in-out z-0 ${
          activeLayer === 'A' ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] blur-[2px]'
        } ${isTouchDevice ? 'animate-cinematic-drift' : ''}`}
        style={{
          transform: bgTransform,
          willChange: 'transform, opacity, filter',
        }}
      >
        <img
          key={layerA.key}
          src={layerA.url}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-[1400ms] ease-out ${
            isPlaying && !isTouchDevice ? 'scale-105 animate-ken-burns' : 'scale-100'
          }`}
          style={{
            filter: `${(SCENE_COLOR_GRADINGS[layerA.themeId] || sceneGrading).filter} brightness(${1.02 * weatherBrightness}) ${weatherFilter}`,
            transition: 'filter 1.4s ease, transform 1.4s ease',
          }}
        />
      </div>

      {/* Layer B */}
      <div 
        className={`absolute inset-[-25px] transition-all duration-[1400ms] ease-in-out z-0 ${
          activeLayer === 'B' ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-[1.02] blur-[2px]'
        } ${isTouchDevice ? 'animate-cinematic-drift' : ''}`}
        style={{
          transform: bgTransform,
          willChange: 'transform, opacity, filter',
        }}
      >
        <img
          key={layerB.key}
          src={layerB.url}
          alt=""
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-[1400ms] ease-out ${
            isPlaying && !isTouchDevice ? 'scale-105 animate-ken-burns' : 'scale-100'
          }`}
          style={{
            filter: `${(SCENE_COLOR_GRADINGS[layerB.themeId] || sceneGrading).filter} brightness(${1.02 * weatherBrightness}) ${weatherFilter}`,
            transition: 'filter 1.4s ease, transform 1.4s ease',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: MIDGROUND (Soft Volumetric Glows & Weather Tint Transitions)     */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-[1400ms] ease-in-out z-10"
        style={{
          background: sceneGrading.midgroundGlow,
          transform: midTransform,
        }}
      />

      {/* Volumetric Warm Lamp Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-[1400ms] ease-in-out z-10"
        style={{
          background: sceneGrading.lampGlow,
          transform: fgTransform,
        }}
      />

      {/* Weather Tone Ambient Tint Layer */}
      {weatherTint !== 'transparent' && (
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-[1400ms] ease-in-out z-10"
          style={{ backgroundColor: weatherTint }}
        />
      )}

      {/* Dynamic Theme Atmospheric Gradient Wash */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-[1400ms] ease-in-out z-10"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${sceneGrading.ambientVibe} 0%, transparent 80%)`,
        }}
      />

      {/* Deep Edge Vignette - framing the cockpit aesthetic */}
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none z-20 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06060A] via-transparent to-[#06060A]/60 pointer-events-none z-20" />

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-40 z-30 mix-blend-overlay" />
    </div>
  );
};
