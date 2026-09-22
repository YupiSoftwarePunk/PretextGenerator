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
    height: 165,
    shape: 'rect',
    gap: 16,
  });

  const [isDragging, setIsDragging] = useState(false);

  const pullQuoteRef = useRef<Obstacle>(pullQuotePos);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
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
      const currentHeight = 360;
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

  // Robust Pointer Drag Handlers attached DIRECTLY to the media card
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const currentObs = pullQuoteRef.current;
    dragStartOffset.current = {
      x: e.clientX - currentObs.x,
      y: e.clientY - currentObs.y,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const currentWidth = containerWidthRef.current;
    const currentObs = pullQuoteRef.current;

    const newX = Math.max(10, Math.min(currentWidth - currentObs.width - 10, e.clientX - dragStartOffset.current.x));
    const newY = Math.max(10, Math.min(350 - currentObs.height, e.clientY - dragStartOffset.current.y));

    const updated: Obstacle = { ...currentObs, x: newX, y: newY };
    pullQuoteRef.current = updated;
    setPullQuotePos(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
    }
  };

  const handleResetPosition = () => {
    const defaultPos: Obstacle = {
      x: Math.max(120, Math.floor(containerWidthRef.current / 2 - 135)),
      y: 50,
      width: 270,
      height: 165,
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
          className="relative w-full min-h-[360px] h-[360px] cursor-default select-none overflow-hidden rounded-2xl bg-zinc-950/40 p-4 border border-white/5"
        >
          {/* Flowing Text Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />

          {/* DRAGGABLE MEDIA PULL-QUOTE CARD */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute z-30 cursor-grab active:cursor-grabbing rounded-2xl p-5 border ${themeColors.border} ${themeColors.bgCard} backdrop-blur-2xl shadow-2xl flex flex-col justify-between select-none transition-shadow duration-200 touch-none ${
              isDragging ? 'scale-[1.02] shadow-[0_0_35px_rgba(139,92,246,0.4)] border-white/40' : ''
            }`}
            style={{
              left: `${pullQuotePos.x}px`,
              top: `${pullQuotePos.y}px`,
              width: `${pullQuotePos.width}px`,
              height: `${pullQuotePos.height}px`,
            }}
          >
            {/* Top Bar with Media Icon & Drag Hint */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Cpu className={`w-4 h-4 ${themeColors.accent}`} />
                <span>MEDIA MODULE</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Move className="w-3 h-3 text-cyan-400" />
                <span>Тяните мышкой</span>
              </span>
            </div>

            {/* Quote Body */}
            <p className="text-xs text-zinc-100 font-medium italic leading-relaxed line-clamp-3">
              {article.quote}
            </p>

            {/* Footnote */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
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
