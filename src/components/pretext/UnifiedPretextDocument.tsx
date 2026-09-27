'use client';

import React, { useState } from 'react';
import {
  RotateCw,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  AlertCircle,
  Sparkles,
  BarChart3,
  AlignLeft,
  AlignRight,
  Circle,
  Square,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { DocumentType } from '@/types';
import { PretextObstacle, ObstacleTheme } from '../editor/types';
import { THEME_COLORS, getObstacleIcon } from '../editor/utils/canvasUtils';
import PretextRenderer from './PretextRenderer';

export interface UnifiedPretextDocumentProps {
  content: string;
  obstacles: PretextObstacle[];
  gap?: number;
  docType: DocumentType;
  cardSide?: 'front' | 'back';
  activeSlideIndex?: number;
  slidesCount?: number;
  onToggleCardSide?: () => void;
  onSlideChange?: (index: number) => void;
  onUpdateObstacle?: (id: string, updates: Partial<PretextObstacle>) => void;
  onRemoveObstacle?: (id: string) => void;
  isInteractive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const UnifiedPretextDocument: React.FC<UnifiedPretextDocumentProps> = ({
  content,
  obstacles,
  gap = 14,
  docType,
  cardSide = 'front',
  activeSlideIndex = 0,
  slidesCount = 1,
  onToggleCardSide,
  onSlideChange,
  onUpdateObstacle,
  onRemoveObstacle,
  isInteractive = true,
  className = '',
  style,
}) => {
  const [hoveredObsId, setHoveredObsId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [draggingObsId, setDraggingObsId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Filter obstacles relevant to current context
  const activeObstacles = obstacles.filter((obs) => {
    if (docType === 'card' && obs.cardSide && obs.cardSide !== 'both') {
      return obs.cardSide === cardSide;
    }
    if (docType === 'slide' && obs.slideIndex !== undefined) {
      return obs.slideIndex === activeSlideIndex;
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleObstaclePointerDown = (e: React.PointerEvent, obs: PretextObstacle) => {
    if (!isInteractive) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDraggingObsId(obs.id);
    setDragOffset({ x: x - obs.x, y: y - obs.y });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    e.stopPropagation();
  };

  const handleObstaclePointerMove = (e: React.PointerEvent) => {
    if (!draggingObsId || !onUpdateObstacle) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetObs = activeObstacles.find((o) => o.id === draggingObsId);
    if (!targetObs) return;

    const newX = Math.max(0, Math.min(container.clientWidth - targetObs.width, x - dragOffset.x));
    const newY = Math.max(0, Math.min(container.clientHeight - targetObs.height, y - dragOffset.y));

    onUpdateObstacle(draggingObsId, { x: newX, y: newY });
  };

  const handleObstaclePointerUp = (e: React.PointerEvent) => {
    if (draggingObsId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingObsId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handleObstaclePointerMove}
      onPointerUp={handleObstaclePointerUp}
      className={`relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-zinc-950/80 border border-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        minHeight: '440px',
        ...style,
      }}
    >
      {/* Document Top Bar with Type Badge & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10 select-none">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-violet-950/60 border border-violet-500/40 text-violet-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            {docType === 'card' ? '3D Флэшкарта' : docType === 'slide' ? 'Презентационный Слайд' : 'Интерактивная Шпаргалка'}
          </span>

          {docType === 'card' && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
              {cardSide === 'front' ? 'Лицевая сторона' : 'Обратная сторона'}
            </span>
          )}

          {docType === 'slide' && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
              Слайд {activeSlideIndex + 1} из {slidesCount}
            </span>
          )}
        </div>

        {/* Quick Actions (Flip Card or Slide Nav) */}
        <div className="flex items-center gap-2">
          {docType === 'card' && onToggleCardSide && (
            <button
              onClick={onToggleCardSide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
              title="Перевернуть карточку"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Перевернуть</span>
            </button>
          )}

          
        </div>
      </div>

      {/* Main Flow Content with Absolute Positioned Draggable Stickers */}
      <div className="relative text-zinc-100 text-sm leading-relaxed overflow-hidden min-h-[360px]">
        {/* Render Floating Geometric Obstacles & Stickers */}
        {activeObstacles.map((obs) => {
          const themeKey = obs.theme || (obs.kind === 'badge' ? 'amber' : obs.kind === 'quote' ? 'cyan' : 'violet');
          const theme = THEME_COLORS[themeKey] || THEME_COLORS.violet;
          const isCircle = obs.shape === 'circle';
          const isHovered = hoveredObsId === obs.id;
          const isDragging = draggingObsId === obs.id;

          const absStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${obs.x}px`,
            top: `${obs.y}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`,
            borderRadius: isCircle ? '9999px' : '16px',
            borderColor: isDragging ? '#e879f9' : theme.border,
            boxShadow: `0 0 28px ${theme.border}35, inset 0 0 15px ${theme.border}15`,
            touchAction: 'none',
            cursor: 'grab',
            zIndex: isDragging ? 50 : 10,
          };

          return (
            <div
              key={obs.id}
              style={absStyle}
              onPointerDown={(e) => handleObstaclePointerDown(e, obs)}
              onMouseEnter={() => isInteractive && setHoveredObsId(obs.id)}
              onMouseLeave={() => isInteractive && setHoveredObsId(null)}
              className="absolute select-none overflow-hidden group/obs transition-shadow duration-300 flex flex-col items-center justify-center p-3 text-center border backdrop-blur-md"
            >
              {/* Sticker Background Fill */}
              <div
                className="absolute inset-0 pointer-events-none opacity-90 transition-opacity"
                style={{ backgroundColor: theme.fill }}
              />

              {/* Holographic Subtle Grid */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`,
                  backgroundSize: '12px 12px',
                }}
              />

              {/* Image Kind */}
              {obs.kind === 'image' && obs.imageSrc ? (
                <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden rounded-inherit">
                  <img
                    src={obs.imageSrc}
                    alt={obs.label}
                    className="w-full h-full object-cover rounded-inherit"
                  />
                  {obs.label && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md py-1 px-2 text-[10px] font-mono font-bold text-white truncate text-center">
                      {obs.label}
                    </div>
                  )}
                </div>
              ) : (
                /* Non-Image or Placeholder */
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-2 h-full w-full">
                  <span className="text-2xl mb-1 filter drop-shadow-sm transition-transform group-hover/obs:scale-110">
                    {getObstacleIcon(obs.kind)}
                  </span>
                  <div
                    className="text-xs font-mono font-bold tracking-tight line-clamp-2 px-1"
                    style={{ color: theme.text }}
                  >
                    {obs.label || 'Стикер Pretext'}
                  </div>
                  {obs.sublabel && (
                    <div className="text-[10px] font-mono text-zinc-400 line-clamp-1 mt-0.5">
                      {obs.sublabel}
                    </div>
                  )}
                </div>
              )}

              {/* Hover Overlay Controls (Shape Switch, Delete) */}
              {isInteractive && isHovered && onUpdateObstacle && onRemoveObstacle && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-1.5 p-2 rounded-inherit animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    {/* Switch Shape Circle / Rect */}
                    <button
                      onClick={() =>
                        onUpdateObstacle(obs.id, {
                          shape: isCircle ? 'rect' : 'circle',
                        })
                      }
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                      title={isCircle ? 'Сделать прямоугольным' : 'Сделать круглым'}
                    >
                      {isCircle ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onRemoveObstacle(obs.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs transition-colors"
                      title="Удалить стикер"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {obs.width}×{obs.height}px · Перетащите мышкой
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Render Formatted Markdown Content */}
        <div className="pretext-markdown-stream text-zinc-200">
          <PretextRenderer content={content} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedPretextDocument;
