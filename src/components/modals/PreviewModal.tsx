'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Grid3x3, Moon, Sparkles, Download } from 'lucide-react';

type BackgroundType = 'dark' | 'pitch-black' | 'neon-grid';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
  children: React.ReactNode;
  title?: string;
}

const backgrounds: { type: BackgroundType; label: string; icon: typeof Grid3x3; style: string }[] = [
  {
    type: 'dark',
    label: 'Dark',
    icon: Moon,
    style: 'bg-[#09090B]',
  },
  {
    type: 'pitch-black',
    label: 'Pitch Black',
    icon: Moon,
    style: 'bg-black',
  },
  {
    type: 'neon-grid',
    label: 'Neon Grid',
    icon: Grid3x3,
    style: 'bg-[#09090B]',
  },
];

export default function PreviewModal({ isOpen, onClose, onExport, children, title }: PreviewModalProps) {
  const [background, setBackground] = useState<BackgroundType>('dark');
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentBg = backgrounds.find(b => b.type === background);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/80"
      onClick={handleBackgroundClick}
    >
      {/* Modal container */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="glass-card rounded-t-2xl px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">
                {title || 'Предпросмотр'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Background switcher */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                {backgrounds.map((bg) => {
                  const Icon = bg.icon;
                  return (
                    <button
                      key={bg.type}
                      onClick={() => setBackground(bg.type)}
                      className={`
                        p-1.5 rounded transition-all duration-200
                        ${background === bg.type
                          ? 'bg-violet-500/30 text-violet-300'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }
                      `}
                      title={bg.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-zinc-400 min-w-[3ch] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Export button */}
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-gradient-to-r from-violet-500/20 to-cyan-500/20
                    border border-violet-500/30
                    hover:from-violet-500/30 hover:to-cyan-500/30
                    hover:border-violet-500/50
                    transition-all duration-300
                    text-sm font-medium text-white"
                >
                  <Download className="w-4 h-4" />
                  Экспорт
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div
          className={`
            flex-1 relative overflow-auto rounded-b-2xl
            ${currentBg?.style}
          `}
        >
          {/* Neon grid overlay */}
          {background === 'neon-grid' && (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Content with zoom */}
          <div className="flex items-center justify-center min-h-full p-12">
            <div
              ref={contentRef}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
