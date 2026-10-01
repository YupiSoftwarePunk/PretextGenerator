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
  Upload,
  Palette,
  Sparkles,
} from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { ObstacleKind, PretextObstacle, ObstacleTheme } from './types';
import { getTemplatesByType, getReadmeTemplates } from '@/lib/templates';

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
  onUploadImageFile: (file: File) => void;
  onReplaceImageFile: (id: string, file: File) => void;
  cardSide?: 'front' | 'back';
  onCardSideChange?: (side: 'front' | 'back') => void;
  activeSlideIndex?: number;
  slidesCount?: number;
  onSlideChange?: (index: number) => void;
  onAddSlide?: () => void;
}

const kindColor: Record<ObstacleKind, string> = {
  image: 'text-violet-400 border-violet-500/40 bg-violet-950/50',
  quote: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/50',
  badge: 'text-amber-400 border-amber-500/40 bg-amber-950/50',
};

const THEMES: { id: ObstacleTheme; label: string; color: string }[] = [
  { id: 'violet', label: 'Фиолетовая', color: '#c084fc' },
  { id: 'emerald', label: 'Имрумдная', color: '#4ade80' },
  { id: 'amber', label: 'Янтарная', color: '#f59e0b' },
  { id: 'cyan', label: 'Неоново-синяя', color: '#22d3ee' },
  { id: 'dark', label: 'Строгая темная', color: '#71717a' },
  { id: 'neon', label: 'Яркая градиентная', color: '#e879f9' },
];

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
  onUploadImageFile,
  onReplaceImageFile,
  cardSide,
  onCardSideChange,
  activeSlideIndex,
  slidesCount,
  onSlideChange,
  onAddSlide,
}) => {
  const readmeTpls = getReadmeTemplates();

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

      {/* Contextual template tools */}
      {docType === 'card' && onCardSideChange && (
        <div className="p-3 bg-violet-950/30 border border-violet-500/30 rounded-2xl space-y-2">
          <span className="text-xs font-mono font-bold text-violet-300 block">Сторона карточки (Flashcard)</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCardSideChange('front')}
              className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                cardSide === 'front'
                  ? 'bg-violet-600 border-violet-400 text-white shadow'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Лицевая (Front)
            </button>
            <button
              onClick={() => onCardSideChange('back')}
              className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                cardSide === 'back'
                  ? 'bg-violet-600 border-violet-400 text-white shadow'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              Обратная (Back)
            </button>
          </div>
        </div>
      )}

      {docType === 'slide' && onSlideChange && onAddSlide && (
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300">Навигация по слайдам</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {(activeSlideIndex || 0) + 1} из {slidesCount || 1}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSlideChange((activeSlideIndex || 0) - 1)}
              disabled={(activeSlideIndex || 0) === 0}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              ◀ Назад
            </button>
            <button
              onClick={() => onSlideChange((activeSlideIndex || 0) + 1)}
              disabled={(activeSlideIndex || 0) >= (slidesCount || 1) - 1}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              Вперед ▶
            </button>
          </div>
          <button
            onClick={onAddSlide}
            className="w-full py-2 px-3 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-xs text-cyan-200 hover:bg-cyan-600/50 transition-all font-mono flex items-center justify-center gap-1.5"
          >
            <span>+ Новый слайд (---)</span>
          </button>
        </div>
      )}

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
          Добавляйте визуальные блоки и картинки — текст документа будет огибать их в реальном времени.
        </p>

        {/* Add buttons & Upload button */}
        <div className="grid grid-cols-4 gap-1.5">
          <label
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl bg-violet-950/60 border border-violet-500/40 text-xs text-violet-300 hover:bg-violet-900/50 transition-colors font-mono min-h-[44px] cursor-pointer"
            title="Загрузить картинку с ПК"
          >
            <Upload className="w-4 h-4 text-violet-400" />
            <span className="text-[9px]">Файл</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadImageFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </label>
          <button
            onClick={() => onAddObstacle('image')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-300 hover:bg-violet-900/50 transition-colors font-mono min-h-[44px]"
            title="Добавить пустой медиа-блок"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[9px]">Медиа</span>
          </button>
          <button
            onClick={() => onAddObstacle('quote')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"
            title="Добавить цитату-стикер"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px]">Цитата</span>
          </button>
          <button
            onClick={() => onAddObstacle('badge')}
            className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl bg-amber-950/50 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-900/50 transition-colors font-mono min-h-[44px]"
            title="Добавить инфо-бейдж"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[9px]">Бейдж</span>
          </button>
        </div>

        <button
          onClick={() => onAddObstacle('badge')}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/40 text-xs text-violet-200 hover:bg-violet-600/40 transition-all font-mono flex items-center justify-center gap-1.5 min-h-[38px] shadow-lg shadow-violet-900/20"
        >
          <Palette className="w-3.5 h-3.5 text-violet-400" />
          <span>+ Создать карточку</span>
        </button>

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
                    {obs.kind === 'image' ? (obs.imageSrc ? '🖼📁' : '🖼') : obs.kind === 'quote' ? '💬' : '⚡'}
                    <input
                      type="text"
                      value={obs.label}
                      onChange={(e) => onUpdateObstacle(obs.id, { label: e.target.value })}
                      className="bg-black/40 border border-white/20 rounded px-2 py-1 text-white w-28 focus:outline-none focus:border-violet-400 text-xs min-h-[30px]"
                      title="Подпись препятствия"
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

                {/* Image upload / preview if image kind */}
                {obs.kind === 'image' && (
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    {obs.imageSrc && (
                      <div className="relative rounded overflow-hidden border border-violet-500/30 bg-black/40 h-16">
                        <img src={obs.imageSrc} alt={obs.label} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-1 w-full py-1.5 px-2 bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 rounded text-[10px] cursor-pointer transition-colors border border-violet-500/40 font-mono">
                      <Upload className="w-3 h-3" />
                      <span>{obs.imageSrc ? 'Заменить файл с ПК' : 'Выбрать картинку с ПК'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            onReplaceImageFile(obs.id, e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* Color Theme Selector */}
                <div className="pt-1 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Тема / Палитра:</span>
                    <span className="text-violet-300 capitalize">{obs.theme || 'violet'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {THEMES.map((thm) => (
                      <button
                        key={thm.id}
                        onClick={() => onUpdateObstacle(obs.id, { theme: thm.id })}
                        className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${
                          (obs.theme || 'violet') === thm.id ? 'scale-110 ring-2 ring-white/80 border-white' : 'opacity-70 hover:opacity-100 border-white/10'
                        }`}
                        style={{ backgroundColor: thm.color }}
                        title={thm.label}
                      />
                    ))}
                  </div>
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

      {/* Media Manager (Files & Images) */}
      {obstacles.some((o) => o.kind === 'image') && (
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
              Медиа-менеджер
            </span>
            <span className="text-violet-400 font-semibold">
              {obstacles.filter((o) => o.kind === 'image').length}
            </span>
          </div>

          <div className="space-y-2">
            {obstacles
              .filter((o) => o.kind === 'image')
              .map((obs) => (
                <div key={obs.id} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  {obs.imageSrc ? (
                    <img
                      src={obs.imageSrc}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border border-violet-500/30 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-violet-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-zinc-200 truncate">{obs.label || 'Без названия'}</div>
                    <div className="flex gap-1 mt-1 text-[9px] font-mono">
                      <button
                        onClick={() => onUpdateObstacle(obs.id, { x: 20 })}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-violet-600/40 text-zinc-300 hover:text-white"
                        title="Выровнять влево"
                      >
                        Слева
                      </button>
                      <button
                        onClick={() => onUpdateObstacle(obs.id, { x: 150 })}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-violet-600/40 text-zinc-300 hover:text-white"
                        title="Выровнять по центру"
                      >
                        Центр
                      </button>
                      <button
                        onClick={() => onUpdateObstacle(obs.id, { x: 280 })}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-violet-600/40 text-zinc-300 hover:text-white"
                        title="Выровнять вправо"
                      >
                        Справа
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveObstacle(obs.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Удалить файл"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

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
          README Сниппеты
        </label>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => onInsertSnippet('# Заголовок H1')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1.5 border border-white/5 min-h-[38px]"
          >
            <span>📄 Заголовок H1</span>
          </button>
          <button
            onClick={() => onInsertSnippet('- Маркированный пункт списка')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1.5 border border-white/5 min-h-[38px]"
          >
            <span>📋 Список</span>
          </button>
          <button
            onClick={() => onInsertSnippet('1. Нумерованный пункт')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1.5 border border-white/5 min-h-[38px]"
          >
            <span>🔢 Нумерация</span>
          </button>
          <button
            onClick={() => onInsertSnippet('```ts\nconst pretext = "120 FPS";\n```')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-1.5 border border-white/5 min-h-[38px]"
          >
            <span>💻 Блок кода</span>
          </button>
          <button
            onClick={() => onInsertSnippet('> [!NOTE]\n> Важная информация по архитектуре проекта.')}
            className="p-2 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 flex items-center justify-center gap-1.5 border border-cyan-500/30 min-h-[38px]"
          >
            <span>📝 Callout Note</span>
          </button>
          <button
            onClick={() => onInsertSnippet('> [!WARNING]\n> Требует внимания разработчика.')}
            className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 flex items-center justify-center gap-1.5 border border-amber-500/30 min-h-[38px]"
          >
            <span>⚠️ Callout Warn</span>
          </button>
          <button
            onClick={() => onInsertSnippet('[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)')}
            className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 flex items-center justify-center gap-1.5 border border-emerald-500/30 min-h-[38px]"
          >
            <span>🛡️ Tech Badge</span>
          </button>
          <button
            onClick={() => onInsertSnippet('**Жирный** и *курсив* текст')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-pink-300 flex items-center justify-center gap-1.5 border border-white/5 min-h-[38px]"
          >
            <span>✨ Акцент</span>
          </button>
        </div>
      </div>

      {/* Professional README Templates */}
      <div className="pt-2 border-t border-white/10">
        <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>README Шаблоны</span>
        </label>
        <div className="space-y-2">
          {readmeTpls.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              className="w-full text-left p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-900/30 transition-all group min-h-[44px]"
            >
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-violet-300">
                {tpl.name}
              </div>
              <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Templates */}
      <div className="pt-2 border-t border-white/10">
        <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block font-mono">
          Базовые пресеты
        </label>
        <div className="space-y-2">
          {getTemplatesByType(docType)
            .filter((t) => !t.id.startsWith('readme-'))
            .map((tpl) => (
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
