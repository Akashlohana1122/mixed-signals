import React, { useEffect, useRef, useMemo } from 'react';
import { TrackInfo, VibeTheme, RainIntensityType } from '../types';
import { ambientAudio } from '../services/ambientAudio';

interface NightWindowCanvasProps {
  isPlaying: boolean;
  rainEnabled: boolean;
  progress?: number;
  rainIntensity?: number;
  rainIntensityLevel?: RainIntensityType;
  hasThunder?: boolean;
  track?: TrackInfo;
  activeTheme?: VibeTheme;
}

interface BokehLight {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  speed: number;
  pulsePhase: number;
}

interface RainStreak {
  x: number;
  y: number;
  baseLength: number;
  baseSpeedY: number;
  speedX: number;
  alpha: number;
  width: number;
  layer: 'bg' | 'mid' | 'fg';
  phaseOffset: number;
}

interface WindowGlassDrop {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  trailLength: number;
  crawlSpeed: number;
  crawlCooldown: number;
}

// Helper to determine musical tempo (BPM) and baseline energy from track meta
const estimateTrackTempoAndEnergy = (track?: TrackInfo, theme?: VibeTheme): { bpm: number; baseEnergy: number } => {
  if (!track || !track.title) {
    return { bpm: 82, baseEnergy: 0.5 };
  }

  const titleLower = track.title.toLowerCase();
  const genreLower = (theme?.genreTag || '').toLowerCase();

  let bpm = 82; // Default chill late-night lo-fi tempo
  let baseEnergy = 0.5;

  if (titleLower.includes('fast') || titleLower.includes('speed') || titleLower.includes('drum') || titleLower.includes('hyper') || genreLower.includes('drive') || genreLower.includes('synth')) {
    bpm = 124;
    baseEnergy = 0.85;
  } else if (titleLower.includes('slow') || titleLower.includes('ambient') || titleLower.includes('sleep') || titleLower.includes('rain') || genreLower.includes('ambient')) {
    bpm = 68;
    baseEnergy = 0.35;
  } else if (genreLower.includes('pop') || genreLower.includes('disco') || genreLower.includes('funk')) {
    bpm = 112;
    baseEnergy = 0.75;
  } else if (genreLower.includes('jazz') || genreLower.includes('chill') || genreLower.includes('hop')) {
    bpm = 88;
    baseEnergy = 0.55;
  }

  return { bpm, baseEnergy };
};

export const NightWindowCanvas: React.FC<NightWindowCanvasProps> = ({ 
  isPlaying, 
  rainEnabled, 
  progress = 0,
  rainIntensity = 0.5,
  rainIntensityLevel = 'pour',
  hasThunder = false,
  track,
  activeTheme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Track tempo & musical metrics
  const { bpm, baseEnergy } = useMemo(() => {
    return estimateTrackTempoAndEnergy(track, activeTheme);
  }, [track?.title, activeTheme?.genreTag]);

  // Keep references updated for requestAnimationFrame loop without tearing
  const trackRef = useRef({
    isPlaying,
    currentTime: track?.currentTime || 0,
    bpm,
    baseEnergy,
    accentColor: activeTheme?.accentColor || '#06B6D4',
    rainIntensityLevel,
    hasThunder,
    rainEnabled,
  });

  useEffect(() => {
    trackRef.current = {
      isPlaying,
      currentTime: track?.currentTime || 0,
      bpm,
      baseEnergy,
      accentColor: activeTheme?.accentColor || '#06B6D4',
      rainIntensityLevel,
      hasThunder,
      rainEnabled,
    };
  }, [isPlaying, track?.currentTime, bpm, baseEnergy, activeTheme?.accentColor, rainIntensityLevel, hasThunder, rainEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener('resize', handleResize);

    // Warm street and neon bokeh palette
    const colors = [
      'rgba(245, 158, 11, ', // Amber streetlamp
      'rgba(239, 68, 68, ',  // Warm red tail-light
      'rgba(251, 191, 36, ', // Warm Gold
      'rgba(56, 189, 248, ', // Cyber Cyan
      'rgba(168, 85, 247, ', // Neon Violet
    ];

    let bokehLights: BokehLight[] = [];
    let rainStreaks: RainStreak[] = [];
    let glassDrops: WindowGlassDrop[] = [];
    
    // Lightning flash state machine
    let flashAlpha = 0;
    let flashPhase = 0; // 0 = idle, 1 = initial strike, 2 = secondary flicker, 3 = fading
    let nextFlashTime = performance.now() + 5000 + Math.random() * 10000;

    const initElements = () => {
      // 1. Bokeh Lights
      bokehLights = [];
      const lightCount = Math.min(Math.floor(width / 50), 22);
      for (let i = 0; i < lightCount; i++) {
        const baseAlpha = 0.04 + Math.random() * 0.10;
        bokehLights.push({
          x: Math.random() * width,
          y: height * 0.2 + Math.random() * (height * 0.75),
          radius: 28 + Math.random() * 65,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: baseAlpha,
          baseAlpha,
          speed: 0.1 + Math.random() * 0.25,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // 2. High-Visibility Multi-Layer Rain Streaks (Scaled by Rain Intensity Level)
      rainStreaks = [];
      
      // Density multiplier based on intensity level
      let densityMultiplier = 1.0;
      if (rainIntensityLevel === 'drizzle') densityMultiplier = 0.45;
      else if (rainIntensityLevel === 'storm') densityMultiplier = 1.9;

      const effectiveIntensity = rainEnabled ? Math.max(0.7, rainIntensity) : rainIntensity;
      const count = Math.floor((width / 11) * Math.min(3.2, Math.max(0.4, effectiveIntensity * 1.8 * densityMultiplier)));

      for (let i = 0; i < count; i++) {
        const layerRand = Math.random();
        let layer: 'bg' | 'mid' | 'fg' = 'mid';
        
        let speedMultiplier = rainIntensityLevel === 'drizzle' ? 0.65 : rainIntensityLevel === 'storm' ? 1.4 : 1.0;
        let baseSpeedY = (12 + Math.random() * 16) * speedMultiplier;
        let baseLength = (24 + Math.random() * 45) * (rainIntensityLevel === 'drizzle' ? 0.6 : rainIntensityLevel === 'storm' ? 1.35 : 1.0);
        let widthPx = 1.2 + Math.random() * 1.0;
        let alpha = 0.35 + Math.random() * 0.35;

        if (layerRand < 0.35) {
          layer = 'bg';
          baseSpeedY = (18 + Math.random() * 20) * speedMultiplier;
          baseLength = (35 + Math.random() * 60) * (rainIntensityLevel === 'drizzle' ? 0.6 : rainIntensityLevel === 'storm' ? 1.35 : 1.0);
          widthPx = 1.0 + Math.random() * 0.6;
          alpha = 0.20 + Math.random() * 0.25;
        } else if (layerRand > 0.8) {
          layer = 'fg';
          baseSpeedY = (10 + Math.random() * 14) * speedMultiplier;
          baseLength = (20 + Math.random() * 38) * (rainIntensityLevel === 'drizzle' ? 0.6 : rainIntensityLevel === 'storm' ? 1.35 : 1.0);
          widthPx = 1.6 + Math.random() * 1.4;
          alpha = 0.55 + Math.random() * 0.35;
        }

        rainStreaks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseLength,
          baseSpeedY,
          speedX: -1.5 - Math.random() * 1.0,
          alpha,
          width: widthPx,
          layer,
          phaseOffset: Math.random() * Math.PI * 2,
        });
      }

      // 3. Glass Window Pane Condensation & Dripping Droplets
      glassDrops = [];
      const dropCount = Math.floor((width / 36) * Math.max(0.4, effectiveIntensity * densityMultiplier));
      for (let i = 0; i < dropCount; i++) {
        glassDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.8 + Math.random() * (rainIntensityLevel === 'storm' ? 4.2 : 3.0),
          alpha: 0.45 + Math.random() * 0.4,
          trailLength: 0,
          crawlSpeed: (0.15 + Math.random() * 0.45) * (rainIntensityLevel === 'drizzle' ? 0.5 : rainIntensityLevel === 'storm' ? 1.6 : 1.0),
          crawlCooldown: Math.random() * 150,
        });
      }
    };

    initElements();

    let lastTime = performance.now();
    let dynamicTimeAccum = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      dynamicTimeAccum += dt;

      // Extract real-time musical tempo and energy
      const currentTrackState = trackRef.current;
      const currentBpm = currentTrackState.bpm;
      const baseEnergyVal = currentTrackState.baseEnergy;
      const playing = currentTrackState.isPlaying;
      const activeRainIntensityLevel = currentTrackState.rainIntensityLevel;
      const isThunderActive = currentTrackState.hasThunder || activeRainIntensityLevel === 'storm';

      // Dynamic Beat Pulse & Tempo Calculation (4/4 musical grid)
      const beatsPerSec = currentBpm / 60;
      const beatPhase = (dynamicTimeAccum * beatsPerSec) % 1;
      const beatPulse = playing ? Math.pow(Math.sin(beatPhase * Math.PI), 4) : 0; // sharp pulse on every beat
      const barPhrase = playing ? (Math.sin((dynamicTimeAccum * beatsPerSec * 0.25) * Math.PI) * 0.5 + 0.5) : 0; // 4-bar swell

      // Dynamic Scaling Factor based on Track Tempo + Energy
      const dynamicScalingFactor = playing 
        ? (0.85 + (baseEnergyVal * 0.4) + (beatPulse * 0.28) + (barPhrase * 0.15))
        : 0.85;

      // Adapt ambient audio presence frequency to dynamic scaling
      if (rainEnabled) {
        ambientAudio.setDynamicRainScaling(dynamicScalingFactor - 0.85);
      }

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      const isRainActive = rainEnabled || rainIntensity > 0.05;

      // ⚡ Synchronized Lightning Flash Overlays & Thunderclap Engine
      if (isThunderActive && (playing || rainEnabled)) {
        if (time > nextFlashTime) {
          // Trigger lightning sequence
          flashPhase = 1;
          flashAlpha = 0.65 + Math.random() * 0.35; // Bright initial flash

          // Trigger procedural thunderclap sound synced with flash
          const strikeIntensity = activeRainIntensityLevel === 'storm' ? 1.2 : 0.9;
          setTimeout(() => {
            ambientAudio.playThunderclap(strikeIntensity);
          }, 60 + Math.random() * 120); // Authentic speed of light to sound delay

          // Schedule next flash (more frequent during storm)
          const minDelay = activeRainIntensityLevel === 'storm' ? 4500 : 9000;
          const randomDelay = activeRainIntensityLevel === 'storm' ? 7000 : 16000;
          nextFlashTime = time + minDelay + Math.random() * randomDelay;
        }
      }

      // Render Multi-stage Lightning Flash
      if (flashAlpha > 0.005) {
        // Draw dramatic full-screen ambient white/cyan illumination
        ctx.fillStyle = `rgba(230, 245, 255, ${flashAlpha * 0.85})`;
        ctx.fillRect(0, 0, width, height);

        // Flash phase state transitions
        if (flashPhase === 1) {
          flashAlpha *= 0.72;
          if (flashAlpha < 0.25) {
            // Secondary flicker
            flashPhase = 2;
            flashAlpha = 0.42 + Math.random() * 0.25;
          }
        } else if (flashPhase === 2) {
          flashAlpha *= 0.82;
          if (flashAlpha < 0.15) {
            flashPhase = 3;
          }
        } else {
          flashAlpha *= 0.88;
          if (flashAlpha <= 0.005) {
            flashPhase = 0;
            flashAlpha = 0;
          }
        }
      }

      // 1. Render Bokeh Streetlights with organic rhythm breathing
      for (const light of bokehLights) {
        light.pulsePhase += dt * (playing ? (1.2 + beatPulse * 0.8) : 0.8);
        const dynamicAlpha = light.baseAlpha + Math.sin(light.pulsePhase) * (light.baseAlpha * 0.45);
        light.x += Math.sin(light.pulsePhase * 0.5) * 0.14;

        const radGrad = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius * (1 + beatPulse * 0.08)
        );
        radGrad.addColorStop(0, `${light.color}${dynamicAlpha * 1.8})`);
        radGrad.addColorStop(0.45, `${light.color}${dynamicAlpha * 0.8})`);
        radGrad.addColorStop(1, `${light.color}0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius * (1 + beatPulse * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Falling Rain Streaks (Tempo & Energy Dynamically Scaled)
      if (isRainActive) {
        // Wind slant swaying gently with musical phrasing and storm turbulence
        const stormWind = activeRainIntensityLevel === 'storm' ? Math.sin(dynamicTimeAccum * 1.2) * 2.2 : 0;
        const dynamicWindSlant = -1.5 + Math.sin(dynamicTimeAccum * 0.4) * 0.6 + stormWind;

        for (const drop of rainStreaks) {
          // Speed scaled dynamically by track tempo & beat pulses
          const currentSpeedY = drop.baseSpeedY * dynamicScalingFactor;
          const currentLength = drop.baseLength * (0.85 + dynamicScalingFactor * 0.35);

          drop.y += currentSpeedY;
          drop.x += (drop.speedX + dynamicWindSlant * 0.5) * dynamicScalingFactor;

          if (drop.y > height + currentLength) {
            drop.y = -currentLength - Math.random() * 50;
            drop.x = Math.random() * (width + 100);
          }
          if (drop.x < -50) {
            drop.x = width + 50;
          }

          // Rain streak stroke with gradient illumination and specular highlight
          const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x + drop.speedX * 2, drop.y + currentLength);
          grad.addColorStop(0, `rgba(180, 225, 255, 0.05)`);
          grad.addColorStop(0.6, `rgba(225, 245, 255, ${drop.alpha * (0.75 + beatPulse * 0.2 + (flashAlpha * 0.4))})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${drop.alpha * (0.9 + beatPulse * 0.3 + (flashAlpha * 0.5))})`);

          ctx.lineWidth = drop.width * (0.9 + beatPulse * 0.2);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.speedX * (currentLength / 15), drop.y + currentLength);
          ctx.stroke();

          // Bottom splash droplet bounce (accelerates on beat drops and storms)
          if (drop.y + currentLength >= height - 25 && Math.random() < (0.25 + beatPulse * 0.2 + (activeRainIntensityLevel === 'storm' ? 0.35 : 0))) {
            ctx.fillStyle = `rgba(215, 240, 255, ${drop.alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(drop.x, height - Math.random() * 10, 1.2 + beatPulse * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3. Render Window Pane Water Beads & Crawling Condensation Trails
        for (const bead of glassDrops) {
          bead.crawlCooldown -= dt * 60 * dynamicScalingFactor;
          
          if (bead.crawlCooldown <= 0) {
            bead.y += bead.crawlSpeed * 4 * dynamicScalingFactor;
            bead.trailLength = Math.min(32, bead.trailLength + 0.8 * dynamicScalingFactor);

            if (Math.random() < 0.02) {
              bead.crawlCooldown = (40 + Math.random() * 120) / dynamicScalingFactor;
            }
          }

          if (bead.y > height + 20) {
            bead.y = -10;
            bead.x = Math.random() * width;
            bead.trailLength = 0;
            bead.crawlCooldown = Math.random() * 100;
          }

          // Draw wet trickle trail behind the crawling water drop
          if (bead.trailLength > 2) {
            ctx.strokeStyle = `rgba(200, 230, 255, ${bead.alpha * 0.35})`;
            ctx.lineWidth = bead.radius * 0.7;
            ctx.beginPath();
            ctx.moveTo(bead.x, bead.y - bead.trailLength);
            ctx.lineTo(bead.x, bead.y);
            ctx.stroke();
          }

          // Glass water bead circle with specular highlight
          ctx.fillStyle = `rgba(235, 248, 255, ${bead.alpha * (0.9 + beatPulse * 0.15 + (flashAlpha * 0.5))})`;
          ctx.beginPath();
          ctx.arc(bead.x, bead.y, bead.radius, 0, Math.PI * 2);
          ctx.fill();

          // Specular glint reflection
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, bead.alpha * 1.4 + beatPulse * 0.3 + (flashAlpha * 0.7))})`;
          ctx.beginPath();
          ctx.arc(bead.x - bead.radius * 0.3, bead.y - bead.radius * 0.3, bead.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, rainEnabled, rainIntensity, rainIntensityLevel, hasThunder, bpm, baseEnergy]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  );
};
