'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { useIsMounted } from '@/hooks/useIsMounted';
import { BookOpen, Quote, Move } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeArticleKey, setActiveArticleKey] = useState<'future' | 'quantum'>('future');
  const [theme, setTheme] = useState<'violet' | 'cyan' | 'emerald'>('violet');

  // Interactive floating pull-quote obstacle
  const [pullQuotePos, setPullQuotePos] = useState<Obstacle>({
    x: 240,
    y: 70,
    width: 250,
    height: 150,
    shape: 'rect',
    gap: 16,
  });

  const pullQuoteRef = useRef<Obstacle>(pullQuotePos);
  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerWidthRef = useRef<number>(750);
  const engineRef = useRef<PretextEngine | null>(null);

  const article = ARTICLES[activeArticleKey];

  useEffect(() => {
    pullQuoteRef.current = pullQuotePos;
  }, [pullQuotePos]);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth - 48;
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

  // Main 60-120 FPS Render Loop
  useEffect(() => {
    if (!isMounted) return;

    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
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

      // Pretext Layout calculation
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

      // Render flowing article text
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

  // Pointer Drag on the Pull-Quote Card
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - 24;
    const py = e.clientY - rect.top - 120;

    const obs = pullQuoteRef.current;
    if (px >= obs.x && px <= obs.x + obs.width && py >= obs.y && py <= obs.y + obs.height) {
      isDraggingRef.current = true;
      dragOffsetRef.current = { x: px - obs.x, y: py - obs.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - 24;
    const py = e.clientY - rect.top - 120;

    const currentW = containerWidthRef.current;
    const obs = pullQuoteRef.current;

    const newX = Math.max(10, Math.min(currentW - obs.width - 10, px - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(340 - obs.height, py - dragOffsetRef.current.y));

    const updated: Obstacle = { ...obs, x: newX, y: newY };
    pullQuoteRef.current = updated;
    setPullQuotePos(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = false;
    }
  };

  const themeColors = {
    violet: {
      border: 'border-violet-500/40',
      glow: 'shadow-[0_0_40px_rgba(139,92,246,0.2)]',
      accent: 'text-violet-400',
      bgCard: 'bg-violet-950/40',
    },
    cyan: {
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_40px_rgba(6,182,212,0.2)]',
      accent: 'text-cyan-400',
      bgCard: 'bg-cyan-950/40',
    },
    emerald: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
      accent: 'text-emerald-400',
      bgCard: 'bg-emerald-950/40',
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
          Премиальная редакционная верстка с динамическими выносными цитатами и перетеканием текста вокруг интерактивных врезок.
        </p>
      </div>

      {/* Magazine Container */}
      <div
        ref={containerRef}
        className={`relative w-full glass-card rounded-3xl p-8 sm:p-12 border ${themeColors.border} ${themeColors.glow} backdrop-blur-2xl overflow-hidden transition-all duration-500`}
      >
        {/* Magazine Editorial Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded bg-white/5 border border-white/10 font-bold ${themeColors.accent}`}>
              {article.category}
            </span>
            <span className="text-zinc-500">{article.readTime}</span>
          </div>

          {/* Topic Switcher & Theme Selector */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveArticleKey('future')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeArticleKey === 'future'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Архитектура
              </button>
              <button
                onClick={() => setActiveArticleKey('quantum')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeArticleKey === 'quantum'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Квантовый рендер
              </button>
            </div>

            {/* Theme picker */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                onClick={() => setTheme('violet')}
                className={`w-4 h-4 rounded-full bg-violet-500 transition-transform ${theme === 'violet' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                title="Неоновый фиолетовый"
              />
              <button
                onClick={() => setTheme('cyan')}
                className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${theme === 'cyan' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                title="Кибер-голубой"
              />
              <button
                onClick={() => setTheme('emerald')}
                className={`w-4 h-4 rounded-full bg-emerald-400 transition-transform ${theme === 'emerald' ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                title="Изумрудный матричный"
              />
            </div>
          </div>
        </div>

        {/* Magazine Title & Subtitle */}
        <div className="mb-8 space-y-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {article.title}
          </h3>
          <p className="text-zinc-400 text-base font-medium max-w-xl">
            {article.subtitle}
          </p>
        </div>

        {/* Editorial Body: Interactive Canvas + Overlaid Draggable Pull Quote Card */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full min-h-[360px] h-[360px] cursor-default select-none touch-none"
        >
          {/* Flowing Text Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 block pointer-events-none" />

          {/* Interactive Floating Glass Pull-Quote Obstacle */}
          <div
            className={`absolute z-20 cursor-grab active:cursor-grabbing rounded-2xl p-5 border ${themeColors.border} ${themeColors.bgCard} backdrop-blur-xl shadow-2xl flex flex-col justify-between select-none group`}
            style={{
              left: `${pullQuotePos.x}px`,
              top: `${pullQuotePos.y}px`,
              width: `${pullQuotePos.width}px`,
              height: `${pullQuotePos.height}px`,
              transition: 'box-shadow 0.2s ease',
            }}
          >
            {/* Draggable indicator & icon */}
            <div className="flex items-center justify-between mb-2">
              <Quote className={`w-5 h-5 ${themeColors.accent}`} />
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-white transition-colors">
                <Move className="w-3 h-3" />
                Перетащите врезку
              </span>
            </div>

            {/* Quote Body */}
            <p className="text-xs text-zinc-200 font-medium italic leading-relaxed line-clamp-3">
              {article.quote}
            </p>

            {/* Author footnote */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">{article.author}</span>
              <span className="text-emerald-400">Pretext 120fps</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CyberEditorialSpread;
