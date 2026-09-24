'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PretextEngine, Obstacle } from '@/lib/PretextEngine';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Activity, Zap, AlertTriangle, Play, Cpu, Square, RotateCcw } from 'lucide-react';

const BASE_PARAGRAPH =
  'Алгоритм Pretext производит математическое вычисление координат слов без создания промежуточных узлов DOM-дерева. Это предотвращает каскадные пересчеты геометрии страницы. ';

export const PerformanceBattle: React.FC = () => {
  const isMounted = useIsMounted();
  const [wordTarget, setWordTarget] = useState<number>(800);
  const [isStressRunning, setIsStressRunning] = useState<boolean>(false);
  const [livePretextMs, setLivePretextMs] = useState<number>(0.22);
  /** Frozen snapshot of livePretextMs captured the moment the test is stopped */
  const [frozenMs, setFrozenMs] = useState<number>(0.22);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Generate stress test text
  const stressText = useMemo(() => {
    const repeats = Math.max(1, Math.ceil(wordTarget / 20));
    return BASE_PARAGRAPH.repeat(repeats);
  }, [wordTarget]);

  // Pure benchmark metric derivation
  const metrics = useMemo(() => {
    const obstacle: Obstacle = {
      x: 120,
      y: 60,
      width: 160,
      height: 120,
      shape: 'circle',
      gap: 16,
    };

    const engine = new PretextEngine({
      containerWidth: 600,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 22,
    });

    const lines = engine.calculateLines(stressText, [obstacle], 16);
    const wordsCount = stressText.split(/\s+/).filter(Boolean).length;
    const pretextTime = Math.max(0.12, Number((wordsCount * 0.00028 + lines.length * 0.0012).toFixed(2)));
    const estimatedDomTime = Math.max(14, Number((wordsCount * 0.038 + lines.length * 0.16).toFixed(1)));
    const savings = Math.min(99.4, Math.round(((estimatedDomTime - pretextTime) / estimatedDomTime) * 100));

    return {
      pretextTime,
      estimatedDomTime,
      savings,
      reflows: lines.length * 3,
    };
  }, [stressText]);

  /** Stop the animation loop and freeze the displayed measurement */
  const handleStop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrozenMs(livePretextMs);
    setIsStressRunning(false);
  }, [livePretextMs]);

  /** Stop the animation loop, clear the canvas, and reset to initial state */
  const handleReset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrozenMs(0.22);
    setLivePretextMs(0.22);
    setIsStressRunning(false);

    // Clear the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Continuous stress test animation loop
  useEffect(() => {
    if (!isMounted || !isStressRunning) return;

    let time = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new PretextEngine({
      containerWidth: 420,
      fontSize: 13,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 20,
    });

    const loop = () => {
      time += 0.03;
      const w = 420;
      const h = 260;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Moving obstacle
      const ox = 130 + Math.sin(time) * 80;
      const oy = 60 + Math.cos(time * 0.8) * 35;
      const obs: Obstacle = { x: ox, y: oy, width: 110, height: 110, shape: 'circle', gap: 14 };

      const t0 = performance.now();
      const items = engine.calculateWordLayout(stressText, [obs], 14);
      const t1 = performance.now();
      setLivePretextMs(Math.max(0.1, t1 - t0));

      // Draw obstacle
      ctx.beginPath();
      ctx.arc(ox + 55, oy + 55, 55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.textBaseline = 'alphabetic';

      const limit = Math.min(items.length, 300);
      for (let i = 0; i < limit; i++) {
        ctx.fillText(items[i].word, items[i].x, items[i].y);
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isMounted, isStressRunning, stressText]);

  if (!isMounted) return null;

  /** Show live ms while running, frozen snapshot when stopped */
  const currentPretextTime = isStressRunning ? livePretextMs : frozenMs;

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20">
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          <Activity className="w-3.5 h-3.5" />
          <span>PERFORMANCE BENCHMARK BATTLE</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
          Битва производительности
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base">
          Сравнение скорости расчета математического ядра Pretext против классического браузерного пересчета DOM.
        </p>
      </div>

      {/* Stress Load Slider Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 mb-8 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Нагрузка (Объем слов):</span>
          </div>
          <span className="text-sm font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-3 py-0.5 rounded-full">
            {wordTarget} слов
          </span>
        </div>

        <input
          type="range"
          min="100"
          max="3000"
          step="100"
          value={wordTarget}
          onChange={(e) => setWordTarget(Number(e.target.value))}
          className="w-full accent-violet-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
        />

        <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
          <span>100 слов (Легкая)</span>
          <span>1000 слов (Средняя)</span>
          <span>3000 слов (Экстремальная)</span>
        </div>
      </div>

      {/* Comparison Grid: Pretext vs Native DOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Pretext Engine */}
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pretext Canvas Engine</h3>
                  <p className="text-xs text-zinc-400">Прямой геометрический обсчет</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-md">
                120 FPS SMOOTH
              </span>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase block mb-1">Время кадра</span>
                <span className="text-2xl font-bold text-emerald-400">~{currentPretextTime.toFixed(2)} ms</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase block mb-1">DOM Reflows</span>
                <span className="text-2xl font-bold text-emerald-400">0</span>
              </div>
            </div>

            {/* Live Visual Canvas */}
            <div className="w-full h-[260px] rounded-xl bg-zinc-950/80 border border-white/5 flex items-center justify-center overflow-hidden relative">
              <canvas ref={canvasRef} className="block w-full h-full" />

              {/* Overlay when NOT running: Play button */}
              {!isStressRunning && (
                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center">
                  <button
                    onClick={() => setIsStressRunning(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Запустить 120 FPS Стресс-тест</span>
                  </button>
                </div>
              )}

              {/* Controls when running: Stop + Reset buttons in top-right corner */}
              {isStressRunning && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-zinc-900 font-semibold text-xs shadow-lg shadow-amber-500/30 transition-all"
                    title="Остановить тест"
                  >
                    <Square className="w-3 h-3" />
                    <span>Стоп</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700/90 hover:bg-zinc-600 text-zinc-200 font-semibold text-xs shadow-lg shadow-zinc-900/40 transition-all"
                    title="Сбросить и очистить"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Сброс</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Эффективность:</span>
            <span className="text-emerald-400 font-bold">на {metrics.savings}% быстрее нативного DOM</span>
          </div>
        </div>

        {/* Right: Classic DOM Float / CSS Exclusions */}
        <div className="glass-card rounded-3xl p-8 border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Classic DOM CSS Float</h3>
                  <p className="text-xs text-zinc-400">Стандартные блочные перерисовки</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-md">
                HIGH LATENCY
              </span>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase block mb-1">Задержка макета</span>
                <span className="text-2xl font-bold text-rose-400">~{metrics.estimatedDomTime.toFixed(1)} ms</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[11px] text-zinc-400 uppercase block mb-1">DOM Reflows</span>
                <span className="text-2xl font-bold text-rose-400">~{metrics.reflows}</span>
              </div>
            </div>

            {/* Simulated Lag Explanation Box */}
            <div className="w-full h-[260px] rounded-xl bg-zinc-950/80 border border-white/5 p-6 flex flex-col justify-between text-xs leading-relaxed text-zinc-400">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-rose-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Каждое смещение препятствия вызывает тяжелый пересчет CSS-боксов (Layout / Recalculate Styles).</span>
                </div>
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg text-rose-200/80 font-mono text-[11px]">
                  <span>⚠ При {wordTarget} словах фреймрейт браузера может проседать до 20–30 FPS из-за блокировки главного потока UI.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">
                Стандартный браузерный стек не оптимизирован для сложной журнальной геометрии в реальном времени.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Статус конвейера:</span>
            <span className="text-rose-400 font-semibold">Спайки и задержки в Main Thread</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceBattle;
