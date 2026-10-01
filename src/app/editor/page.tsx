'use client';

import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Code, Sliders, Eye } from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { PretextEngine, WordLayoutItem } from '@/lib/PretextEngine';
import { Header } from '@/components/layout/Header';
import { PretextObstacle, ObstacleKind } from '../../components/editor/types';
import { PRESETS } from '../../components/editor/constants';
import { drawObstacleOnCanvas, buildExportHTML } from '../../components/editor/utils/canvasUtils';
import { EditorSidebar } from '../../components/editor/EditorSidebar';
import { TextEditorPane } from '@/components/editor/TextEditorPane';
import { PreviewPane } from '@/components/editor/PreviewPane';
import jsPDF from 'jspdf';

function EditorContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as DocumentType) || 'slide';

  const [docType, setDocType] = useState<DocumentType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('pretext_active_doc');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.type) return parsed.type;
        }
      } catch (e) {
        console.error('Failed to load active doc type', e);
      }
    }
    return initialType;
  });

  const [content, setContent] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('pretext_active_doc');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.content) return parsed.content;
        }
      } catch (e) {
        console.error('Failed to load active doc content', e);
      }
    }
    const preset = PRESETS[initialType];
    return preset.text;
  });

  useEffect(() => {
    try {
      if (localStorage.getItem('pretext_active_doc')) {
        localStorage.removeItem('pretext_active_doc');
      }
    } catch (e) {
      console.error('Failed to clean active doc key', e);
    }
  }, []);

  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'editor' | 'settings' | 'preview'>('editor');
  const [activeTab, setActiveTab] = useState<'flow' | 'card'>('flow');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [gap, setGap] = useState<number>(14);

  const [sidebarWidth, setSidebarWidth] = useState<number>(320);
  const [editorRatio, setEditorRatio] = useState<number>(0.5);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingEditor = useRef(false);

  const [obstacles, setObstacles] = useState<PretextObstacle[]>(() => {
    const preset = PRESETS[initialType];
    return preset.obstacles.map((o, i) => ({ ...o, id: `obs_${Date.now()}_${i}` }));
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
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
      const padding = window.innerWidth < 640 ? 32 : 48;
      const w = containerRef.current.clientWidth - padding;
      containerWidthRef.current = Math.max(220, w);
    }
  }, []);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [updateContainerWidth]);

  useEffect(() => {
    if (mobileWorkspaceTab === 'preview') {
      setTimeout(updateContainerWidth, 60);
    }
  }, [mobileWorkspaceTab, updateContainerWidth]);

  const handleSidebarResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleEditorResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isResizingEditor.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isResizingSidebar.current && workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const relativeX = e.clientX - rect.left;
          const newWidth = Math.max(200, Math.min(relativeX, 600));
          setSidebarWidth(newWidth);
          updateContainerWidth();
        }
      } else if (isResizingEditor.current && mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const relativeX = e.clientX - rect.left;
          const newRatio = Math.max(0.15, Math.min(relativeX / rect.width, 0.85));
          setEditorRatio(newRatio);
          updateContainerWidth();
        }
      }
    };

    const handlePointerUp = () => {
      if (isResizingSidebar.current || isResizingEditor.current) {
        isResizingSidebar.current = false;
        isResizingEditor.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [updateContainerWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      updateContainerWidth();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateContainerWidth]);

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
      const currentHeight = window.innerWidth < 640 ? 350 : 400;
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

      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#e4e4e7';
      ctx.textBaseline = 'alphabetic';

      for (let i = 0; i < layoutItems.length; i++) {
        const item = layoutItems[i];
        ctx.fillText(item.word, item.x, item.y);
      }

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

    const canvasHeight = window.innerWidth < 640 ? 340 : 390;
    const newX = Math.max(0, Math.min(currentWidth - targetObs.width, px - dragOffsetRef.current.x));
    const newY = Math.max(0, Math.min(canvasHeight - targetObs.height, py - dragOffsetRef.current.y));

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

  const handleExportPNG = () => {
    if (activeTab !== 'flow') {
      setActiveTab('flow');
    }
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        alert('Холст не найден. Переключитесь на вкладку Pretext Flow для экспорта.');
        return;
      }
      try {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `pretext_${docType}_${Date.now()}.png`;
        a.click();
      } catch (e) {
        console.error('Export PNG failed:', e);
        alert('Ошибка экспорта в PNG: ' + e);
      }
    }, 120);
  };

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

  const handleExportPDF = () => {
    if (activeTab !== 'flow') {
      setActiveTab('flow');
    }
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        alert('Холст не найден. Переключитесь на вкладку Pretext Flow для экспорта.');
        return;
      }
      try {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [imgWidth, imgHeight],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`pretext_${docType}_${Date.now()}.pdf`);
      } catch (e) {
        console.error('Export PDF failed:', e);
        alert('Ошибка экспорта в PDF: ' + e);
      }
    }, 120);
  };

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

  const handleUploadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || 200;
        const naturalH = img.naturalHeight || 200;
        const maxW = 200;
        const scale = naturalW > maxW ? maxW / naturalW : 1;
        const w = Math.round(naturalW * scale);
        const h = Math.round(naturalH * scale);

        const newObs: PretextObstacle = {
          id: `obs_${Date.now()}`,
          kind: 'image',
          label: file.name.substring(0, 24),
          x: Math.floor(Math.random() * 120) + 40,
          y: Math.floor(Math.random() * 100) + 40,
          width: w,
          height: h,
          shape: 'rect',
          gap,
          imageSrc: dataUrl,
        };
        const updated = [...obstaclesRef.current, newObs];
        obstaclesRef.current = updated;
        setObstacles(updated);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceImageFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || 200;
        const naturalH = img.naturalHeight || 200;
        const maxW = 200;
        const scale = naturalW > maxW ? maxW / naturalW : 1;
        const w = Math.round(naturalW * scale);
        const h = Math.round(naturalH * scale);

        const updated = obstaclesRef.current.map((o) => {
          if (o.id !== id) return o;
          return {
            ...o,
            imageSrc: dataUrl,
            label: file.name.substring(0, 24),
            width: w,
            height: h,
          };
        });
        obstaclesRef.current = updated;
        setObstacles(updated);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleUploadImageFile(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex flex-col pt-16 overflow-hidden">
        <div className="lg:hidden flex items-center bg-zinc-950/95 border-b border-white/10 px-3 py-2 gap-1.5 shrink-0 z-20 backdrop-blur-xl">
          <button
            onClick={() => setMobileWorkspaceTab('editor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-mono font-semibold min-h-[42px] transition-all border ${
              mobileWorkspaceTab === 'editor'
                ? 'bg-violet-600/30 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-violet-400" />
            <span>Редактор</span>
          </button>

          <button
            onClick={() => setMobileWorkspaceTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-mono font-semibold min-h-[42px] transition-all border ${
              mobileWorkspaceTab === 'settings'
                ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Настройки</span>
            {obstacles.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">
                {obstacles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileWorkspaceTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-mono font-semibold min-h-[42px] transition-all border ${
              mobileWorkspaceTab === 'preview'
                ? 'bg-pink-600/30 border-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span>Превью</span>
          </button>
        </div>

        <div ref={workspaceRef} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div
            style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
            className={`${
              mobileWorkspaceTab === 'settings' ? 'flex' : 'hidden lg:flex'
            } w-full lg:w-[var(--sidebar-width)] shrink-0 h-full overflow-hidden flex-col`}
          >
            <EditorSidebar
              docType={docType}
              onTypeChange={handleTypeChange}
              obstacles={obstacles}
              onAddObstacle={handleAddObstacle}
              onRemoveObstacle={handleRemoveObstacle}
              onUpdateObstacle={handleUpdateObstacle}
              onClearObstacles={handleClearObstacles}
              onResetPreset={handleResetPreset}
              gap={gap}
              onGapChange={setGap}
              onInsertSnippet={handleInsertSnippet}
              onSelectTemplate={handleSelectTemplate}
              onUploadImageFile={handleUploadImageFile}
              onReplaceImageFile={handleReplaceImageFile}
            />
          </div>

          <div
            onPointerDown={handleSidebarResizeStart}
            className="hidden lg:flex w-1.5 hover:w-2 bg-white/10 hover:bg-violet-500/50 active:bg-violet-500 cursor-col-resize shrink-0 transition-all items-center justify-center z-20 group select-none"
          >
            <div className="w-0.5 h-8 bg-white/20 group-hover:bg-white/80 rounded-full transition-colors" />
          </div>

          <main
            ref={mainRef}
            className={`${
              mobileWorkspaceTab !== 'settings' ? 'flex' : 'hidden lg:flex'
            } flex-1 flex-col lg:flex-row overflow-hidden`}
          >
            <div
              style={{ '--editor-width': `${editorRatio * 100}%` } as React.CSSProperties}
              className={`${
                mobileWorkspaceTab === 'editor' ? 'flex' : 'hidden lg:flex'
              } w-full lg:w-[var(--editor-width)] h-full overflow-hidden flex-col`}
            >
              <TextEditorPane
                content={content}
                onChange={setContent}
                mobileVisible={mobileWorkspaceTab === 'editor'}
              />
            </div>

            <div
              onPointerDown={handleEditorResizeStart}
              className="hidden lg:flex w-1.5 hover:w-2 bg-white/10 hover:bg-pink-500/50 active:bg-pink-500 cursor-col-resize shrink-0 transition-all items-center justify-center z-20 group select-none"
            >
              <div className="w-0.5 h-8 bg-white/20 group-hover:bg-white/80 rounded-full transition-colors" />
            </div>

            <div
              className={`${
                mobileWorkspaceTab === 'preview' ? 'flex' : 'hidden lg:flex'
              } flex-1 h-full overflow-hidden flex-col`}
            >
              <PreviewPane
                mobileVisible={mobileWorkspaceTab === 'preview'}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onExportPNG={handleExportPNG}
                onExportHTML={handleExportHTML}
                onExportPDF={handleExportPDF}
                onCopy={handleCopy}
                copied={copied}
                onSave={handleSaveToLocalStorage}
                savedSuccess={savedSuccess}
                containerRef={containerRef}
                cardContainerRef={cardContainerRef}
                canvasRef={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                content={content}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            </div>
          </main>
        </div>
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