'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { useIsMounted } from '@/hooks/useIsMounted';
import { BookOpen, Quote, Move, Cpu, Sparkles, RefreshCw } from 'lucide-react';

interface ArticleTopic {
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  quote: string;
  author: string;
  text: string;
}

const ARTICLES: Record<string, ArticleTopic> = {
  future: {
    title: 'Архитектура Будущего',
    subtitle: 'Эволюция типографики от жестких сеток к жидким полям',
    category: 'EDITORIAL / TECH SPEC',
    readTime: '3 МИН ЧТЕНИЯ',
    quote: '«Типографика больше не является статичным набором блоков — это живая среда, адаптирующаяся к геометрии контента.»',
    author: 'Chief Typography Architect',
    text:
      'Веб-типографика долгие годы оставалась заложницей прямоугольной блочной модели. Браузерный рендеринг традиционно требовал огромных вычислительных затрат при любой попытке создать журнал сложной формы. Каждое изменение вызывало цепную реакцию пересчета макета, заставляя процессор заново вычислять геометрию сотен элементов. Pretext предлагает принципиально иной подход: математический пре-расчет координат на уровне Canvas с последующим потоковым выводом. Это открывает безграничные возможности для редакторов, дизайнеров и создателей цифровых изданий нового поколения.',
  },
  quantum: {
    title: 'Квантовый Рендеринг',
    subtitle: 'Как работает субмиллисекундный расчет текстового потока',
    category: 'PERFORMANCE ANALYSIS',
    readTime: '4 МИН ЧТЕНИЯ',
    quote: '«Нулевое количество DOM-рефлоу гарантирует стабильные 120 FPS даже на мобильных устройствах.»',
    author: 'Quantum Graphics Lead',
    text:
      'Традиционные CSS Exclusions и float-обтекания создают колоссальную нагрузку на графический конвейер браузера. В отличие от них, алгоритм Pretext разбивает входной поток текста на токены и сопоставляет их с динамической картой занятых пространств. Геометрия вычисляется на чистом JavaScript за доли миллисекунды, после чего видеокарта отрисовывает финальный кадр с аппаратным ускорением. Такой подход позволяет встраивать любые интерактивные 3D-объекты, видео и анимированные плашки прямо внутрь текста без малейших задержек.',
  },
};

// ---------------------------------------------------------------------------
// Inline SVG: cyberpunk holographic avatar for the draggable media card
// ---------------------------------------------------------------------------
const CyberpunkAvatarSVG: React.FC<{ accent: string }> = ({ accent }) => {
  const glowId = 'cyberGlow';
  const scanId = 'scanLine';
  return (
    <svg
      viewBox="0 0 270 112"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-[112px] block rounded-xl overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={scanId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.05" />
          <stop offset="48%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="52%" stopColor={accent} stopOpacity="0.10" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.03" />
        </linearGradient>
        <filter id="neonBlur">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="270" height="112" fill="#09090b" />
      <rect width="270" height="112" fill={`url(#${glowId})`} />

      {/* Circuit grid lines */}
      {[14, 28, 42, 56, 70, 84, 98].map((y) => (
        <line key={y} x1="0" y1={y} x2="270" y2={y} stroke={accent} strokeOpacity="0.06" strokeWidth="0.5" />
      ))}
      {[22, 44, 66, 88, 110, 132, 154, 176, 198, 220, 242].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="112" stroke={accent} strokeOpacity="0.06" strokeWidth="0.5" />
      ))}

      {/* Scan-line overlay */}
      <rect width="270" height="112" fill={`url(#${scanId})`} />

      {/* ── Avatar silhouette (geometric circuit face) ── */}
      {/* Neck */}
      <rect x="122" y="80" width="26" height="18" rx="3" fill="#1a1a2e" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
      {/* Head outer shell */}
      <rect x="100" y="20" width="70" height="65" rx="10" fill="#12122a" stroke={accent} strokeOpacity="0.8" strokeWidth="1.2" filter="url(#neonBlur)" />
      {/* Head inner panel */}
      <rect x="108" y="28" width="54" height="50" rx="6" fill="#0d0d1f" stroke={accent} strokeOpacity="0.3" strokeWidth="0.7" />

      {/* Eye sockets */}
      <rect x="112" y="36" width="18" height="10" rx="3" fill="#000" stroke={accent} strokeOpacity="0.9" strokeWidth="1" />
      <rect x="140" y="36" width="18" height="10" rx="3" fill="#000" stroke={accent} strokeOpacity="0.9" strokeWidth="1" />
      {/* Eye glows */}
      <rect x="115" y="39" width="12" height="4" rx="2" fill={accent} fillOpacity="0.9" filter="url(#neonBlur)" />
      <rect x="143" y="39" width="12" height="4" rx="2" fill={accent} fillOpacity="0.9" filter="url(#neonBlur)" />

      {/* Nose ridge */}
      <line x1="135" y1="50" x2="135" y2="60" stroke={accent} strokeOpacity="0.4" strokeWidth="1" />

      {/* Mouth / speaker grille */}
      {[0, 4, 8].map((dy) => (
        <line key={dy} x1="118" y1={62 + dy} x2="152" y2={62 + dy} stroke={accent} strokeOpacity="0.5" strokeWidth="0.8" />
      ))}

      {/* Side circuit traces — left */}
      <polyline points="100,38 88,38 84,44 84,60 88,66 100,66" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="84" cy="52" r="2.5" fill={accent} fillOpacity="0.7" filter="url(#neonBlur)" />
      {/* Side circuit traces — right */}
      <polyline points="170,38 182,38 186,44 186,60 182,66 170,66" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="186" cy="52" r="2.5" fill={accent} fillOpacity="0.7" filter="url(#neonBlur)" />

      {/* Crown circuit nodes */}
      <circle cx="135" cy="20" r="3.5" fill={accent} fillOpacity="0.8" filter="url(#neonBlur)" />
      <line x1="135" y1="16" x2="135" y2="8" stroke={accent} strokeOpacity="0.6" strokeWidth="1" />
      <line x1="120" y1="20" x2="112" y2="12" stroke={accent} strokeOpacity="0.4" strokeWidth="0.8" />
      <line x1="150" y1="20" x2="158" y2="12" stroke={accent} strokeOpacity="0.4" strokeWidth="0.8" />
      <circle cx="135" cy="7" r="2" fill={accent} fillOpacity="0.5" />

      {/* Corner bracket decorations */}
      <polyline points="4,4 4,16 16,16" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.2" />
      <polyline points="266,4 266,16 254,16" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.2" />
      <polyline points="4,108 4,96 16,96" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.2" />
      <polyline points="266,108 266,96 254,96" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.2" />

      {/* Shoulder base */}
      <path d="M82,98 Q70,98 64,108 L206,108 Q200,98 188,98 Z" fill="#12122a" stroke={accent} strokeOpacity="0.4" strokeWidth="0.8" />

      {/* Status dots bottom-left */}
      <circle cx="12" cy="102" r="2" fill="#22c55e" fillOpacity="0.9" />
      <circle cx="20" cy="102" r="2" fill={accent} fillOpacity="0.7" />
      <circle cx="28" cy="102" r="2" fill="#f59e0b" fillOpacity="0.6" />

      {/* ID label bottom-right */}
      <text x="258" y="104" textAnchor="end" fontSize="7" fontFamily="monospace" fill={accent} fillOpacity="0.6">
        ID::0xC7B2
      </text>
    </svg>
  );
};

// Accent hex colours keyed by theme name (for SVG, Tailwind colours won't work inline)
const THEME_ACCENT_HEX: Record<string, string> = {
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  emerald: '#10b981',
};

export const CyberEditorialSpread: React.FC = () => {
  const isMounted = useIsMounted();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeArticleKey, setActiveArticleKey] = useState<'future' | 'quantum'>('future');
  const [theme, setTheme] = useState<'violet' | 'cyan' | 'emerald'>('violet');

  // Floating media card obstacle state (relative inside the text stage)
  const [pullQuotePos, setPullQuotePos] = useState<Obstacle>({
    x: 220,
    y: 45,
    width: 270,
    height: 240,
    shape: 'rect',
    gap: 16,
  });

  const [isDragging, setIsDragging] = useState(false);

  const pullQuoteRef = useRef<Obstacle>(pullQuotePos);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Cache the stage bounding rect for every drag session — avoids per-frame reflow
  const stageRectRef = useRef<DOMRect | null>(null);
  const containerWidthRef = useRef<number>(750);
  const engineRef = useRef<PretextEngine | null>(null);

  const article = ARTICLES[activeArticleKey];

  useEffect(() => {
    pullQuoteRef.current = pullQuotePos;
  }, [pullQuotePos]);

  const updateWidth = useCallback(() => {
    if (stageRef.current) {
      const w = stageRef.current.clientWidth;
      containerWidthRef.current = Math.max(300, w);
      engineRef.current = new PretextEngine({
        containerWidth: containerWidthRef.current,
        fontSize: 15,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 25,
      });
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isMounted, updateWidth]);

  // Main 60-120 FPS Canvas Render Loop
  useEffect(() => {
    if (!isMounted) return;

    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentWidth = containerWidthRef.current;
      const currentHeight = 420;
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

      const activeObs = [pullQuoteRef.current];

      if (!engineRef.current || engineRef.current['config']?.containerWidth !== currentWidth) {
        engineRef.current = new PretextEngine({
          containerWidth: currentWidth,
          fontSize: 15,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 25,
        });
      }

      const layoutItems: WordLayoutItem[] = engineRef.current.calculateWordLayout(
        article.text,
        activeObs,
        pullQuoteRef.current.gap ?? 16
      );

      // Render flowing article text words
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#d4d4d8';
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
  }, [isMounted, article.text]);

  // ---------------------------------------------------------------------------
  // Pointer Drag Handlers — attached to the card div itself
  // stageRectRef caches getBoundingClientRect() once per drag session so we
  // never pay a reflow cost on every pointermove frame.
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    // Snapshot the stage position relative to the viewport — stored in a ref
    // so handlePointerMove can read it without triggering a new reflow each frame.
    const stageRect = stageRef.current?.getBoundingClientRect() ?? null;
    stageRectRef.current = stageRect;

    const obs = pullQuoteRef.current;
    dragStartOffset.current = {
      x: e.clientX - (stageRect?.left ?? 0) - obs.x,
      y: e.clientY - (stageRect?.top ?? 0) - obs.y,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const stageRect = stageRectRef.current;
    const stageLeft = stageRect?.left ?? 0;
    const stageTop = stageRect?.top ?? 0;

    const currentWidth = containerWidthRef.current;
    const currentObs = pullQuoteRef.current;

    const newX = Math.max(
      10,
      Math.min(currentWidth - currentObs.width - 10, e.clientX - stageLeft - dragStartOffset.current.x)
    );
    const newY = Math.max(
      10,
      Math.min(410 - currentObs.height, e.clientY - stageTop - dragStartOffset.current.y)
    );

    const updated: Obstacle = { ...currentObs, x: newX, y: newY };
    pullQuoteRef.current = updated;
    setPullQuotePos(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      stageRectRef.current = null;
      setIsDragging(false);
    }
  };

  const handleResetPosition = () => {
    const defaultPos: Obstacle = {
      x: Math.max(120, Math.floor(containerWidthRef.current / 2 - 135)),
      y: 50,
      width: 270,
      height: 240,
      shape: 'rect',
      gap: 16,
    };
    pullQuoteRef.current = defaultPos;
    setPullQuotePos(defaultPos);
  };

  const themeColors = {
    violet: {
      border: 'border-violet-500/40',
      glow: 'shadow-[0_0_40px_rgba(139,92,246,0.2)]',
      accent: 'text-violet-400',
      bgCard: 'bg-violet-950/60',
      tagBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    cyan: {
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_40px_rgba(6,182,212,0.2)]',
      accent: 'text-cyan-400',
      bgCard: 'bg-cyan-950/60',
      tagBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    emerald: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
      accent: 'text-emerald-400',
      bgCard: 'bg-emerald-950/60',
      tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  }[theme];

  const accentHex = THEME_ACCENT_HEX[theme];

  if (!isMounted) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20">
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CYBER-EDITORIAL SPREAD</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
          Журнальный разворот будущего
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base">
          Премиальная верстка с динамической медиа-врезкой. Захватите карточку мышкой и перемещайте её в любую точку разворота.
        </p>
      </div>

      {/* Magazine Container */}
      <div
        className={`relative w-full glass-card rounded-3xl p-8 sm:p-12 border ${themeColors.border} ${themeColors.glow} backdrop-blur-2xl overflow-hidden transition-all duration-500`}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${themeColors.tagBg}`}>
              {article.category}
            </span>
            <span className="text-zinc-500">{article.readTime}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Topic Switcher */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveArticleKey('future')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeArticleKey === 'future'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Архитектура
              </button>
              <button
                onClick={() => setActiveArticleKey('quantum')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeArticleKey === 'quantum'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Квантовый рендер
              </button>
            </div>

            {/* Reset Position Button */}
            <button
              onClick={handleResetPosition}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              title="Сбросить позицию врезки"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Theme picker */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                onClick={() => setTheme('violet')}
                className={`w-4 h-4 rounded-full bg-violet-500 transition-transform ${
                  theme === 'violet' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                }`}
                title="Неоновый фиолетовый"
              />
              <button
                onClick={() => setTheme('cyan')}
                className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                  theme === 'cyan' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                }`}
                title="Кибер-голубой"
              />
              <button
                onClick={() => setTheme('emerald')}
                className={`w-4 h-4 rounded-full bg-emerald-400 transition-transform ${
                  theme === 'emerald' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                }`}
                title="Изумрудный"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 space-y-1.5">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {article.title}
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base font-medium max-w-xl">
            {article.subtitle}
          </p>
        </div>

        {/* Text Stage with Draggable Media Obstacle Card */}
        <div
          ref={stageRef}
          className="relative w-full min-h-[420px] h-[420px] cursor-default select-none overflow-hidden rounded-2xl bg-zinc-950/40 p-4 border border-white/5"
        >
          {/* Flowing Text Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />

          {/* ── DRAGGABLE MEDIA PULL-QUOTE CARD ── */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute z-30 cursor-grab active:cursor-grabbing rounded-2xl border ${themeColors.border} ${themeColors.bgCard} backdrop-blur-2xl shadow-2xl flex flex-col select-none touch-none transition-shadow duration-200 overflow-hidden ${
              isDragging ? 'scale-[1.02] shadow-[0_0_35px_rgba(139,92,246,0.4)] border-white/40' : ''
            }`}
            style={{
              left: `${pullQuotePos.x}px`,
              top: `${pullQuotePos.y}px`,
              width: `${pullQuotePos.width}px`,
              height: `${pullQuotePos.height}px`,
            }}
          >
            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Cpu className={`w-4 h-4 ${themeColors.accent}`} />
                <span>MEDIA MODULE</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Move className="w-3 h-3 text-cyan-400" />
                <span>Тяните мышкой</span>
              </span>
            </div>

            {/* ── Cyberpunk avatar SVG illustration ── */}
            <div className="shrink-0 px-3">
              <CyberpunkAvatarSVG accent={accentHex} />
            </div>

            {/* ── Glowing neon role badge ── */}
            <div className="px-4 pt-2 shrink-0">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                style={{
                  color: accentHex,
                  borderColor: `${accentHex}55`,
                  backgroundColor: `${accentHex}18`,
                  boxShadow: `0 0 10px ${accentHex}44`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: accentHex }}
                />
                {article.author.toUpperCase()}
              </span>
            </div>

            {/* ── Pull-quote text ── */}
            <p className="px-4 pt-2 text-[11px] text-zinc-200 font-medium italic leading-relaxed line-clamp-2 shrink-0">
              {article.quote}
            </p>

            {/* ── Author footer ── */}
            <div className="mt-auto px-4 pb-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono shrink-0">
              <span className="text-zinc-400 flex items-center gap-1">
                <Quote className="w-3 h-3 text-violet-400" />
                {article.author}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                120 FPS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CyberEditorialSpread;
