'use client';

import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Copy,
  Check,
  Code,
  Layers,
  Save,
  Trash2,
  PlusCircle,
  Eye,
  Download,
  FileCode,
  Heading,
  Bold,
  Italic,
  Quote,
} from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { getTemplatesByType } from '@/lib/templates';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { Header } from '@/components/layout/Header';

function EditorContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as DocumentType) || 'slide';

  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [content, setContent] = useState<string>(() => {
    const available = getTemplatesByType(initialType);
    return available.length > 0 ? available[0].content : '';
  });

  const [activeTab, setActiveTab] = useState<'flow' | 'card'>('flow');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [gap, setGap] = useState<number>(14);

  // Obstacles state
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { x: 180, y: 40, width: 120, height: 120, shape: 'circle', gap: 14 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  const isDraggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerWidthRef = useRef<number>(500);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth - 48;
      containerWidthRef.current = Math.max(300, w);
    }
  }, []);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [updateContainerWidth]);

  // Main Live Canvas Flow Render Loop
  useEffect(() => {
    if (activeTab !== 'flow') return;

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

      const activeObs = obstaclesRef.current;

      const engine = new PretextEngine({
        containerWidth: currentWidth,
        fontSize: 15,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 25,
      });

      const layoutItems: WordLayoutItem[] = engine.calculateWordLayout(
        content,
        activeObs,
        gap
      );

      // Render Obstacles
      activeObs.forEach((obs, idx) => {
        const isDragging = isDraggingRef.current === idx;

        ctx.save();
        if (obs.shape === 'circle') {
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          const r = obs.width / 2;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = isDragging ? 'rgba(168, 85, 247, 0.4)' : 'rgba(139, 92, 246, 0.22)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isDragging ? '#e879f9' : '#c084fc';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = isDragging ? 18 : 10;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#fae8ff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`● Orb #${idx + 1}`, cx, cy);
        } else {
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 12);
          ctx.fillStyle = isDragging ? 'rgba(6, 182, 212, 0.38)' : 'rgba(6, 182, 212, 0.18)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = isDragging ? '#67e8f9' : '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = isDragging ? 18 : 10;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.font = '600 12px monospace';
          ctx.fillStyle = '#ecfeff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`■ Card #${idx + 1}`, obs.x + obs.width / 2, obs.y + obs.height / 2);
        }
        ctx.restore();
      });

      // Render Text
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
  }, [activeTab, content, gap]);

  // Pointer drag on preview canvas
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
        hits = Math.hypot(px - cx, py - cy) <= r;
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
    const newY = Math.max(10, Math.min(350 - targetObs.height, py - dragOffsetRef.current.y));

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

  const handleTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    const available = getTemplatesByType(newType);
    if (available.length > 0) {
      setContent(available[0].content);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setContent(template.content);
  };

  const handleInsertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n' + snippet);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLocalStorage = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('pretext_docs') || '[]');
      const newDoc = {
        id: 'doc_' + Date.now(),
        type: docType,
        title: `${docType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('pretext_docs', JSON.stringify([newDoc, ...existing]));
      window.dispatchEvent(new Event('storage'));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save', e);
    }
  };

  // Export to PNG Image
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pretext_${docType}_${Date.now()}.png`;
    a.click();
  };

  // Export to HTML Standalone File
  const handleExportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Pretext Document - ${docType.toUpperCase()}</title>
  <style>
    body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; }
    .card { max-width: 800px; margin: 0 auto; background: rgba(24,24,27,0.8); border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; padding: 40px; box-shadow: 0 0 40px rgba(139,92,246,0.2); }
    h1, h2, h3 { color: #ffffff; }
    blockquote { border-left: 4px solid #8b5cf6; padding-left: 16px; margin: 16px 0; color: #d4d4d8; }
    code { background: #18181b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pretext_${docType}_${Date.now()}.html`;
    a.click();
  };

  const handleAddObstacle = (shape: 'rect' | 'circle') => {
    const newObs: Obstacle = {
      x: Math.floor(Math.random() * 150) + 50,
      y: Math.floor(Math.random() * 120) + 40,
      width: shape === 'circle' ? 110 : 160,
      height: shape === 'circle' ? 110 : 90,
      shape,
      gap,
    };
    const updated = [...obstaclesRef.current, newObs];
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handleClearObstacles = () => {
    obstaclesRef.current = [];
    setObstacles([]);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      {/* Universal Sticky Header */}
      <Header />

      {/* Main Studio Workspace with Top Padding */}
      <div className="flex-1 flex flex-col lg:flex-row pt-16 overflow-hidden">
        {/* Left Sidebar: Formats, Templates & ToolBar */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950/60 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Document Type Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block font-mono">
              Формат документа
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slide', 'card', 'cheatsheet'] as DocumentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium font-mono transition-all border ${
                    docType === t
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {t === 'slide' ? 'Слайд' : t === 'card' ? 'Карточка' : 'Шпаргалка'}
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Snippet Shortcuts */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2.5 block font-mono">
              Быстрые сниппеты
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => handleInsertSnippet('# Заголовок')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5"
                title="Заголовок H1"
              >
                <Heading className="w-3.5 h-3.5 text-violet-400" />
                <span>H1</span>
              </button>
              <button
                onClick={() => handleInsertSnippet('**Важный текст**')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5"
                title="Жирный"
              >
                <Bold className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => handleInsertSnippet('*Курсив*')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5"
                title="Курсив"
              >
                <Italic className="w-3.5 h-3.5 text-pink-400" />
              </button>
              <button
                onClick={() => handleInsertSnippet('> Цитата-вынос')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5"
                title="Цитата"
              >
                <Quote className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Preset Templates */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block font-mono">
              Готовые пресеты
            </label>
            <div className="space-y-2">
              {getTemplatesByType(docType).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/40 hover:bg-white/10 transition-all group"
                >
                  <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">
                    {tpl.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{tpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Obstacle Controls */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-semibold uppercase">Препятствия потока</span>
              <span className="text-violet-400">{obstacles.length} шт.</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddObstacle('circle')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors font-mono"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Сфера</span>
              </button>
              <button
                onClick={() => handleAddObstacle('rect')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors font-mono"
              >
                <PlusCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>+ Блок</span>
              </button>
            </div>

            {obstacles.length > 0 && (
              <button
                onClick={handleClearObstacles}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-mono"
              >
                <Trash2 className="w-3 h-3" />
                <span>Сбросить препятствия</span>
              </button>
            )}
          </div>

          {/* Gap Slider */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Отступ (Gap)</span>
              <span className="text-cyan-400 font-bold">{gap} px</span>
            </div>
            <input
              type="range"
              min="6"
              max="28"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
            />
          </div>
        </aside>

        {/* Center: Split Text Editor & Live Interactive Preview */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">
          {/* Text Editor Pane */}
          <div className="flex flex-col h-full bg-[#0c0c10]">
            {/* Editor Toolbar Header */}
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-violet-400" />
                <span>Разметка документа</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {content.length} симв. | {content.split(/\s+/).filter(Boolean).length} слов
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Заголовок документа\n\nТекст с динамическим обтеканием..."
              className="flex-1 w-full p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[380px]"
              spellCheck={false}
            />
          </div>

          {/* Live Preview Pane */}
          <div className="flex flex-col h-full bg-zinc-950/70 p-6 overflow-y-auto">
            {/* Top Preview Controls & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('flow')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                    activeTab === 'flow'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pretext Flow</span>
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                    activeTab === 'card'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Formatted Card</span>
                </button>
              </div>

              {/* Action Buttons: Export & Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 hover:bg-white/10 transition-colors"
                  title="Экспорт в PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  onClick={handleExportHTML}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-pink-300 hover:bg-white/10 transition-colors"
                  title="Скачать HTML"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>HTML</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 transition-colors"
                  title="Копировать разметку"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleSaveToLocalStorage}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Сохранено!' : 'Сохранить'}</span>
                </button>
              </div>
            </div>

            {/* Renderer Stage */}
            <div ref={containerRef} className="flex-1 flex items-center justify-center min-h-[380px]">
              {activeTab === 'flow' ? (
                <div className="w-full relative border border-violet-500/30 rounded-3xl p-6 bg-zinc-900/50 backdrop-blur-md shadow-2xl min-h-[360px] overflow-hidden">
                  <div className="text-[11px] font-mono text-zinc-500 mb-2 flex items-center justify-between">
                    <span>Перетаскивайте фигуры мышкой</span>
                    <span className="text-emerald-400 font-bold">120 FPS Active</span>
                  </div>

                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="block w-full h-[360px] cursor-grab active:cursor-grabbing touch-none"
                  />
                </div>
              ) : (
                <div className="w-full glass-card rounded-3xl p-8 border border-white/10 max-w-lg shadow-2xl">
                  <PretextRenderer content={content} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] text-zinc-400 flex items-center justify-center font-mono">
          Загрузка Pretext Studio...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
