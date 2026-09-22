'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { Play, Pause, Move, Sparkles, RefreshCw } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface JournalVisualizerProps {
  text: string;
  initialObstacles?: Obstacle[];
}

const DEFAULT_OBSTACLES: Obstacle[] = [
  { x: 80, y: 50, width: 140, height: 140, shape: 'circle' },
  { x: 380, y: 130, width: 220, height: 110, shape: 'rect' },
];

export const JournalVisualizer: React.FC<JournalVisualizerProps> = ({
  text,
  initialObstacles = DEFAULT_OBSTACLES,
}) => {
  const isMounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAutoFloating, setIsAutoFloating] = useState(true);
  const [obstacles, setObstacles] = useState<Obstacle[]>(initialObstacles);
  const [computeTimeMs, setComputeTimeMs] = useState(0.18);
  const [wordsCount, setWordsCount] = useState(0);

  // References for ultra-smooth 60-120 FPS rendering without React re-render lag
  const obstaclesRef = useRef<Obstacle[]>(initialObstacles);
  const isDraggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeRef = useRef<number>(0);
  const isAutoFloatingRef = useRef<boolean>(true);
  const engineRef = useRef<PretextEngine | null>(null);
  const containerWidthRef = useRef<number>(750);
  const textRef = useRef<string>(text);

  // Synchronize state and props to refs inside effects
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    isAutoFloatingRef.current = isAutoFloating;
  }, [isAutoFloating]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth - 48;
      containerWidthRef.current = Math.max(300, w);
      if (!engineRef.current || engineRef.current['config']?.containerWidth !== w) {
        engineRef.current = new PretextEngine({
          containerWidth: containerWidthRef.current,
          fontSize: 15,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 25,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isMounted, updateContainerWidth]);

  // Main 60 FPS Render Loop (Hardware-accelerated Canvas with zero React re-render lag)
  useEffect(() => {
    if (!isMounted) return;

    let animationFrameId: number;
    let lastComputeReportTime = 0;

    const render = (timestamp: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentWidth = containerWidthRef.current;
      const currentHeight = 380;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== currentWidth * dpr || canvas.height !== currentHeight * dpr) {
        canvas.width = currentWidth * dpr;
        canvas.height = currentHeight * dpr;
        canvas.style.width = `${currentWidth}px`;
        canvas.style.height = `${currentHeight}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      // 1. Update auto-floating positions if enabled and not being dragged
      if (isAutoFloatingRef.current) {
        timeRef.current += 0.015;
        const t = timeRef.current;
        const currentObs = obstaclesRef.current;

        const updated = currentObs.map((obs, i) => {
          if (isDraggingRef.current === i) {
            return obs; // Don't move while user drags
          }

          const maxX = Math.max(200, currentWidth - obs.width - 20);
          if (i === 0) {
            return {
              ...obs,
              x: Math.max(20, Math.min(maxX, 90 + Math.sin(t) * 60)),
              y: Math.max(20, Math.min(220, 55 + Math.cos(t * 0.9) * 35)),
            };
          } else {
            return {
              ...obs,
              x: Math.max(20, Math.min(maxX, currentWidth - 280 + Math.cos(t * 0.7) * 45)),
              y: Math.max(20, Math.min(240, 140 + Math.sin(t * 0.8) * 30)),
            };
          }
        });

        obstaclesRef.current = updated;
      }

      const activeObs = obstaclesRef.current;

      // 2. Pretext Layout Computation
      if (!engineRef.current || engineRef.current['config']?.containerWidth !== currentWidth) {
        engineRef.current = new PretextEngine({
          containerWidth: currentWidth,
          fontSize: 15,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 25,
        });
      }

      const t0 = performance.now();
      const layoutItems: WordLayoutItem[] = engineRef.current.calculateWordLayout(
        textRef.current,
        activeObs,
        14
      );
      const t1 = performance.now();

      if (timestamp - lastComputeReportTime > 300) {
        setComputeTimeMs(t1 - t0);
        setWordsCount(layoutItems.length);
        lastComputeReportTime = timestamp;
      }

      // 3. Render Obstacles Background & Contours
      activeObs.forEach((obs, idx) => {
        const isHovered = isDraggingRef.current === idx;

        ctx.save();
        if (obs.shape === 'circle') {
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          const r = obs.width / 2;

          // Outer Glow
          const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r + 15);
          grad.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
          grad.addColorStop(0.8, 'rgba(139, 92, 246, 0.15)');
          grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
          ctx.fill();

          // Circle Body
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? 'rgba(168, 85, 247, 0.35)' : 'rgba(139, 92, 246, 0.25)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isHovered ? '#c084fc' : '#a855f7';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = isHovered ? 18 : 10;
          ctx.stroke();

          // Icon / Label
          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#f3e8ff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('● Orb (Drag)', cx, cy);
        } else {
          // Rounded Rectangle
          const x = obs.x;
          const y = obs.y;
          const w = obs.width;
          const h = obs.height;
          const r = 14;

          ctx.beginPath();
          ctx.roundRect(x, y, w, h, r);
          ctx.fillStyle = isHovered ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.2)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isHovered ? '#67e8f9' : '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = isHovered ? 18 : 10;
          ctx.stroke();

          // Icon / Label
          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#cffafe';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('■ Glass Card (Drag)', x + w / 2, y + h / 2);
        }
        ctx.restore();
      });

      // 4. Render Flowing Text
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#e4e4e7';
      ctx.textBaseline = 'alphabetic';

      for (let i = 0; i < layoutItems.length; i++) {
        const item = layoutItems[i];
        ctx.fillText(item.word, item.x, item.y);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMounted]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const currentObs = obstaclesRef.current;
    for (let i = currentObs.length - 1; i >= 0; i--) {
      const obs = currentObs[i];
      let hits = false;

      if (obs.shape === 'circle') {
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const r = obs.width / 2;
        const dist = Math.hypot(px - cx, py - cy);
        hits = dist <= r;
      } else {
        hits = px >= obs.x && px <= obs.x + obs.width && py >= obs.y && py <= obs.y + obs.height;
      }

      if (hits) {
        isDraggingRef.current = i;
        dragOffsetRef.current = { x: px - obs.x, y: py - obs.y };
        canvas.setPointerCapture(e.pointerId);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const draggingIdx = isDraggingRef.current;
    if (draggingIdx === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const currentWidth = containerWidthRef.current;
    const targetObs = obstaclesRef.current[draggingIdx];
    if (!targetObs) return;

    const newX = Math.max(10, Math.min(currentWidth - targetObs.width - 10, px - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(370 - targetObs.height, py - dragOffsetRef.current.y));

    const updated = [...obstaclesRef.current];
    updated[draggingIdx] = { ...targetObs, x: newX, y: newY };
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current !== null) {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = null;
    }
  };

  const handleResetPositions = () => {
    const reset = [
      { x: 80, y: 50, width: 140, height: 140, shape: 'circle' as const },
      { x: Math.max(260, containerWidthRef.current - 260), y: 130, width: 220, height: 110, shape: 'rect' as const },
    ];
    obstaclesRef.current = reset;
    setObstacles(reset);
    timeRef.current = 0;
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[460px] border border-white/10 rounded-2xl p-6 bg-zinc-950/80 flex items-center justify-center text-zinc-500">
        Инициализация Pretext Engine...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full border border-violet-500/30 rounded-2xl p-6 bg-zinc-950/90 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden"
    >
      {/* Top Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoFloating(!isAutoFloating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAutoFloating
                ? 'bg-violet-600/30 border border-violet-500/60 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {isAutoFloating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoFloating ? 'Авто-плавание: ВКЛ' : 'Авто-плавание: ВЫКЛ'}</span>
          </button>

          <button
            onClick={handleResetPositions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Сбросить позиции"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>
        </div>

        {/* Live HUD Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Move className="w-3 h-3 text-cyan-400" />
            <span className="text-zinc-300">Перетаскивайте фигуры мышкой</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3" />
            <span>~{computeTimeMs.toFixed(2)} ms / frame</span>
          </span>
          <span className="text-zinc-500 hidden sm:inline">
            {wordsCount} слов
          </span>
        </div>
      </div>

      {/* Canvas Interactive Arena */}
      <div className="relative w-full h-[380px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900/30 border border-white/5">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="block w-full h-full touch-none"
        />
      </div>
    </div>
  );
};

export default JournalVisualizer;
