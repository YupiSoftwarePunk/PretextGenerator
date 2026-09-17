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
  Eye,
  Download,
  FileCode,
  Heading,
  Bold,
  Italic,
  Quote,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  Move,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { getTemplatesByType } from '@/lib/templates';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import { PretextEngine, Obstacle, WordLayoutItem } from '@/lib/PretextEngine';
import { Header } from '@/components/layout/Header';

// ─── Obstacle Types ──────────────────────────────────────────────────────────
type ObstacleKind = 'image' | 'quote' | 'badge';

interface PretextObstacle extends Obstacle {
  id: string;
  kind: ObstacleKind;
  label: string;
}

// ─── Preset configurations per docType ───────────────────────────────────────
const PRESETS: Record<DocumentType, { obstacles: Omit<PretextObstacle, 'id'>[]; text: string }> = {
  slide: {
    obstacles: [
      {
        x: 280, y: 50, width: 180, height: 130, shape: 'rect', gap: 16,
        kind: 'badge', label: '⚡ 120 FPS',
      },
    ],
    text: 'Pretext Engine обеспечивает стабильные 120 FPS при обтекании любых визуальных объектов. Математический расчёт координат выполняется полностью на JavaScript без единого DOM reflow. Текст плавно огибает карточку метрики, сохраняя читаемость и структуру контента даже при динамическом изменении положения препятствия.',
  },
  card: {
    obstacles: [
      {
        x: 170, y: 60, width: 130, height: 130, shape: 'circle', gap: 14,
        kind: 'image', label: '🖼 Media',
      },
    ],
    text: 'Флэшкард с центральной графической иконкой демонстрирует возможности алгоритма Pretext: текст равномерно распределяется вокруг круглого препятствия, создавая натуральное и органичное обтекание. Каждое слово точно позиционируется в пространстве документа.',
  },
  cheatsheet: {
    obstacles: [
      {
        x: 30, y: 80, width: 160, height: 100, shape: 'rect', gap: 12,
        kind: 'quote', label: '💬 Важно',
      },
    ],
    text: 'Шпаргалка со стикером важного замечания. Текст документа автоматически уступает место цитате-стикеру и продолжает поток справа и снизу. Pretext гарантирует что ни одно слово не перекрывает визуальный блок.',
  },
};

// ─── Canvas Drawing helpers ──────────────────────────────────────────────────
function drawObstacleOnCanvas(
  ctx: CanvasRenderingContext2D,
  obs: PretextObstacle,
  isDragging: boolean
) {
  ctx.save();

  if (obs.shape === 'circle') {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const r = obs.width / 2;

    // Glow
    ctx.shadowColor = isDragging ? '#e879f9' : '#c084fc';
    ctx.shadowBlur = isDragging ? 24 : 14;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isDragging ? 'rgba(168,85,247,0.38)' : 'rgba(139,92,246,0.22)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDragging ? '#e879f9' : '#c084fc';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icon label
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#fae8ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obs.kind === 'image' ? '🖼' : obs.kind === 'quote' ? '💬' : '⚡', cx, cy - 10);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(obs.label, cx, cy + 10);

  } else {
    // Rounded rect obstacle
    const borderColor = obs.kind === 'badge'
      ? (isDragging ? '#fbbf24' : '#f59e0b')
      : obs.kind === 'quote'
        ? (isDragging ? '#67e8f9' : '#22d3ee')
        : (isDragging ? '#86efac' : '#4ade80');

    const fillColor = obs.kind === 'badge'
      ? (isDragging ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.18)')
      : obs.kind === 'quote'
        ? (isDragging ? 'rgba(6,182,212,0.38)' : 'rgba(6,182,212,0.18)')
        : (isDragging ? 'rgba(74,222,128,0.35)' : 'rgba(74,222,128,0.18)');

    ctx.shadowColor = borderColor;
    ctx.shadowBlur = isDragging ? 22 : 12;

    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner content by kind
    const icon = obs.kind === 'badge' ? '⚡' : obs.kind === 'quote' ? '💬' : '🖼';
    ctx.font = 'bold 16px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, obs.x + obs.width / 2, obs.y + obs.height / 2 - 10);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = borderColor;
    ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height / 2 + 12);
  }

  ctx.restore();
}

// ─── Export HTML generation ───────────────────────────────────────────────────
function buildExportHTML(
  docType: DocumentType,
  content: string,
  layoutItems: WordLayoutItem[],
  obstacles: PretextObstacle[],
  canvasWidth: number,
  canvasHeight: number
): string {
  const obstacleHtml = obstacles.map((obs) => {
    const bg = obs.shape === 'circle'
      ? 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.1) 100%)'
      : obs.kind === 'badge'
        ? 'rgba(245,158,11,0.2)'
        : obs.kind === 'quote'
          ? 'rgba(6,182,212,0.2)'
          : 'rgba(139,92,246,0.2)';
    const border = obs.kind === 'badge' ? '#f59e0b' : obs.kind === 'quote' ? '#22d3ee' : '#c084fc';
    const icon = obs.kind === 'image' ? '🖼' : obs.kind === 'quote' ? '💬' : '⚡';
    const radius = obs.shape === 'circle' ? '50%' : '12px';

    return `<div style="position: absolute; left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; background: ${bg}; border: 1.5px solid ${border}; border-radius: ${radius}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 20px ${border}40; backdrop-filter: blur(4px); color: #fff; font-family: monospace; text-align: center; padding: 8px;">
      <div style="font-size: 16px; margin-bottom: 4px;">${icon}</div>
      <div style="font-size: 10px; font-weight: bold; color: ${border};">${obs.label}</div>
    </div>`;
  }).join('\n');

  const wordSpans = layoutItems
    .map(
      (item) =>
        `<span style="position:absolute;left:${item.x}px;top:${item.y - 15}px;white-space:nowrap;font-size:15px;color:#e4e4e7;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${item.word}</span>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Pretext Export — ${docType.toUpperCase()}</title>
  <style>
    body { background: #09090b; margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .export-container { width: 100%; max-width: ${canvasWidth}px; background: #18181b; border: 1px solid rgba(139,92,246,0.4); border-radius: 24px; padding: 24px; box-shadow: 0 0 50px rgba(139,92,246,0.25); }
    .stage { position: relative; width: 100%; height: ${canvasHeight}px; background: rgba(24,24,27,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .words { position: absolute; inset: 0; }
  </style>
</head>
<body>
  <div class="export-container">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span style="font-family: monospace; font-size: 12px; color: #a78bfa; background: rgba(139,92,246,0.2); padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-weight: bold;">${docType}</span>
      <span style="font-family: monospace; font-size: 12px; color: #71717a;">Pretext Engine Export</span>
    </div>
    <div class="stage">
      <div class="words">${wordSpans}</div>
      ${obstacleHtml}
    </div>
  </div>
</body>
</html>`;
}

// ─── Main EditorContent ───────────────────────────────────────────────────────
function EditorContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as DocumentType) || 'slide';

  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [content, setContent] = useState<string>(() => {
    const preset = PRESETS[initialType];
    return preset.text;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pretext_active_doc');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.type && parsed.content) {
          setDocType(parsed.type);
          setContent(parsed.content);
        }
        localStorage.removeItem('pretext_active_doc');
      }
    } catch (e) {
      console.error('Failed to load active doc', e);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'flow' | 'card'>('flow');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [gap, setGap] = useState<number>(14);

  // Obstacles with kind/label
  const [obstacles, setObstacles] = useState<PretextObstacle[]>(() => {
    const preset = PRESETS[initialType];
    return preset.obstacles.map((o, i) => ({ ...o, id: `obs_${Date.now()}_${i}` }));
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const obstaclesRef = useRef<PretextObstacle[]>(obstacles);
  const isDraggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerWidthRef = useRef<number>(500);
  const lastLayoutRef = useRef<WordLayoutItem[]>([]);

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

  // ── Main 120FPS Canvas Render Loop ─────────────────────────────────────────
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
      const currentHeight = 400;
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
        lineHeight: 26,
      });

      const layoutItems: WordLayoutItem[] = engine.calculateWordLayout(content, activeObs, gap);
      lastLayoutRef.current = layoutItems;

      // Draw text first (behind obstacles)
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#e4e4e7';
      ctx.textBaseline = 'alphabetic';

      for (let i = 0; i < layoutItems.length; i++) {
        const item = layoutItems[i];
        ctx.fillText(item.word, item.x, item.y);
      }

      // Draw obstacles on top
      activeObs.forEach((obs, idx) => {
        const isDragging = isDraggingRef.current === idx;
        drawObstacleOnCanvas(ctx, obs, isDragging);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTab, content, gap]);

  // ── Pointer Drag on Canvas ─────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
    const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

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
    const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
    const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const currentWidth = containerWidthRef.current;
    const targetObs = obstaclesRef.current[draggingIdx];
    if (!targetObs) return;

    const newX = Math.max(0, Math.min(currentWidth - targetObs.width, px - dragOffsetRef.current.x));
    const newY = Math.max(0, Math.min(390 - targetObs.height, py - dragOffsetRef.current.y));

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

  // ── Document Type Change ───────────────────────────────────────────────────
  const handleTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    const preset = PRESETS[newType];
    setContent(preset.text);
    const newObstacles = preset.obstacles.map((o, i) => ({
      ...o,
      id: `obs_${Date.now()}_${i}`,
    }));
    obstaclesRef.current = newObstacles;
    setObstacles(newObstacles);
  };

  const handleSelectTemplate = (template: Template) => {
    setContent(template.content);
  };

  const handleInsertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n' + snippet);
  };

  // ── Copy / Save ────────────────────────────────────────────────────────────
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
        title: `${docType.toUpperCase()} — ${new Date().toLocaleDateString()}`,
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

  // ── Export PNG ─────────────────────────────────────────────────────────────
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pretext_${docType}_${Date.now()}.png`;
    a.click();
  };

  // ── Export HTML with real Pretext layout ───────────────────────────────────
  const handleExportHTML = () => {
    const currentWidth = containerWidthRef.current;
    const engine = new PretextEngine({
      containerWidth: currentWidth,
      fontSize: 15,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 26,
    });
    const layoutItems = engine.calculateWordLayout(content, obstaclesRef.current, gap);
    const htmlContent = buildExportHTML(
      docType,
      content,
      layoutItems,
      obstaclesRef.current,
      currentWidth,
      400
    );
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pretext_${docType}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Add / Remove Obstacles ─────────────────────────────────────────────────
  const handleAddObstacle = (kind: ObstacleKind) => {
    const shape: 'rect' | 'circle' = kind === 'image' ? 'circle' : 'rect';
    const w = kind === 'image' ? 110 : kind === 'badge' ? 150 : 170;
    const h = kind === 'image' ? 110 : kind === 'badge' ? 80 : 95;
    const label = kind === 'image' ? '🖼 Media' : kind === 'badge' ? '⚡ Badge' : '💬 Цитата';

    const newObs: PretextObstacle = {
      id: `obs_${Date.now()}`,
      x: Math.floor(Math.random() * 150) + 50,
      y: Math.floor(Math.random() * 100) + 40,
      width: w,
      height: h,
      shape,
      gap,
      kind,
      label,
    };
    const updated = [...obstaclesRef.current, newObs];
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handleRemoveObstacle = (id: string) => {
    const updated = obstaclesRef.current.filter((o) => o.id !== id);
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handleUpdateObstacle = (id: string, updates: Partial<PretextObstacle>) => {
    const currentWidth = containerWidthRef.current;
    const updated = obstaclesRef.current.map((o) => {
      if (o.id !== id) return o;
      const w = updates.width !== undefined ? updates.width : o.width;
      const h = updates.height !== undefined ? updates.height : o.height;
      const maxW = Math.max(60, currentWidth - o.x);
      const maxH = Math.max(50, 390 - o.y);
      return {
        ...o,
        ...updates,
        width: Math.min(w, maxW),
        height: Math.min(h, maxH),
      };
    });
    obstaclesRef.current = updated;
    setObstacles(updated);
  };

  const handleClearObstacles = () => {
    obstaclesRef.current = [];
    setObstacles([]);
  };

  const handleResetPreset = () => {
    const preset = PRESETS[docType];
    const newObstacles = preset.obstacles.map((o, i) => ({
      ...o,
      id: `obs_${Date.now()}_${i}`,
    }));
    obstaclesRef.current = newObstacles;
    setObstacles(newObstacles);
  };

  // ── Kind badge colors ──────────────────────────────────────────────────────
  const kindColor: Record<ObstacleKind, string> = {
    image: 'text-violet-400 border-violet-500/40 bg-violet-950/50',
    quote: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/50',
    badge: 'text-amber-400 border-amber-500/40 bg-amber-950/50',
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row pt-16 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────── */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950/60 p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Document type */}
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

          {/* Pretext Obstacles Panel */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-violet-400" />
                Препятствия Pretext
              </span>
              <span className="text-violet-400 font-semibold">{obstacles.length}</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Добавляйте визуальные блоки — текст документа будет огибать их в реальном времени.
            </p>

            {/* Add buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleAddObstacle('image')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-violet-950/50 border border-violet-500/30 text-xs text-violet-300 hover:bg-violet-900/50 transition-colors font-mono"
                title="Добавить медиа-изображение"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px]">Медиа</span>
              </button>
              <button
                onClick={() => handleAddObstacle('quote')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-900/50 transition-colors font-mono"
                title="Добавить цитату-стикер"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px]">Цитата</span>
              </button>
              <button
                onClick={() => handleAddObstacle('badge')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-amber-950/50 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-900/50 transition-colors font-mono"
                title="Добавить инфо-бейдж"
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px]">Бейдж</span>
              </button>
            </div>

            {/* Obstacle List */}
            {obstacles.length > 0 && (
              <div className="space-y-2.5">
                {obstacles.map((obs) => (
                  <div
                    key={obs.id}
                    className={`p-3 rounded-xl border text-xs font-mono space-y-2 ${kindColor[obs.kind]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        {obs.kind === 'image' ? '🖼' : obs.kind === 'quote' ? '💬' : '⚡'}
                        <input
                          type="text"
                          value={obs.label}
                          onChange={(e) => handleUpdateObstacle(obs.id, { label: e.target.value })}
                          className="bg-black/40 border border-white/20 rounded px-1.5 py-0.5 text-white w-28 focus:outline-none focus:border-violet-400 text-xs"
                          title="Текст на наклейке"
                        />
                      </span>
                      <button
                        onClick={() => handleRemoveObstacle(obs.id)}
                        className="text-zinc-400 hover:text-rose-400 p-1"
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px] text-zinc-300">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Ширина</span>
                          <span className="text-violet-300 font-bold">{obs.width}px</span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="260"
                          value={obs.width}
                          onChange={(e) => handleUpdateObstacle(obs.id, { width: Number(e.target.value) })}
                          className="w-full accent-violet-400 h-1 bg-zinc-800 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Высота</span>
                          <span className="text-violet-300 font-bold">{obs.height}px</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={obs.height}
                          onChange={(e) => handleUpdateObstacle(obs.id, { height: Number(e.target.value) })}
                          className="w-full accent-violet-400 h-1 bg-zinc-800 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleResetPreset}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono border border-white/10 rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Пресет
                  </button>
                  <button
                    onClick={handleClearObstacles}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-mono"
                  >
                    <Trash2 className="w-3 h-3" />
                    Очистить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gap Slider */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Отступ (Gap)</span>
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

          {/* Snippet Shortcuts */}
          <div className="pt-2 border-t border-white/10">
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
          <div className="pt-2 border-t border-white/10">
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
        </aside>

        {/* ── Center: Editor + Preview ────────────────────────────── */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">
          {/* Text Editor Pane */}
          <div className="flex flex-col h-full bg-[#0c0c10]">
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-violet-400" />
                <span>Текст документа</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {content.length} симв. | {content.split(/\s+/).filter(Boolean).length} слов
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст... Он будет огибать препятствия на холсте справа."
              className="flex-1 w-full p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[380px]"
              spellCheck={false}
            />
          </div>

          {/* Live Preview Pane */}
          <div className="flex flex-col h-full bg-zinc-950/70 p-5 overflow-y-auto">
            {/* Top Controls */}
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
                  <span>Formatted</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 hover:bg-white/10 transition-colors"
                  title="Экспорт Pretext-макета в PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>

                <button
                  onClick={handleExportHTML}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-pink-300 hover:bg-white/10 transition-colors"
                  title="Экспорт Pretext-макета в HTML"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>HTML</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 transition-colors"
                  title="Копировать текст"
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
            <div ref={containerRef} className="flex-1 flex items-start justify-center min-h-[400px]">
              {activeTab === 'flow' ? (
                <div className="w-full relative border border-violet-500/30 rounded-3xl p-5 bg-zinc-900/50 backdrop-blur-md shadow-2xl min-h-[420px] overflow-hidden">
                  {/* Info bar */}
                  <div className="text-[11px] font-mono text-zinc-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3 h-3 text-violet-400" />
                      <span>Тяните препятствия мышкой — текст огибает в реальном времени</span>
                    </span>
                    <span className="text-emerald-400 font-bold">120 FPS</span>
                  </div>

                  {/* Obstacle type legend */}
                  <div className="flex items-center gap-3 mb-2 text-[10px] font-mono">
                    <span className="text-violet-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />🖼 Медиа</span>
                    <span className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-500 inline-block" />💬 Цитата</span>
                    <span className="text-amber-400 flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500 inline-block" />⚡ Бейдж</span>
                  </div>

                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="block w-full cursor-grab active:cursor-grabbing touch-none"
                    style={{ height: '400px' }}
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
