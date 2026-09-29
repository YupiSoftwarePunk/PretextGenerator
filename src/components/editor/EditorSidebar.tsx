import React from 'react';
import {
  Move,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  RotateCcw,
  Trash2,
  Heading,
  Bold,
  Italic,
  Quote,
} from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { ObstacleKind, PretextObstacle } from './types';
import { getTemplatesByType } from '@/lib/templates';

interface EditorSidebarProps {
  docType: DocumentType;
  onTypeChange: (newType: DocumentType) => void;
  obstacles: PretextObstacle[];
  onAddObstacle: (kind: ObstacleKind) => void;
  onRemoveObstacle: (id: string) => void;
  onUpdateObstacle: (id: string, updates: Partial<PretextObstacle>) => void;
  onClearObstacles: () => void;
  onResetPreset: () => void;
  gap: number;
  onGapChange: (newGap: number) => void;
  onInsertSnippet: (snippet: string) => void;
  onSelectTemplate: (template: Template) => void;
}

const kindColor: Record<ObstacleKind, string> = {
  image: 'text-violet-400 border-violet-500/40 bg-violet-950/50',
  quote: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/50',
  badge: 'text-amber-400 border-amber-500/40 bg-amber-950/50',
};

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  docType,
  onTypeChange,
  obstacles,
  onAddObstacle,
  onRemoveObstacle,
  onUpdateObstacle,
  onClearObstacles,
  onResetPreset,
  gap,
  onGapChange,
  onInsertSnippet,
  onSelectTemplate,
}) => {
  return (
    <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950/60 p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto shrink-0 max-h-[calc(100vh-7.5rem)] lg:max-h-none">
      {/* Document type */}
      <div>
        <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block font-mono">
          Формат документа
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['slide', 'card', 'cheatsheet'] as DocumentType[]).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={`py-2.5 px-2 rounded-xl text-xs font-medium font-mono transition-all border min-h-[40px] flex items-center justify-center ${
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
            onClick={() => onAddObstacle('image')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-violet-950/50 border border-violet-500/30 text-xs text-violet-300 hover:bg-violet-900/50 transition-colors font-mono min-h-[44px]"
            title="Добавить медиа-изображение"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[10px]">Медиа</span>
          </button>
          <button
            onClick={() => onAddObstacle('quote')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"
            title="Добавить цитату-стикер"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px]">Цитата</span>
          </button>
          <button
            onClick={() => onAddObstacle('badge')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-amber-950/50 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-900/50 transition-colors font-mono min-h-[44px]"
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
                      onChange={(e) => onUpdateObstacle(obs.id, { label: e.target.value })}
                      className="bg-black/40 border border-white/20 rounded px-2 py-1 text-white w-28 focus:outline-none focus:border-violet-400 text-xs min-h-[30px]"
                      title="Текст на наклейке"
                    />
                  </span>
                  <button
                    onClick={() => onRemoveObstacle(obs.id)}
                    className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
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
                      onChange={(e) => onUpdateObstacle(obs.id, { width: Number(e.target.value) })}
                      className="w-full accent-violet-400 h-2 bg-zinc-800 rounded cursor-pointer"
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
                      onChange={(e) => onUpdateObstacle(obs.id, { height: Number(e.target.value) })}
                      className="w-full accent-violet-400 h-2 bg-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onResetPreset}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono border border-white/10 rounded-lg min-h-[38px]"
              >
                <RotateCcw className="w-3 h-3" />
                Пресет
              </button>
              <button
                onClick={onClearObstacles}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors font-mono min-h-[38px]"
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
          <span className="text-zinc-400">Отступ</span>
          <span className="text-cyan-400 font-bold">{gap} px</span>
        </div>
        <input
          type="range"
          min="6"
          max="32"
          value={gap}
          onChange={(e) => onGapChange(Number(e.target.value))}
          className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
        />
      </div>

      {/* Snippet Shortcuts */}
      <div className="pt-2 border-t border-white/10">
        <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2.5 block font-mono">
          Быстрые сниппеты
        </label>
        <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => onInsertSnippet('# Заголовок')}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5 min-h-[40px]"
            title="Заголовок H1"
          >
            <Heading className="w-3.5 h-3.5 text-violet-400" />
            <span>H1</span>
          </button>
          <button
            onClick={() => onInsertSnippet('**Важный текст**')}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5 min-h-[40px]"
            title="Жирный"
          >
            <Bold className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => onInsertSnippet('*Курсив*')}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5 min-h-[40px]"
            title="Курсив"
          >
            <Italic className="w-3.5 h-3.5 text-pink-400" />
          </button>
          <button
            onClick={() => onInsertSnippet('> Цитата-вынос')}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1 border border-white/5 min-h-[40px]"
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
              onClick={() => onSelectTemplate(tpl)}
              className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/40 hover:bg-white/10 transition-all group min-h-[44px]"
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
  );
};
