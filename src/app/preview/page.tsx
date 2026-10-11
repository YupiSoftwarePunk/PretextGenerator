'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCw,
  Search,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowLeft,
  Layers,
  FileText,
  ScrollText,
  LayoutGrid,
  Edit3,
  Shuffle,
  Volume2,
} from 'lucide-react';
import { Document, DocumentType } from '@/types';
import { getDocuments, getDocumentById, getActiveDocument } from '@/lib/storage';
import { PRESETS } from '@/components/editor/constants';
import { PretextObstacle } from '@/components/editor/types';
import { UnifiedPretextDocument } from '@/components/pretext/UnifiedPretextDocument';
import { exportSlidesToPDF, exportFlashcardsToPrintPDF, exportToPNG } from '@/lib/export';

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const docIdParam = searchParams.get('id');
  const docTypeParam = (searchParams.get('type') as DocumentType) || 'slide';

  // Load target document or fallback
  const [doc, setDoc] = useState<{
    id?: string;
    title: string;
    type: DocumentType;
    content: string;
    obstacles: PretextObstacle[];
  }>(() => {
    if (typeof window !== 'undefined') {
      if (docIdParam) {
        const found = getDocumentById(docIdParam);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            type: found.type,
            content: found.content,
            obstacles: found.obstacles || [],
          };
        }
      }

      const active = getActiveDocument();
      if (active && active.content) {
        return {
          id: active.id,
          title: active.title || 'Документ Pretext',
          type: active.type || docTypeParam,
          content: active.content,
          obstacles: active.obstacles || [],
        };
      }
    }

    const preset = PRESETS[docTypeParam] || PRESETS.slide;
    return {
      title: `${docTypeParam.toUpperCase()} — Демонстрация`,
      type: docTypeParam,
      content: preset.text,
      obstacles: preset.obstacles.map((o, i) => ({ ...o, id: `obs_${i}` })),
    };
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------
  // Slide Presentation State
  // ----------------------------------------------------
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDuration, setSlideDuration] = useState(5); // seconds
  const slides = useMemo(() => {
    return doc.content.split(/\n---\s*\n/).filter((s) => s.trim().length > 0);
  }, [doc.content]);
  const totalSlides = Math.max(1, slides.length);

  // ----------------------------------------------------
  // Flashcard State
  // ----------------------------------------------------
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Parse multi-deck cards if delimited by === CARD ===, or single two-sided card by === BACK ===
  const flashcardDecks = useMemo(() => {
    if (doc.type !== 'card') return [];
    if (doc.content.includes('=== CARD ===')) {
      return doc.content.split('=== CARD ===').map((rawCard, idx) => {
        const parts = rawCard.split('=== BACK ===');
        return {
          id: `card_${idx}`,
          front: (parts[0] || '').trim(),
          back: (parts[1] || '').trim(),
        };
      });
    }

    const parts = doc.content.split('=== BACK ===');
    return [
      {
        id: 'card_0',
        front: (parts[0] || '').trim(),
        back: (parts[1] || '').trim(),
      },
    ];
  }, [doc.content, doc.type]);

  const totalCards = Math.max(1, flashcardDecks.length);
  const currentCard = flashcardDecks[activeCardIndex] || flashcardDecks[0];

  // ----------------------------------------------------
  // Cheatsheet State
  // ----------------------------------------------------
  const [cheatsheetSearch, setCheatsheetSearch] = useState('');
  const [columnsCount, setColumnsCount] = useState<1 | 2 | 3>(2);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Parse lines/snippets for cheatsheet
  const cheatsheetSnippets = useMemo(() => {
    if (doc.type !== 'cheatsheet') return [];
    const lines = doc.content.split('\n');
    const items: { category: string; cmd: string; desc: string }[] = [];
    let currentCat = 'Общее';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('#')) {
        currentCat = trimmed.replace(/^#+\s*/, '');
        return;
      }
      if (trimmed.startsWith('- `') || trimmed.startsWith('`')) {
        const match = trimmed.match(/`([^`]+)`\s*[:-]?\s*(.*)/);
        if (match) {
          items.push({
            category: currentCat,
            cmd: match[1],
            desc: match[2] || '',
          });
        } else {
          items.push({
            category: currentCat,
            cmd: trimmed.replace(/^[-*]\s*/, ''),
            desc: '',
          });
        }
      }
    });

    if (items.length === 0) {
      // Fallback: extract code blocks or headers
      return [
        { category: 'Справочник', cmd: doc.title, desc: 'Нажмите для копирования разметки' },
      ];
    }

    return items;
  }, [doc.content, doc.type, doc.title]);

  const filteredSnippets = useMemo(() => {
    if (!cheatsheetSearch.trim()) return cheatsheetSnippets;
    const q = cheatsheetSearch.toLowerCase();
    return cheatsheetSnippets.filter(
      (item) =>
        item.cmd.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [cheatsheetSnippets, cheatsheetSearch]);

  // ----------------------------------------------------
  // Fullscreen Handlers
  // ----------------------------------------------------
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ----------------------------------------------------
  // Auto-hide controls in presentation
  // ----------------------------------------------------
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (doc.type === 'slide' && isFullscreen) {
        setShowControls(false);
      }
    }, 2800);
  }, [doc.type, isFullscreen]);

  // ----------------------------------------------------
  // Slide Controls & Autoplay
  // ----------------------------------------------------
  const nextSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  useEffect(() => {
    if (!isPlaying || doc.type !== 'slide') return;
    const interval = setInterval(() => {
      nextSlide();
    }, slideDuration * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, doc.type, slideDuration, nextSlide]);

  // ----------------------------------------------------
  // Card Controls
  // ----------------------------------------------------
  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  }, [totalCards]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  }, [totalCards]);

  const shuffleCards = useCallback(() => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * totalCards);
    setActiveCardIndex(randomIndex);
  }, [totalCards]);

  // ----------------------------------------------------
  // Keyboard Navigation
  // ----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (doc.type === 'slide') {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
          e.preventDefault();
          prevSlide();
        }
      } else if (doc.type === 'card') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          flipCard();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextCard();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc.type, nextSlide, prevSlide, flipCard, nextCard, prevCard, toggleFullscreen]);

  // ----------------------------------------------------
  // Touch Swipe Navigation for mobile
  // ----------------------------------------------------
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const threshold = 50; // min swipe distance in px

    if (diff > threshold) {
      // Swiped Left -> Next
      if (doc.type === 'slide') nextSlide();
      else if (doc.type === 'card') nextCard();
    } else if (diff < -threshold) {
      // Swiped Right -> Prev
      if (doc.type === 'slide') prevSlide();
      else if (doc.type === 'card') prevCard();
    }
    touchStartXRef.current = null;
  };

  const copySnippet = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none overflow-hidden relative"
    >
      {/* Top Floating Glass Bar */}
      <div
        className={`fixed top-0 inset-x-0 z-40 p-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/gallery"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
              title="Назад в галерею"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Галерея</span>
            </Link>

            <Link
              href={`/editor?type=${doc.type}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
              title="Редактировать в студии"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">В Студию</span>
            </Link>

            <span className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30">
                {doc.type}
              </span>
              <h1 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {doc.title}
              </h1>
            </div>
          </div>

          {/* Right Presentation Controls */}
          <div className="flex items-center gap-2">
            {doc.type === 'slide' && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                }`}
                title={isPlaying ? 'Пауза (Автослайдер)' : 'Запустить автослайдер'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isPlaying ? 'Пауза' : 'Слайд-шоу'}</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Выйти из полноэкранного режима (F)' : 'Полноэкранный режим (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Progress Indicator Bar */}
      {doc.type === 'slide' && (
        <div className="fixed top-0 inset-x-0 z-50 h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            style={{ width: `${((activeSlideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>
      )}

      {/* MAIN PRESENTATION / PREVIEW STAGE */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-20 pb-24 overflow-y-auto">
        {/* ==================================================== */}
        {/* A. SLIDE PRESENTATION MODE */}
        {/* ==================================================== */}
        {doc.type === 'slide' && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-full transition-all duration-300">
              <UnifiedPretextDocument
                content={slides[activeSlideIndex] || ''}
                obstacles={doc.obstacles}
                docType="slide"
                activeSlideIndex={activeSlideIndex}
                slidesCount={totalSlides}
                onSlideChange={setActiveSlideIndex}
                isInteractive={false}
                className="shadow-[0_0_80px_rgba(139,92,246,0.25)] border-violet-500/30"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* B. 3D FLASHCARD INTERACTIVE FLIP MODE */}
        {/* ==================================================== */}
        {doc.type === 'card' && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center py-6 animate-fadeIn">
            {/* 3D Card Perspective Box */}
            <div
              onClick={flipCard}
              style={{ perspective: '1200px' }}
              className="w-full min-h-[420px] sm:min-h-[460px] cursor-pointer group"
            >
              <div
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                }}
                className="relative w-full h-full min-h-[420px] sm:min-h-[460px]"
              >
                {/* FRONT FACE */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <UnifiedPretextDocument
                    content={currentCard.front || '# Термин карточки\nНажмите для переворота...'}
                    obstacles={doc.obstacles}
                    docType="card"
                    cardSide="front"
                    isInteractive={false}
                    className="h-full border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] hover:border-cyan-400/70 transition-all"
                  />
                </div>

                {/* BACK FACE */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <UnifiedPretextDocument
                    content={currentCard.back || '# Определение / Решение\nОбратная сторона карточки'}
                    obstacles={doc.obstacles}
                    docType="card"
                    cardSide="back"
                    isInteractive={false}
                    className="h-full border-fuchsia-500/40 shadow-[0_0_60px_rgba(236,72,153,0.25)] hover:border-fuchsia-400/70 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Interaction Hint */}
            <div className="mt-4 flex items-center gap-3 text-xs font-mono text-zinc-400 select-none">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <RotateCw className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                <span>Нажмите [Пробел] или кликните по карточке для переворота</span>
              </span>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* C. CHEATSHEET INTERACTIVE EXPLORER MODE */}
        {/* ==================================================== */}
        {doc.type === 'cheatsheet' && (
          <div className="w-full max-w-6xl space-y-6 animate-fadeIn">
            {/* Search and Layout Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={cheatsheetSearch}
                  onChange={(e) => setCheatsheetSearch(e.target.value)}
                  placeholder="Быстрый поиск команд, сниппетов и описаний..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 mr-1 hidden md:inline">Колонки:</span>
                {([1, 2, 3] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => setColumnsCount(col)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      columnsCount === col
                        ? 'bg-pink-600/30 border-pink-500 text-pink-200'
                        : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    {col} колонк{col === 1 ? 'а' : col === 2 ? 'и' : 'ек'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cheatsheet Snippets Grid */}
            <div
              className={`grid gap-4 ${
                columnsCount === 1
                  ? 'grid-cols-1'
                  : columnsCount === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredSnippets.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => copySnippet(item.cmd)}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.2)] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                        {item.category}
                      </span>
                      <button
                        className="text-zinc-500 group-hover:text-pink-300 transition-colors p-1 rounded-md"
                        title="Копировать команду"
                      >
                        {copiedCmd === item.cmd ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-sm text-pink-300 font-bold bg-zinc-950/80 p-2.5 rounded-xl border border-white/5 select-all">
                      {item.cmd}
                    </div>
                  </div>

                  {item.desc && (
                    <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Floating Control Bar */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 p-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
          {/* Slide Navigation */}
          {doc.type === 'slide' && (
            <>
              <button
                onClick={prevSlide}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                title="Предыдущий слайд (Стрелка влево)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-400">Слайд</span>
                <span className="font-bold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-500/30">
                  {activeSlideIndex + 1}
                </span>
                <span className="text-zinc-500">из</span>
                <span className="font-bold text-white">{totalSlides}</span>
              </div>

              <button
                onClick={nextSlide}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-mono font-semibold text-white transition-all shadow-md shadow-violet-600/30"
                title="Следующий слайд (Стрелка вправо / Пробел)"
              >
                <span className="hidden sm:inline">Вперед</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Flashcard Navigation */}
          {doc.type === 'card' && (
            <>
              <button
                onClick={prevCard}
                disabled={totalCards <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                title="Предыдущая карточка"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={flipCard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-600/30 transition-all active:scale-95"
                  title="Перевернуть карточку"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Оборотная' : 'Лицевая'}</span>
                </button>

                {totalCards > 1 && (
                  <button
                    onClick={shuffleCards}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                    title="Случайная карточка"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={nextCard}
                disabled={totalCards <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                title="Следующая карточка"
              >
                <span className="hidden sm:inline">Вперед</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Cheatsheet Navigation */}
          {doc.type === 'cheatsheet' && (
            <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Сниппетов найдено: <strong className="text-white">{filteredSnippets.length}</strong></span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Печать</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] text-zinc-400 flex items-center justify-center font-mono">
          Загрузка Pretext Presentation...
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
