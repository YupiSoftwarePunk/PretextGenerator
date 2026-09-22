'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem, TextLine } from '@/lib/PretextEngine';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  Sliders,
  PlusCircle,
  RotateCcw,
  Zap,
  Trash2,
} from 'lucide-react';

const PRESET_TEXTS: Record<string, string> = {
  cyberpunk:
    'Неоновый горизонт Найт-Сити мерцал в отражениях мокрого асфальта. Потоки данных текли сквозь оптические магистрали города, огибая монолитные башни мегакорпораций. В этом цифровом лабиринте каждый байт информации имел свою цену, а архитектура интерфейсов будущего адаптировалась под любые геометрические аномалии пространства.',
  quantum:
    'Квантовая суперпозиция позволяет частицам находиться в нескольких состояниях одновременно до момента измерения. В вычислительных системах нового поколения алгоритмы маршрутизации данных адаптируются к динамическим возмущениям среды, мгновенно находя оптимальные траектории распространения информации сквозь квантовые барьеры.',
  architecture:
    'Архитектура современных веб-приложений требует максимальной производительности при минимальном потреблении ресурсов. Pretext исключает дорогостоящие операции пересчета макета страницы (Reflow / Layout Shift), выполняя все геометрические расчеты типографики на микросекундном уровне.',
};

export const PlaygroundArena: React.FC = () => {
  const isMounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playground state controls
  const [selectedPreset, setSelectedPreset] = useState<string>('cyberpunk');
  const [customText, setCustomText] = useState<string>(PRESET_TEXTS.cyberpunk);
  const [gap, setGap] = useState<number>(14);
  const [fontSize, setFontSize] = useState<number>(15);
  const [lineHeight, setLineHeight] = useState<number>(26);
  const [renderMode, setRenderMode] = useState<'canvas' | 'dom'>('canvas');
  const [isAutoFloat, setIsAutoFloat] = useState<boolean>(true);

  // Performance telemetry state
  const [computeTimeMs, setComputeTimeMs] = useState<number>(0.16);
  const [wordsCount, setWordsCount] = useState<number>(0);
  const [linesCount, setLinesCount] = useState<number>(0);

  // Obstacles state
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { x: 60, y: 40, width: 130, height: 130, shape: 'circle', gap: 14 },
    { x: 340, y: 110, width: 220, height: 110, shape: 'rect', gap: 14 },
  ]);

  // DOM Lines for DOM mode
  const [domLines, setDomLines] = useState<TextLine[]>([]);

  // Refs for animation loop & pointer drag
  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  const isDraggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeRef = useRef<number>(0);
  const isAutoFloatRef = useRef<boolean>(isAutoFloat);
  const engineRef = useRef<PretextEngine | null>(null);
  const containerWidthRef = useRef<number>(750);
  const textRef = useRef<string>(customText);
  const gapRef = useRef<number>(gap);
  const fontSizeRef = useRef<number>(fontSize);
  const lineHeightRef = useRef<number>(lineHeight);

  // Sync refs inside effects
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  useEffect(() => {
    textRef.current = customText;
  }, [customText]);

  useEffect(() => {
    isAutoFloatRef.current = isAutoFloat;
  }, [isAutoFloat]);

  useEffect(() => {
    gapRef.current = gap;
  }, [gap]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    lineHeightRef.current = lineHeight;
  }, [lineHeight]);

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth - 48;
      containerWidthRef.current = Math.max(300, w);
      engineRef.current = new PretextEngine({
        containerWidth: containerWidthRef.current,
        fontSize: fontSizeRef.current,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: lineHeightRef.current,
      });
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isMounted, updateContainerWidth]);

  // Handle Preset Selection
  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setCustomText(PRESET_TEXTS[key]);
  };

  // Add Obstacle
  const handleAddShape = (shape: 'rect' | 'circle') => {
    const currentW = containerWidthRef.current;
    const newObs: Obstacle = {
      x: Math.max(20, Math.floor(Math.random() * (currentW - 200))),
      y: Math.max(20, Math.floor(Math.random() * 200)),
      width: shape === 'circle' ? 120 : 180,
      height: shape === 'circle' ? 120 : 95,
      shape,
      gap,
    };
    const updated = [...obstaclesRef.current, newObs];
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  // Reset Obstacles
  const handleReset = () => {
    const def: Obstacle[] = [
      { x: 60, y: 40, width: 130, height: 130, shape: 'circle', gap },
      { x: Math.max(260, containerWidthRef.current - 260), y: 110, width: 220, height: 110, shape: 'rect', gap },
    ];
    obstaclesRef.current = def;
    setObstacles(def);
    timeRef.current = 0;
  };

  // Clear all obstacles
  const handleClear = () => {
    obstaclesRef.current = [];
    setObstacles([]);
  };

  // Canvas 60-120 FPS Main Loop
  useEffect(() => {
    if (!isMounted || renderMode !== 'canvas') return;

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
      const currentHeight = 390;
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

      // 1. Auto floating if enabled and not dragging
      if (isAutoFloatRef.current) {
        timeRef.current += 0.012;
        const t = timeRef.current;

        const updated = obstaclesRef.current.map((obs, i) => {
          if (isDraggingRef.current === i) return obs;

          const maxX = Math.max(100, currentWidth - obs.width - 20);
          const phase = i * 1.8;
          return {
            ...obs,
            x: Math.max(15, Math.min(maxX, obs.x + Math.sin(t + phase) * 0.7)),
            y: Math.max(15, Math.min(260, obs.y + Math.cos(t * 0.9 + phase) * 0.6)),
          };
        });
        obstaclesRef.current = updated;
      }

      const activeObs = obstaclesRef.current;

      // 2. Pretext Engine Layout
      const currentEngine = new PretextEngine({
        containerWidth: currentWidth,
        fontSize: fontSizeRef.current,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: lineHeightRef.current,
      });

      const t0 = performance.now();
      const layoutItems: WordLayoutItem[] = currentEngine.calculateWordLayout(
        textRef.current,
        activeObs,
        gapRef.current
      );
      const lines = currentEngine.calculateLines(textRef.current, activeObs, gapRef.current);
      const t1 = performance.now();

      if (timestamp - lastReportTime > 250) {
        setComputeTimeMs(t1 - t0);
        setWordsCount(layoutItems.length);
        setLinesCount(lines.length);
        lastReportTime = timestamp;
      }

      // 3. Render Obstacles with Neon Glass FX
      activeObs.forEach((obs, idx) => {
        const isDragging = isDraggingRef.current === idx;

        ctx.save();
        if (obs.shape === 'circle') {
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          const r = obs.width / 2;

          // Radial aura
          const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r + 16);
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
          grad.addColorStop(0.7, 'rgba(139, 92, 246, 0.15)');
          grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
          ctx.fill();

          // Circle Body
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = isDragging ? 'rgba(168, 85, 247, 0.4)' : 'rgba(139, 92, 246, 0.22)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isDragging ? '#e879f9' : '#c084fc';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = isDragging ? 22 : 12;
          ctx.stroke();

          // Label
          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#fae8ff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`● Orb #${idx + 1}`, cx, cy);
        } else {
          // Rect
          const x = obs.x;
          const y = obs.y;
          const w = obs.width;
          const h = obs.height;

          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 14);
          ctx.fillStyle = isDragging ? 'rgba(6, 182, 212, 0.38)' : 'rgba(6, 182, 212, 0.18)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isDragging ? '#67e8f9' : '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = isDragging ? 22 : 12;
          ctx.stroke();

          // Label
          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#ecfeff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`■ Card #${idx + 1}`, x + w / 2, y + h / 2);
        }
        ctx.restore();
      });

      // 4. Render Flowing Text Words
      ctx.font = `${fontSizeRef.current}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
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
  }, [isMounted, renderMode]);

  // DOM Mode Layout Updates
  useEffect(() => {
    if (renderMode === 'dom') {
      const engine = new PretextEngine({
        containerWidth: containerWidthRef.current,
        fontSize,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight,
      });
      const lines = engine.calculateLines(customText, obstacles, gap);
      setDomLines(lines);
      setLinesCount(lines.length);
      setWordsCount(customText.split(/\s+/).filter(Boolean).length);
    }
  }, [renderMode, customText, obstacles, gap, fontSize, lineHeight]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement | HTMLCanvasElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
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
        hits = Math.hypot(px - cx, py - cy) <= r;
      } else {
        hits = px >= obs.x && px <= obs.x + obs.width && py >= obs.y && py <= obs.y + obs.height;
      }

      if (hits) {
        isDraggingRef.current = i;
        dragOffsetRef.current = { x: px - obs.x, y: py - obs.y };
        el.setPointerCapture(e.pointerId);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement | HTMLCanvasElement>) => {
    const draggingIdx = isDraggingRef.current;
    if (draggingIdx === null) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const currentWidth = containerWidthRef.current;
    const targetObs = obstaclesRef.current[draggingIdx];
    if (!targetObs) return;

    const newX = Math.max(10, Math.min(currentWidth - targetObs.width - 10, px - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(380 - targetObs.height, py - dragOffsetRef.current.y));

    const updated = [...obstaclesRef.current];
    updated[draggingIdx] = { ...targetObs, x: newX, y: newY };
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement | HTMLCanvasElement>) => {
    if (isDraggingRef.current !== null) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = null;
    }
  };

  if (!isMounted) return null;

  return (
    <section id="sandbox" className="w-full max-w-7xl mx-auto px-6 py-20">
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
          <Sliders className="w-3.5 h-3.5" />
          <span>INTERACTIVE SANDBOX ARENA</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
          Песочница препятствий
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base">
          Управляйте геометрией макета, двигайте фигуры мышкой и настраивайте параметры потока в реальном времени.
        </p>
      </div>

      {/* Main Grid: Controls Panel + Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Control Controls Panel (4 Cols) */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          {/* Presets Selection */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2.5 block">
              Пресеты контента
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cyberpunk', label: 'Кибер' },
                { id: 'quantum', label: 'Квант' },
                { id: 'architecture', label: 'Архит' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedPreset === p.id
                      ? 'bg-violet-600/40 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Safe Margin / Gap */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Отступ (Safe Gap)</span>
                <span className="text-cyan-400 font-bold">{gap} px</span>
              </div>
              <input
                type="range"
                min="6"
                max="32"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Размер шрифта</span>
                <span className="text-violet-400 font-bold">{fontSize} px</span>
              </div>
              <input
                type="range"
                min="13"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-violet-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Line Height */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Высота строки</span>
                <span className="text-pink-400 font-bold">{lineHeight} px</span>
              </div>
              <input
                type="range"
                min="20"
                max="34"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-pink-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          </div>

          {/* Obstacle Manager Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block flex justify-between">
              <span>Добавить фигуры</span>
              <span className="text-violet-400">{obstacles.length} на холсте</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddShape('circle')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Сфера</span>
              </button>
              <button
                onClick={() => handleAddShape('rect')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Карточка</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сброс</span>
              </button>
              {obstacles.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-900/40 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Очистить</span>
                </button>
              )}
            </div>
          </div>

          {/* Mode Switch: Canvas 120 FPS vs DOM */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Режим рендеринга:</span>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setRenderMode('canvas')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  renderMode === 'canvas'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Canvas 120fps
              </button>
              <button
                onClick={() => setRenderMode('dom')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  renderMode === 'dom'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DOM Nodes
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Sandbox Arena (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            ref={containerRef}
            className="relative w-full border border-violet-500/30 rounded-3xl p-6 sm:p-8 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden"
          >
            {/* Top Arena Header & HUD */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-zinc-300 font-semibold uppercase">
                  Arena Active
                </span>
                <button
                  onClick={() => setIsAutoFloat(!isAutoFloat)}
                  className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-all ${
                    isAutoFloat
                      ? 'bg-violet-950/60 border-violet-500/40 text-violet-300'
                      : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}
                >
                  {isAutoFloat ? 'Авто-движение: ВКЛ' : 'Авто-движение: ВЫКЛ'}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  ~{computeTimeMs.toFixed(2)} ms
                </span>
                <span className="text-zinc-400">
                  {wordsCount} слов / {linesCount} строк
                </span>
              </div>
            </div>

            {/* Rendering Canvas / DOM Arena */}
            {renderMode === 'canvas' ? (
              <div className="relative w-full h-[390px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900/40 border border-white/5">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="block w-full h-full touch-none"
                />
              </div>
            ) : (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full min-h-[390px] h-[390px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900/40 border border-white/5 p-4 select-none touch-none"
              >
                {/* DOM Obstacles */}
                {obstacles.map((obs, idx) => (
                  <div
                    key={idx}
                    className="absolute border border-cyan-400/60 bg-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${obs.x}px`,
                      top: `${obs.y}px`,
                      width: `${obs.width}px`,
                      height: `${obs.height}px`,
                      borderRadius: obs.shape === 'circle' ? '50%' : '14px',
                    }}
                  >
                    <span className="text-xs font-mono text-cyan-200">
                      {obs.shape === 'circle' ? `● Orb #${idx + 1}` : `■ Card #${idx + 1}`}
                    </span>
                  </div>
                ))}

                {/* DOM Text Lines */}
                {domLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="absolute text-zinc-200 pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${line.x}px`,
                      top: `${line.y - fontSize}px`,
                      fontSize: `${fontSize}px`,
                      lineHeight: `${lineHeight}px`,
                    }}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaygroundArena;
