'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Sparkles, ArrowDown, Code2, Zap } from 'lucide-react';
import Link from 'next/link';

const HERO_TEXT =
  'Pretext — это движок мгновенной геометрической укладки текста в браузере. Он вычисляет обтекание любых препятствий на скорости 120 кадров в секунду без лишних перерисовок DOM. Наведите курсор на этот текст, чтобы почувствовать силу кинетической типографики.';

export const HeroMagneticText: React.FC = () => {
  const isMounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [computeTimeMs, setComputeTimeMs] = useState(0.12);
  const [isHovered, setIsHovered] = useState(false);

  // References for pure 60-120 FPS animation loop
  const cursorRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: -200,
    y: -200,
    active: false,
    targetX: -200,
    targetY: -200,
  });

  const containerWidthRef = useRef<number>(850);
  const engineRef = useRef<PretextEngine | null>(null);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth - 48;
      containerWidthRef.current = Math.max(300, w);
      engineRef.current = new PretextEngine({
        containerWidth: containerWidthRef.current,
        fontSize: 17,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 28,
      });
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMounted, updateWidth]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isMounted) return;

    let animationFrameId: number;
    let lastReportTime = 0;

    const render = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentWidth = containerWidthRef.current;
      const currentHeight = 220;
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

      // Smooth cursor interpolation for fluid liquid feel
      const cursor = cursorRef.current;
      cursor.x += (cursor.targetX - cursor.x) * 0.25;
      cursor.y += (cursor.targetY - cursor.y) * 0.25;

      const obstacles: Obstacle[] = [];
      if (cursor.active && cursor.x > -100) {
        const orbRadius = 55;
        obstacles.push({
          x: cursor.x - orbRadius,
          y: cursor.y - orbRadius,
          width: orbRadius * 2,
          height: orbRadius * 2,
          shape: 'circle',
          gap: 12,
        });

        // Draw cursor magnetic aura
        const cx = cursor.x;
        const cy = cursor.y;

        const radial = ctx.createRadialGradient(cx, cy, 5, cx, cy, orbRadius + 20);
        radial.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        radial.addColorStop(0.6, 'rgba(192, 132, 252, 0.2)');
        radial.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(cx, cy, orbRadius + 20, 0, Math.PI * 2);
        ctx.fill();

        // Magnetic Core
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Pretext Layout Calculation
      if (!engineRef.current || engineRef.current['config']?.containerWidth !== currentWidth) {
        engineRef.current = new PretextEngine({
          containerWidth: currentWidth,
          fontSize: 17,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 28,
        });
      }

      const t0 = performance.now();
      const layoutItems: WordLayoutItem[] = engineRef.current.calculateWordLayout(
        HERO_TEXT,
        obstacles,
        14
      );
      const t1 = performance.now();

      if (timestamp - lastReportTime > 300) {
        setComputeTimeMs(t1 - t0);
        lastReportTime = timestamp;
      }

      // Draw Words
      ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
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

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorRef.current.targetX = e.clientX - rect.left;
    cursorRef.current.targetY = e.clientY - rect.top;
    cursorRef.current.active = true;
    if (!isHovered) setIsHovered(true);
  };

  const handlePointerLeave = () => {
    cursorRef.current.active = false;
    cursorRef.current.targetX = -300;
    cursorRef.current.targetY = -300;
    setIsHovered(false);
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center text-zinc-500 animate-pulse">
        Загрузка интерактивного движка...
      </div>
    );
  }

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto pt-12 pb-20 px-6 flex flex-col items-center text-center">
      {/* Top Tech Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-mono font-medium text-cyan-300">
          PRETEXT CORE ENGINE v2.0 • 0 DOM REFLOWS
        </span>
      </div>

      {/* Main Hero Headline */}
      <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
        <span className="gradient-text">Живая типографика</span>
        <br />
        <span className="text-white">будущего в вебе</span>
      </h1>

      <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
        Сверхбыстрое математическое обтекание препятствий в реальном времени. Без фризов, без пересчетов макета DOM.
      </p>

      {/* Interactive Kinetic Text Canvas Box */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl border border-violet-500/30 rounded-3xl p-6 sm:p-8 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(139,92,246,0.2)] overflow-hidden mb-10 group"
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.4) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* HUD Info */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Двигайте мышь внутри блока:</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              ~{computeTimeMs.toFixed(2)} ms
            </span>
            <span className="text-zinc-500 hidden sm:inline">120 FPS</span>
          </div>
        </div>

        {/* Canvas for kinetic magnetic text */}
        <div className="w-full h-[220px] cursor-crosshair relative">
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="block w-full h-full touch-none"
          />
        </div>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="#sandbox"
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-all"
        >
          <span>Исследовать песочницу</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>

        <Link
          href="/editor"
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 text-zinc-200 font-semibold text-sm transition-all"
        >
          <Code2 className="w-4 h-4 text-violet-400" />
          <span>Открыть Pretext Studio</span>
        </Link>
      </div>
    </section>
  );
};

export default HeroMagneticText;
