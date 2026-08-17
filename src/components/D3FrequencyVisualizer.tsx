import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VibeTheme, TrackInfo } from '../types';
import { Activity, Radio, Sparkles, Zap, Disc3, Maximize2, Minimize2, Eye } from 'lucide-react';

interface D3FrequencyVisualizerProps {
  isPlaying: boolean;
  activeTheme: VibeTheme;
  track: TrackInfo;
  onToggleBoomboxView?: () => void;
  isExpandedFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const D3FrequencyVisualizer: React.FC<D3FrequencyVisualizerProps> = ({
  isPlaying,
  activeTheme,
  track,
  onToggleBoomboxView,
  isExpandedFullScreen = false,
  onToggleFullScreen,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'circular'>('bars');

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    let animationId: number;
    const numBars = 48;
    const frequencies = Array.from({ length: numBars }, (_, i) => ({
      freq: Math.floor(32 * Math.pow(16000 / 32, i / (numBars - 1))),
      val: 0.1,
      peak: 0.1,
    }));

    // Setup D3 SVG
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Create dynamic gradient based on active theme
    const linearGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-freq-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    linearGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', activeTheme.accentColor)
      .attr('stop-opacity', 0.25);

    linearGrad
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', activeTheme.accentColor)
      .attr('stop-opacity', 0.85);

    linearGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FFFFFF')
      .attr('stop-opacity', 0.95);

    // Glow filter
    const filter = defs.append('filter').attr('id', 'd3-neon-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const gMain = svg.append('g').attr('class', 'main-group');

    let phase = 0;

    const render = () => {
      const bounds = container.getBoundingClientRect();
      const width = bounds.width || 600;
      const height = bounds.height || 260;

      svg.attr('width', width).attr('height', height);

      // Update amplitude values
      phase += isPlaying ? 0.08 : 0.02;

      for (let i = 0; i < numBars; i++) {
        const item = frequencies[i];
        if (isPlaying) {
          // Dynamic organic spectrum reacting to music rhythm
          const wave1 = Math.sin(phase * 1.5 + (i / numBars) * Math.PI * 4);
          const wave2 = Math.cos(phase * 2.1 - (i / numBars) * Math.PI * 2);
          const bassBoost = i < 10 ? 0.35 * Math.sin(phase * 3.2 + i * 0.4) : 0;
          const noise = (Math.random() - 0.5) * 0.18;

          const raw = 0.2 + 0.35 * (wave1 * 0.5 + 0.5) + 0.25 * (wave2 * 0.5 + 0.5) + bassBoost + noise;
          item.val = Math.max(0.06, Math.min(0.98, raw));
        } else {
          item.val = 0.05 + 0.03 * Math.sin(phase + i * 0.2);
        }

        if (item.val > item.peak) {
          item.peak = item.val;
        } else {
          item.peak = Math.max(item.val, item.peak - 0.008);
        }
      }

      gMain.selectAll('*').remove();

      if (visualMode === 'bars') {
        const padding = 2;
        const barWidth = Math.max(3, (width - padding * (numBars - 1)) / numBars);
        const maxHeight = height - 40;

        // Draw frequency bars
        frequencies.forEach((d, i) => {
          const x = i * (barWidth + padding);
          const barH = d.val * maxHeight;
          const y = height - 25 - barH;
          const peakY = height - 25 - d.peak * maxHeight;

          // Bar stem
          gMain
            .append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', barWidth)
            .attr('height', barH)
            .attr('rx', 2)
            .attr('fill', 'url(#d3-freq-gradient)')
            .attr('opacity', 0.9);

          // Peak holding pip
          gMain
            .append('rect')
            .attr('x', x)
            .attr('y', Math.max(4, peakY - 3))
            .attr('width', barWidth)
            .attr('height', 2)
            .attr('rx', 1)
            .attr('fill', '#FFFFFF')
            .attr('opacity', isPlaying ? 0.95 : 0.4)
            .attr('filter', 'url(#d3-neon-glow)');
        });

        // Bottom baseline
        gMain
          .append('line')
          .attr('x1', 0)
          .attr('y1', height - 24)
          .attr('x2', width)
          .attr('y2', height - 24)
          .attr('stroke', `${activeTheme.accentColor}40`)
          .attr('stroke-width', 1.5);

        // Frequency labels (Sample 5 points across the scale)
        const labelIndices = [0, Math.floor(numBars * 0.25), Math.floor(numBars * 0.5), Math.floor(numBars * 0.75), numBars - 1];
        labelIndices.forEach((idx) => {
          const item = frequencies[idx];
          const x = idx * (barWidth + padding) + barWidth / 2;
          const labelText = item.freq >= 1000 ? `${(item.freq / 1000).toFixed(1)}k` : `${item.freq}`;

          gMain
            .append('text')
            .attr('x', x)
            .attr('y', height - 8)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(255,255,255,0.45)')
            .attr('font-size', '9px')
            .attr('font-family', 'var(--font-mono)')
            .text(`${labelText}Hz`);
        });
      } else if (visualMode === 'wave') {
        // Continuous smooth curved bezier wave
        const lineGenerator = d3
          .line<{ x: number; y: number }>()
          .x((d) => d.x)
          .y((d) => d.y)
          .curve(d3.curveBasis);

        const areaGenerator = d3
          .area<{ x: number; y: number }>()
          .x((d) => d.x)
          .y0(height - 20)
          .y1((d) => d.y)
          .curve(d3.curveBasis);

        const step = width / (numBars - 1);
        const points = frequencies.map((d, i) => ({
          x: i * step,
          y: height - 25 - d.val * (height - 50),
        }));

        // Fill area under curve
        gMain
          .append('path')
          .datum(points)
          .attr('fill', 'url(#d3-freq-gradient)')
          .attr('opacity', 0.4)
          .attr('d', areaGenerator as any);

        // Stroke line
        gMain
          .append('path')
          .datum(points)
          .attr('fill', 'none')
          .attr('stroke', activeTheme.accentColor)
          .attr('stroke-width', 2.5)
          .attr('filter', 'url(#d3-neon-glow)')
          .attr('d', lineGenerator as any);

        // Baseline
        gMain
          .append('line')
          .attr('x1', 0)
          .attr('y1', height - 20)
          .attr('x2', width)
          .attr('y2', height - 20)
          .attr('stroke', `${activeTheme.accentColor}50`)
          .attr('stroke-width', 1.5);
      } else if (visualMode === 'circular') {
        // Radial circular spectrum in center
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.28;

        gMain
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', radius)
          .attr('fill', '#0A0A10')
          .attr('stroke', `${activeTheme.accentColor}40`)
          .attr('stroke-width', 2);

        frequencies.forEach((d, i) => {
          const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
          const barLen = d.val * (radius * 0.9);

          const x1 = cx + Math.cos(angle) * radius;
          const y1 = cy + Math.sin(angle) * radius;
          const x2 = cx + Math.cos(angle) * (radius + barLen);
          const y2 = cy + Math.sin(angle) * (radius + barLen);

          gMain
            .append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', activeTheme.accentColor)
            .attr('stroke-width', 2.5)
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.85);
        });

        // Center pulsing ring
        gMain
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', radius * (isPlaying ? 0.6 + 0.1 * Math.sin(phase * 2) : 0.6))
          .attr('fill', `${activeTheme.accentColor}18`)
          .attr('stroke', activeTheme.accentColor)
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#d3-neon-glow)');
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, visualMode, activeTheme]);

  return (
    <div 
      className={`relative w-full rounded-2xl bg-[#090910]/90 backdrop-blur-xl border border-[#222234] shadow-2xl overflow-hidden transition-all flex flex-col justify-between ${
        isExpandedFullScreen ? 'p-6 min-h-[380px]' : 'p-4 sm:p-6 min-h-[280px] max-w-4xl mx-auto'
      }`}
      style={{
        boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${activeTheme.glowColor}`,
      }}
    >
      {/* Top Visualizer Control Ribbon */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2 select-none">
        <div className="flex items-center gap-2">
          <div 
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeTheme.accentColor }}
          />
          <span className="font-mono-custom text-xs font-bold tracking-widest text-white uppercase">
            D3 DSP SPECTRUM ANALYZER
          </span>
          <span 
            className="hidden sm:inline-block text-[9px] font-mono-custom px-1.5 py-0.5 rounded uppercase"
            style={{ backgroundColor: `${activeTheme.accentColor}20`, color: activeTheme.accentColor }}
          >
            {activeTheme.name}
          </span>
        </div>

        {/* Visual Mode Selector Buttons & Switch to Boombox View */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[#14141E] p-0.5 rounded-lg border border-white/10 flex items-center gap-0.5">
            <button
              onClick={() => setVisualMode('bars')}
              className={`px-2 py-1 rounded text-[10px] font-mono-custom transition-all cursor-pointer ${
                visualMode === 'bars' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
              title="Bar Spectrum Mode"
            >
              BARS
            </button>
            <button
              onClick={() => setVisualMode('wave')}
              className={`px-2 py-1 rounded text-[10px] font-mono-custom transition-all cursor-pointer ${
                visualMode === 'wave' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
              title="Continuous Oscilloscope Wave"
            >
              WAVE
            </button>
            <button
              onClick={() => setVisualMode('circular')}
              className={`px-2 py-1 rounded text-[10px] font-mono-custom transition-all cursor-pointer ${
                visualMode === 'circular' ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
              title="Radial Circular Frequency"
            >
              RADIAL
            </button>
          </div>

          {/* Switch back to Boombox */}
          {onToggleBoomboxView && (
            <button
              onClick={onToggleBoomboxView}
              className="px-2.5 py-1 rounded-lg bg-[#181824] hover:bg-[#222232] border border-white/15 text-[11px] font-mono-custom text-white/80 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              title="Return to Analog Boombox Deck"
            >
              <Radio className="w-3.5 h-3.5" style={{ color: activeTheme.accentColor }} />
              <span className="hidden sm:inline">BOOMBOX</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
              title={isExpandedFullScreen ? 'Minimize view' : 'Expand full screen'}
            >
              {isExpandedFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full flex-1 flex items-center justify-center min-h-[160px] my-auto">
        <svg ref={svgRef} className="w-full h-full block" />
      </div>

      {/* Bottom Track Meta & Live Amplitude Indicator */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-custom text-white/50">
        <div className="flex items-center gap-2 truncate max-w-[65%]">
          <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.accentColor }} />
          <span className="truncate text-white/80">{track.title || 'Signal Searching Atmosphere'}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px]">98.6 MHz • STEREO</span>
          <span className="font-bold uppercase" style={{ color: activeTheme.accentColor }}>
            {isPlaying ? 'ACTIVE 48kHz' : 'PAUSED'}
          </span>
        </div>
      </div>
    </div>
  );
};
