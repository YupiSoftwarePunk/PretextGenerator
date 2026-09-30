import React, { RefObject } from 'react';
import {
  Layers,
  Eye,
  Download,
  FileCode,
  Copy,
  Check,
  Save,
  Move,
} from 'lucide-react';
import PretextRenderer from '@/components/pretext/PretextRenderer';

interface PreviewPaneProps {
  mobileVisible: boolean;
  activeTab: 'flow' | 'card';
  setActiveTab: (tab: 'flow' | 'card') => void;
  onExportPNG: () => void;
  onExportHTML: () => void;
  onCopy: () => void;
  copied: boolean;
  onSave: () => void;
  savedSuccess: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  content: string;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  mobileVisible,
  activeTab,
  setActiveTab,
  onExportPNG,
  onExportHTML,
  onCopy,
  copied,
  onSave,
  savedSuccess,
  containerRef,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  content,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      className={`${
        mobileVisible ? 'flex' : 'hidden'
      } lg:flex flex-col h-full bg-zinc-950/70 p-4 sm:p-5 overflow-y-auto min-h-[calc(100vh-7.5rem)] lg:min-h-0`}
    >
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all min-h-[36px] ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all min-h-[36px] ${
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 hover:bg-white/10 transition-colors min-h-[36px]"
            title="Экспорт Pretext-макета в PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>

          <button
            onClick={onExportHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-pink-300 hover:bg-white/10 transition-colors min-h-[36px]"
            title="Экспорт Pretext-макета в HTML"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>

          <button
            onClick={onCopy}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 transition-colors min-h-[36px]"
            title="Копировать текст"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all min-h-[36px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Сохранено!' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      {/* Renderer Stage */}
      <div className="flex-1 flex items-start justify-center min-h-[360px]">
        {activeTab === 'flow' ? (
          <div
            ref={containerRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="w-full relative border border-violet-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-zinc-900/50 backdrop-blur-md shadow-2xl min-h-[380px] sm:min-h-[420px] overflow-hidden"
          >
            {/* Info bar */}
            <div className="text-[11px] font-mono text-zinc-500 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Move className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="truncate">Тяните препятствия или перетащите картинку (Drag-and-Drop)</span>
              </span>
            </div>

            {/* Obstacle type legend */}
            <div className="flex items-center gap-3 mb-2 text-[10px] font-mono">
              <span className="text-violet-400 flex items-center gap-1">🖼 Медиа / Картинка</span>
              <span className="text-cyan-400 flex items-center gap-1">💬 Цитата</span>
              <span className="text-amber-400 flex items-center gap-1">⚡ Бейдж</span>
            </div>

            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="block w-full cursor-grab active:cursor-grabbing touch-none select-none"
              style={{ height: '350px' }}
            />
          </div>
        ) : (
          <div className="w-full glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 max-w-lg shadow-2xl">
            <PretextRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
};

